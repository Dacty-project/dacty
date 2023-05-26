import cv2
import mediapipe as mp

# Initialisation de Mediapipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)

# Capture vidéo en temps réel
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Conversion de l'image en RGB
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    # Détecter les mains
    results = hands.process(image)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            # Afficher les coordonnées des points clés des mains
            for idx, landmark in enumerate(hand_landmarks.landmark):
                print("Point clé:", idx)
                print("X:", landmark.x)
                print("Y:", landmark.y)
                print("Z:", landmark.z)

    # Afficher l'image avec les annotations
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    cv2.imshow('Hands Tracking', image)

    if cv2.waitKey(1) == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
