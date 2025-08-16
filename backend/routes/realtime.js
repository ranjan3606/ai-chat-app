const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/errorHandler');
const { getOnlineUsersCount, isUserOnline, sendToUser, broadcastToAll } = require('../services/socketService');
const { getProvidersStatus } = require('../config/aiProviders');

const router = express.Router();

router.get('/status', (req, res) => {
  const providersStatus = getProvidersStatus();
  
  res.json({
    success: true,
    data: {
      onlineUsers: getOnlineUsersCount(),
      aiProviders: {
        available: providersStatus.available,
        primary: providersStatus.primary,
        providers: providersStatus.providers
      },
      socketEnabled: true,
      timestamp: new Date().toISOString()
    }
  });
});

router.get('/user-status/:userId', authenticateToken, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  res.json({
    success: true,
    data: {
      userId,
      isOnline: isUserOnline(userId),
      timestamp: new Date().toISOString()
    }
  });
}));

router.post('/broadcast', authenticateToken, asyncHandler(async (req, res) => {
  const { message, type = 'info' } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Message is required'
    });
  }

  const broadcastData = {
    type,
    message,
    from: 'system',
    timestamp: new Date().toISOString()
  };

  broadcastToAll('system_message', broadcastData);

  res.json({
    success: true,
    message: 'Broadcast sent successfully',
    data: broadcastData
  });
}));

router.post('/send-to-user', authenticateToken, asyncHandler(async (req, res) => {
  const { userId, message, type = 'notification' } = req.body;
  
  if (!userId || !message) {
    return res.status(400).json({
      success: false,
      error: 'userId and message are required'
    });
  }

  const messageData = {
    type,
    message,
    from: req.user.uid,
    timestamp: new Date().toISOString()
  };

  const sent = sendToUser(userId, 'direct_message', messageData);

  res.json({
    success: true,
    message: sent ? 'Message sent successfully' : 'User is offline',
    data: {
      ...messageData,
      delivered: sent
    }
  });
}));

module.exports = router;
