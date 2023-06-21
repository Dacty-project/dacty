package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var collection *mongo.Collection

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	port := os.Getenv("PORT")

	mongoURI := os.Getenv("MONGO_URI")
	dbName := os.Getenv("DB_NAME")
	collectionName := os.Getenv("COLLECTION_NAME")

	// Create MongoDB client
	client, err := mongo.NewClient(options.Client().ApplyURI(mongoURI))
	if err != nil {
		log.Fatal("Failed to create MongoDB client:", err)
	}

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Access the specified database and collection
	db := client.Database(dbName)
	collection = db.Collection(collectionName)

	fmt.Println("Starting Dacty API Server on port : ", port)

	http.HandleFunc("/status", getStatus)
	http.HandleFunc("/version", getVersion)
	http.HandleFunc("/training/create", createTrainingSession)
	http.HandleFunc("/training/reset", resetTrainingSession)
	http.HandleFunc("/training/finish", endTrainingSession)

	// Create a new CORS handler
	corsHandler := cors.Default().Handler(http.DefaultServeMux)

	log.Fatal(http.ListenAndServe(":"+port, corsHandler))
}

// Get server status (Ok)
func getStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("OK"))
}

// Get Server version (v + $VERSION)
func getVersion(w http.ResponseWriter, r *http.Request) {
	version := os.Getenv("VERSION")

	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("v" + version))
}

type Session struct {
	ID primitive.ObjectID `bson:"_id,omitempty" json:"id"`

	UserName string `json:"user"`

	Status        bool   `json:"status"`
	TrainingTimer string `json:"timer"`
	WPM           int    `json:"wpm"`
	Accuracy      int    `json:"accuracy"`

	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
}

func createTrainingSession(w http.ResponseWriter, r *http.Request) {
	// Read the request body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	// Unmarshal the JSON data into a Session struct
	var session Session
	err = json.Unmarshal(body, &session)
	if err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Assign data to the session
	session.Timestamp = time.Now()
	session.Status = false
	session.WPM = 0
	session.Accuracy = 0
	session.TrainingTimer = "00:00:00"

	// Insert the session into MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.InsertOne(ctx, session)
	if err != nil {
		http.Error(w, "Failed to save session", http.StatusInternalServerError)
		return
	}

	// Get the inserted session ID
	sessionID := result.InsertedID.(primitive.ObjectID)

	// Send a response
	response := map[string]string{
		"message": "Session created and saved successfully",
		"id":      sessionID.Hex(),
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Failed to create response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}

func resetTrainingSession(w http.ResponseWriter, r *http.Request) {
	// Read the request body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	// Unmarshal the JSON data into a Session struct
	var session Session
	err = json.Unmarshal(body, &session)
	if err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Retrieve the session ID from the request body
	sessionID := session.ID

	// Reset the training session in the database
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.D{
		{"$set", bson.D{
			{"status", false},
			{"trainingtimer", "00:00:00"},
			{"timestamp", time.Now()},
			{"wpm", 0},
			{"accuracy", 0},
		}},
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": sessionID}, update)
	if err != nil {
		http.Error(w, "Failed to reset session", http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"message": "Session reset successfully",
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Failed to create response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}

func endTrainingSession(w http.ResponseWriter, r *http.Request) {
	// Read the request body
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	// Unmarshal the JSON data into a Session struct
	var session Session
	err = json.Unmarshal(body, &session)
	if err != nil {
		http.Error(w, "Failed to parse request body", http.StatusBadRequest)
		return
	}

	// Retrieve the session ID from the request body
	sessionID := session.ID

	// Update the training session in the database to mark it as completed
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.D{
		{"$set", bson.D{
			{"status", true},
			{"trainingtimer", session.TrainingTimer},
			{"wpm", session.WPM},
			{"accuracy", session.Accuracy},
		}},
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": sessionID}, update)
	if err != nil {
		http.Error(w, "Failed to end session", http.StatusInternalServerError)
		return
	}

	// Send a response indicating the session was completed
	response := map[string]string{
		"message": "Session completed successfully",
	}
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, "Failed to create response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}
