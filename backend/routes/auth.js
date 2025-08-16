const express = require('express');
const admin = require('firebase-admin');
const { authenticateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../utils/validation');
const { asyncHandler, AppError } = require('../utils/errorHandler');

const router = express.Router();

router.post('/signup', asyncHandler(async (req, res) => {
  const validation = validateUserRegistration(req.body);
  
  if (!validation.isValid) {
    throw new AppError(validation.errors.join(', '), 400, 'VALIDATION_ERROR');
  }

  const { email, password, displayName } = validation.validatedData;

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName || email.split('@')[0]
    });
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}));

router.post('/login', asyncHandler(async (req, res) => {
  const validation = validateUserLogin(req.body);
  
  if (!validation.isValid) {
    throw new AppError(validation.errors.join(', '), 400, 'VALIDATION_ERROR');
  }

  const { email } = validation.validatedData;

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
    
    res.json({
      success: true,
      message: 'Login successful',
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}));

router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  try {
    await admin.auth().revokeRefreshTokens(req.user.uid);
    
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    throw new AppError('Logout failed', 500, 'LOGOUT_ERROR');
  }
}));

router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const userRecord = await admin.auth().getUser(req.user.uid);
    
    res.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime
      }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    throw new AppError('Failed to get user information', 500, 'GET_USER_ERROR');
  }
}));

router.post('/verify-token', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    throw new AppError('Token is required', 400, 'MISSING_TOKEN');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    res.json({
      success: true,
      valid: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      }
    });
    
  } catch (error) {
    res.json({
      success: true,
      valid: false,
      error: 'Invalid token'
    });
  }
}));

module.exports = router;
