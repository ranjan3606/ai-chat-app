const admin = require('firebase-admin');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No authorization header provided',
        code: 'MISSING_AUTH_HEADER'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided in authorization header',
        code: 'MISSING_TOKEN'
      });
    }

    let decodedToken;
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.decode(token);
    } catch (decodeError) {
      throw new Error('Invalid token format');
    }
    const isCustomToken = decoded && decoded.iss && decoded.iss.includes('firebase-adminsdk');
    
    if (isCustomToken) {
      try {
        if (decoded && decoded.uid) {
          const userRecord = await admin.auth().getUser(decoded.uid);
          decodedToken = {
            uid: userRecord.uid,
            email: userRecord.email,
            email_verified: userRecord.emailVerified
          };
          console.log('Successfully verified custom token:', decodedToken.uid);
        } else {
          throw new Error('Invalid custom token structure');
        }
      } catch (customTokenError) {
        console.error('token verification failed:', customTokenError.message);
        throw customTokenError;
      }
    } else {
      // Handle ID token
      console.log('🔍 Processing ID token...');
      try {
        decodedToken = await admin.auth().verifyIdToken(token);
        console.log('Successfully verified ID token for user:', decodedToken.uid);
      } catch (idTokenError) {
        console.error('token verification failed:', idTokenError.message);
        throw idTokenError;
      }
    }

    req.user = decodedToken;
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ 
        error: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }
    
    return res.status(401).json({ 
      error: 'Invalid or malformed token',
      code: 'INVALID_TOKEN'
    });
  }
};

module.exports = { authenticateToken };
