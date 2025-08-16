

class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleFirebaseAuthError = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return {
        statusCode: 404,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      };
    
    case 'auth/wrong-password':
    case 'auth/invalid-password':
      return {
        statusCode: 401,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      };
    
    case 'auth/email-already-exists':
      return {
        statusCode: 400,
        message: 'Email already exists',
        code: 'EMAIL_EXISTS'
      };
    
    case 'auth/invalid-email':
      return {
        statusCode: 400,
        message: 'Invalid email format',
        code: 'INVALID_EMAIL'
      };
    
    case 'auth/weak-password':
      return {
        statusCode: 400,
        message: 'Password is too weak',
        code: 'WEAK_PASSWORD'
      };
    
    case 'auth/id-token-expired':
      return {
        statusCode: 401,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      };
    
    case 'auth/id-token-revoked':
      return {
        statusCode: 401,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      };
    
    case 'auth/invalid-id-token':
      return {
        statusCode: 401,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      };
    
    default:
      return {
        statusCode: 500,
        message: 'Authentication error',
        code: 'AUTH_ERROR'
      };
  }
};

const handleFirestoreError = (error) => {
  switch (error.code) {
    case 'permission-denied':
      return {
        statusCode: 403,
        message: 'Permission denied',
        code: 'PERMISSION_DENIED'
      };
    
    case 'not-found':
      return {
        statusCode: 404,
        message: 'Document not found',
        code: 'DOCUMENT_NOT_FOUND'
      };
    
    case 'already-exists':
      return {
        statusCode: 409,
        message: 'Document already exists',
        code: 'DOCUMENT_EXISTS'
      };
    
    case 'resource-exhausted':
      return {
        statusCode: 429,
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED'
      };
    
    case 'unavailable':
      return {
        statusCode: 503,
        message: 'Service temporarily unavailable',
        code: 'SERVICE_UNAVAILABLE'
      };
    
    default:
      return {
        statusCode: 500,
        message: 'Database error',
        code: 'DATABASE_ERROR'
      };
  }
};

const globalErrorHandler = (err, req, res, next) => {
  console.error('Global error handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  }
  else if (err.code && err.code.startsWith('auth/')) {
    const firebaseError = handleFirebaseAuthError(err);
    statusCode = firebaseError.statusCode;
    message = firebaseError.message;
    code = firebaseError.code;
  }
  else if (err.code && (err.code.includes('permission-denied') || err.code.includes('not-found'))) {
    const firestoreError = handleFirestoreError(err);
    statusCode = firestoreError.statusCode;
    message = firestoreError.message;
    code = firestoreError.code;
  }
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    code = 'VALIDATION_ERROR';
  }
  res.status(statusCode).json({
    error: message,
    code: code,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  AppError,
  handleFirebaseAuthError,
  handleFirestoreError,
  globalErrorHandler,
  asyncHandler,
  notFoundHandler
};
