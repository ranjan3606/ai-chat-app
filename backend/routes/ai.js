const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler, AppError } = require('../utils/errorHandler');
const { getProvidersStatus, AI_PROVIDERS } = require('../config/aiProviders');
const { getAIResponse, getAIServiceStatus } = require('../services/aiService');
const { validateMessage } = require('../utils/validation');

const router = express.Router();

router.get('/providers', (req, res) => {
  const status = getProvidersStatus();
  
  res.json({
    success: true,
    data: {
      ...status,
      supportedProviders: Object.values(AI_PROVIDERS),
      serviceStatus: getAIServiceStatus()
    }
  });
});

router.post('/test', authenticateToken, asyncHandler(async (req, res) => {
  const { message, provider } = req.body;
  const validation = validateMessage(message);
  if (!validation.isValid) {
    throw new AppError(validation.errors.join(', '), 400, 'VALIDATION_ERROR');
  }

  const userMessage = validation.trimmedMessage;
  
  try {
    const aiResult = await getAIResponse(userMessage, [], provider);
    
    res.json({
      success: true,
      data: {
        message: userMessage,
        response: aiResult.text,
        provider: aiResult.provider,
        model: aiResult.model,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('AI test error:', error);
    throw new AppError('Failed to get AI response', 500, 'AI_TEST_ERROR');
  }
}));

router.post('/mock-test', asyncHandler(async (req, res) => {
  const { message } = req.body;
  const validation = validateMessage(message);
  if (!validation.isValid) {
    throw new AppError(validation.errors.join(', '), 400, 'VALIDATION_ERROR');
  }

  const userMessage = validation.trimmedMessage;
  
  try {
    const aiResult = await getAIResponse(userMessage, [], AI_PROVIDERS.MOCK);
    
    res.json({
      success: true,
      data: {
        message: userMessage,
        response: aiResult.text,
        provider: aiResult.provider,
        model: aiResult.model,
        timestamp: new Date().toISOString(),
        note: 'This is a mock response for testing purposes'
      }
    });
    
  } catch (error) {
    console.error('Mock test error:', error);
    throw new AppError('Failed to get mock response', 500, 'MOCK_TEST_ERROR');
  }
}));

router.get('/health', (req, res) => {
  const serviceStatus = getAIServiceStatus();
  const providersStatus = getProvidersStatus();
  
  res.json({
    success: true,
    data: {
      healthy: providersStatus.available.length > 0,
      ...serviceStatus,
      availableCount: providersStatus.available.length,
      primaryProvider: providersStatus.primary,
      lastCheck: new Date().toISOString()
    }
  });
});

router.get('/models', (req, res) => {
  const providersStatus = getProvidersStatus();
  const models = {};
  
  Object.keys(providersStatus.providers).forEach(provider => {
    const providerInfo = providersStatus.providers[provider];
    if (providerInfo.available) {
      models[provider] = {
        name: providerInfo.name,
        models: providerInfo.models,
        defaultModel: providerInfo.defaultModel
      };
    }
  });
  
  res.json({
    success: true,
    data: {
      models,
      totalProviders: Object.keys(models).length,
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
