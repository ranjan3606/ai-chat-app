# AI Chat Application

A full-stack AI chat application with React Native frontend and Node.js backend.

## Project Structure

```
ai-chat-application/
├── backend/          # Node.js API server
├── frontend/         # React Native mobile app
└── README.md         # This file
```

## Features

- **Mobile App**: React Native with Expo
- **Authentication**: Firebase Auth
- **AI Integration**: OpenAI & Google Gemini
- **Real-time Chat**: Socket.IO
- **State Management**: Redux Toolkit
- **Cross-platform**: iOS, Android, Web

## Complete Setup Guide

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- Firebase account
- OpenAI API account
- Google AI Studio account (for Gemini)

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
4. Generate service account key:
   - Go to Project Settings > Service accounts
   - Click "Generate new private key"
   - Download and save as `backend/firebase-service-account-key.json`
5. Get your project configuration for mobile app

### 2. API Keys Setup
- **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Gemini**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp env.example .env
# Edit .env with your credentials:
# PORT=3000
# FIREBASE_PROJECT_ID=your-project-id
# OPENAI_API_KEY=your-openai-key
# GEMINI_API_KEY=your-gemini-key

# Add Firebase service account key
# Place firebase-service-account-key.json in backend folder

npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install

# Update Firebase config in your app if needed
# Backend should be running on localhost:3000

npm start
```

### 5. Running the Application
1. Start backend server: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Use Expo Go app to scan QR code or run on simulator

## Environment Variables

### Backend (.env)
```env
PORT=3000
FIREBASE_PROJECT_ID=your-firebase-project-id
OPENAI_API_KEY=sk-your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGIN=*
```

### Firebase Service Account
Place your Firebase service account JSON file as:
```
backend/firebase-service-account-key.json
```

## Troubleshooting

### Common Issues
1. **Firebase Auth Error**: Check service account key path and permissions
2. **API Key Issues**: Verify OpenAI/Gemini API keys are valid
3. **Connection Issues**: Ensure backend is running on correct port
4. **Expo Issues**: Clear cache with `expo start -c`

### Port Configuration
- Backend runs on port 3000 by default
- Frontend connects to localhost:3000
- Update backend URL in frontend if using different port

## Tech Stack

**Backend:**
- Express.js
- Firebase Admin SDK
- Socket.IO
- OpenAI & Gemini APIs

**Frontend:**
- React Native
- Expo
- Redux Toolkit
- React Navigation
- Socket.IO Client
