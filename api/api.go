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

	log.Fatal(http.ListenAndServe(":"+port, nil))
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

	Status        bool      `json:"status"`
	TrainingTimer time.Time `json:"timer"`
	WPM           int       `json:"wpm"`
	Accuracy      int       `json:"accuracy"`

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
	session.TrainingTimer = time.Now()

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
