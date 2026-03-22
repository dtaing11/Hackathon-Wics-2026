# BirdWatch Project Overview

## Introduction

BirdWatch is a mobile application built with **React Native** that allows bird watchers to capture snapshots of birds, identify their species, and build a personal bird collection. The app combines image recognition, rarity ranking, and gamification to make bird photography more interactive and rewarding.

When a user captures or uploads a bird photo, the app uses our **in-house trained machine learning model** based on **ResNet18** to recognize the bird species. After prediction, the system evaluates how rare that species is, especially relative to the user’s area, and awards a score. This creates a game-like collection experience where users are encouraged to discover and capture more unique birds.

---

## Core Features

### 1. Bird Snapshot and Upload
Users can take a picture of a bird or upload one from their device. The image is then sent to the backend for storage and prediction.

### 2. Species Recognition
The uploaded image is processed by our custom-trained **ResNet18** model, which predicts the bird species.

### 3. Bird Collection
Each successfully recognized bird is added to the user’s collection, allowing them to keep track of the species they have captured over time.

### 4. Rarity Ranking
The application ranks how rare the bird is, with special focus on the user’s geographic area. A bird that is uncommon in the user’s region may give a higher reward.

### 5. Gamified Scoring System
Users receive points based on the rarity and uniqueness of each bird they capture. This encourages continued engagement and exploration.

---

## System Architecture

Our backend is designed similarly to a **microservice architecture**, where responsibilities are split across multiple cloud services.

### Main Components

#### 1. Mobile Client
- Built with **React Native**
- Handles bird photo capture, upload, and displaying prediction results
- Shows user collection, rarity score, and progress

#### 2. Main Backend Server
- Built with **Java Spring Boot**
- Deployed on **Google Cloud Run**
- Responsible for:
  - receiving user requests
  - storing metadata
  - managing user collections and scores
  - coordinating with the prediction service

#### 3. Prediction Service
- Built with **Python + PyTorch**
- Also deployed on **Google Cloud Run**
- Responsible for:
  - loading the trained ResNet18 model
  - receiving image input
  - predicting bird species
  - returning prediction results to the main backend

#### 4. Model Storage
- Stored in **Google Cloud Storage**
- The PyTorch prediction service loads the trained model from cloud storage

#### 5. Image Storage
- Bird photos uploaded by users are stored in **Google Cloud Storage**

#### 6. Relational Database
- Metadata such as user data, bird captures, location data, scores, and collection history are stored in **Google Cloud SQL (PostgreSQL)**

---

## Machine Learning Component

The machine learning system is one of the key parts of the project.

### Model
- Architecture: **ResNet18**
- Framework: **PyTorch**
- Training: done **in-house**
- Purpose: classify bird images into species categories

### Prediction Flow
1. User uploads a bird image through the React Native app
2. The main Spring Boot backend stores the image in Google Cloud Storage
3. The backend sends the image reference or required payload to the Python prediction service
4. The prediction service loads the model and performs inference
5. The predicted species is returned to the main backend
6. The main backend calculates rarity and score
7. The final result is saved in Cloud SQL and returned to the app

---

## Data Flow

### Upload and Prediction Flow
1. User takes a bird photo in the mobile app
2. App sends the image and metadata to the Spring Boot backend
3. Backend stores the raw image in Google Cloud Storage
4. Backend records metadata in Google Cloud SQL
5. Backend sends the image to the Python ML prediction service
6. Prediction service runs inference using the ResNet18 model
7. Prediction result is returned to the backend
8. Backend computes rarity and scoring
9. Backend updates the database with species, rarity, and score
10. App displays the result to the user

---

## Example Responsibilities by Service

### React Native App
- UI for taking bird snapshots
- Viewing collection
- Showing rarity and score
- Displaying bird history and achievements

### Spring Boot Backend
- Authentication and user management
- Post creation and metadata handling
- Storage integration with Google Cloud Storage
- Database operations with PostgreSQL
- Communication with ML inference service
- Scoring and rarity business logic

### Python Prediction Service
- Model loading
- Image preprocessing
- Inference with ResNet18
- Returning species predictions

---

## Why This Architecture

This architecture allows the system to stay modular and scalable.

### Benefits
- **Separation of concerns**: the main backend and ML inference service are independent
- **Scalability**: prediction service can scale separately from the main API
- **Maintainability**: each service can be updated without tightly coupling all components
- **Cloud-native deployment**: Cloud Run makes deployment and scaling simpler
- **Efficient storage**: images and model artifacts are stored in Google Cloud Storage, while structured metadata is stored in PostgreSQL

---

## Technology Stack

### Frontend
- React Native

### Backend
- Java Spring Boot
- Python
- PyTorch

### Cloud Infrastructure
- Google Cloud Run
- Google Cloud Storage
- Google Cloud SQL (PostgreSQL)

### Machine Learning
- ResNet18
- Custom in-house training pipeline

---

## Future Improvements

- Add leaderboard and social competition features
- Improve rarity calculation with stronger geolocation and regional bird data
- Support confidence scores and top-k predictions
- Add offline caching for user collection viewing
- Expand the model to support more bird species
- Improve gamification with badges, streaks, and achievements

---

## Conclusion

BirdWatch is a smart bird-watching mobile application that combines **computer vision**, **cloud-native backend services**, and **gamification** into a single platform. With a **React Native frontend**, a **Spring Boot backend on Google Cloud Run**, a **PyTorch prediction microservice**, and **Google Cloud Storage + Cloud SQL**, the project provides a scalable foundation for recognizing birds, building collections, and rewarding users for discovering rare species in their local area.