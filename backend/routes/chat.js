const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateMessage } = require('../utils/validation');
const { asyncHandler, AppError } = require('../utils/errorHandler');
const { getAIResponse } = require('../services/aiService');
const { saveMessage, getMessages, getRecentHistory, clearChatHistory, getChatStats, getStorageStatus } = require('../services/dualChatService');

const router = express.Router();

router.post('/', authenticateToken, asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user.uid;

  const validation = validateMessage(message);
  if (!validation.isValid) {
    throw new AppError(validation.errors.join(', '), 400, 'VALIDATION_ERROR');
  }

  const userMessage = validation.trimmedMessage;

  try {

    const conversationHistory = await getRecentHistory(userId, 10);

    const aiResult = await getAIResponse(userMessage, conversationHistory);
    const aiResponse = aiResult.text;

    const [userMessageDoc, aiMessageDoc] = await Promise.all([
      saveMessage(userId, userMessage, 'user'),
      saveMessage(userId, aiResponse, 'assistant')
    ]);

    res.json({
      success: true,
      message: 'Messages saved successfully',
      data: {
        userMessage: {
          id: userMessageDoc.id,
          text: userMessage,
          role: 'user',
          timestamp: userMessageDoc.timestamp
        },
        aiResponse: {
          id: aiMessageDoc.id,
          text: aiResponse,
          role: 'assistant',
          timestamp: aiMessageDoc.timestamp,
          provider: aiResult.provider,
          model: aiResult.model
        }
      }
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    throw new AppError('Failed to process chat message', 500, 'CHAT_ERROR');
  }
}));

router.get('/messages', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.uid;
  const { limit = 50, since } = req.query;

  try {

    let sinceDate = null;
    if (since) {
      const sinceTimestamp = parseInt(since);
      if (isNaN(sinceTimestamp)) {
        throw new AppError('Invalid since timestamp', 400, 'INVALID_TIMESTAMP');
      }
      sinceDate = new Date(sinceTimestamp);
    }

    const messageLimit = Math.min(parseInt(limit) || 50, 100);

    const messages = await getMessages(userId, messageLimit, sinceDate);

    res.json({
      success: true,
      data: {
        messages,
        count: messages.length,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    throw new AppError('Failed to fetch messages', 500, 'FETCH_MESSAGES_ERROR');
  }
}));

router.get('/history', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  try {
    const messages = await getMessages(userId, 50);

    res.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('Get history error:', error);
    throw new AppError('Failed to fetch chat history', 500, 'FETCH_HISTORY_ERROR');
  }
}));

router.delete('/messages', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  try {
    const deletedCount = await clearChatHistory(userId);

    res.json({
      success: true,
      message: `Cleared ${deletedCount} messages`,
      data: {
        deletedCount
      }
    });

  } catch (error) {
    console.error('Clear chat error:', error);
    throw new AppError('Failed to clear chat history', 500, 'CLEAR_CHAT_ERROR');
  }
}));

router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.uid;

  try {
    const stats = await getChatStats(userId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    throw new AppError('Failed to fetch chat statistics', 500, 'FETCH_STATS_ERROR');
  }
}));

router.get('/storage-status', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const storageStatus = getStorageStatus();
    
    res.json({
      success: true,
      data: storageStatus
    });
    
  } catch (error) {
    console.error('Get storage status error:', error);
    throw new AppError('Failed to get storage status', 500, 'STORAGE_STATUS_ERROR');
  }
}));

module.exports = router;
