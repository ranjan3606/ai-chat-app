const admin = require('firebase-admin');
require('dotenv').config();

let firebaseApp = null;
let db = null;

const initializeFirebase = () => {
  try {
    if (firebaseApp) {
      return { app: firebaseApp, db };
    }
    let serviceAccount;
    try {
      serviceAccount = require('../firebase-service-account-key.json');
    } catch (error) {
      console.error('Firebase service account key not found. Please add firebase-service-account-key.json');
      throw new Error('Firebase service account key is required');
    }
    const config = {
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    };
    if (process.env.FIREBASE_DATABASE_URL) {
      config.databaseURL = process.env.FIREBASE_DATABASE_URL;
    }
    
    firebaseApp = admin.initializeApp(config);
    db = admin.firestore();
    
    return { app: firebaseApp, db };
    
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

const getFirebaseApp = () => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
};

const getFirestore = () => {
  if (!db) {
    throw new Error('Firestore not initialized. Call initializeFirebase() first.');
  }
  return db;
};

const getRealtimeDatabase = () => {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return admin.database();
};

module.exports = {
  initializeFirebase,
  getFirebaseApp,
  getFirestore,
  getRealtimeDatabase
};
