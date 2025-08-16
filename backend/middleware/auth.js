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
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (idTokenError) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(token);
        
        if (decoded && decoded.uid) {
          const userRecord = await admin.auth().getUser(decoded.uid);
          decodedToken = {
            uid: userRecord.uid,
            email: userRecord.email,
            email_verified: userRecord.emailVerified
          };
        } else {
          throw new Error('Invalid custom token structure');
        }
      } catch (customTokenError) {
        console.error('Both ID token and custom token verification failed:', {
          idTokenError: idTokenError.message,
          customTokenError: customTokenError.message
        });
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
