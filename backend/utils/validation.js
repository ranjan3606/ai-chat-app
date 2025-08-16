const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateMessage = (message) => {
  const errors = [];

  if (!message || typeof message !== 'string') {
    errors.push('Message is required');
    return { isValid: false, errors };
  }

  const trimmedMessage = message.trim();
  
  if (trimmedMessage.length === 0) {
    errors.push('Message cannot be empty');
  }

  if (trimmedMessage.length > 4000) {
    errors.push('Message must be less than 4000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    trimmedMessage
  };
};

const validateDisplayName = (displayName) => {
  const errors = [];

  if (displayName && typeof displayName !== 'string') {
    errors.push('Display name must be a string');
    return { isValid: false, errors };
  }

  if (displayName) {
    const trimmedName = displayName.trim();
    
    if (trimmedName.length > 50) {
      errors.push('Display name must be less than 50 characters');
    }

    if (trimmedName.length < 2) {
      errors.push('Display name must be at least 2 characters long');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    trimmedName: displayName?.trim()
  };
};

const validateUserRegistration = (userData) => {
  const { email, password, displayName } = userData;
  const allErrors = [];

  if (!isValidEmail(email)) {
    allErrors.push('Valid email is required');
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    allErrors.push(...passwordValidation.errors);
  }

  const nameValidation = validateDisplayName(displayName);
  if (!nameValidation.isValid) {
    allErrors.push(...nameValidation.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    validatedData: {
      email: email?.trim(),
      password,
      displayName: nameValidation.trimmedName
    }
  };
};

const validateUserLogin = (loginData) => {
  const { email, password } = loginData;
  const errors = [];

  if (!isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    validatedData: {
      email: email?.trim(),
      password
    }
  };
};

module.exports = {
  isValidEmail,
  validatePassword,
  validateMessage,
  validateDisplayName,
  validateUserRegistration,
  validateUserLogin
};