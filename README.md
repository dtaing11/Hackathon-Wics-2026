# Flock Finder : The Lovers
# Members
Dina Tiang
Lily Holliday
Calvin Gavin
Hudson Vu
Daniel Guo

# About Our Software
BirdWatch is a mobile application built with **React Native** that allows bird watchers to capture snapshots of birds, identify their species, and build a personal bird collection. 
The app combines image recognition, rarity ranking, and gamification to make bird photography more interactive and rewarding.

When a user captures or uploads a bird photo, the app uses our **in-house trained machine learning model** based on **ResNet18** to recognize the bird species. 
After prediction, the system evaluates how rare that species is, especially relative to the user’s area, and awards a score. 
This creates a game-like collection experience where users are encouraged to discover and capture more unique birds.

## Platforms Tested on
- MacOS
- Android
- iOS
- Windows

# How to Run Dev and Test Environment

### Downloading Dependencies
Run Docker build

## Commands
Describe how the commands and process to launch the project on the main branch in such a way that anyone working on the project knows how to check the affects of any code they add.
```
cd Frontend/BirdGo
npm ci
cd /ios
Run pod install
cd ..
npx react-native run-ios --device
```
