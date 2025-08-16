const express = require('express');

const authRoutes = require('./auth');
const chatRoutes = require('./chat');
const realtimeRoutes = require('./realtime');
const aiRoutes = require('./ai');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Chat Backend is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

router.get('/', (req, res) => {
  res.json({
    name: 'AI Chat Backend API',
    version: '2.0.0',
    description: 'Backend API for AI Chat Mobile App',
    endpoints: {
      health: 'GET /health',
      auth: {
        signup: 'POST /auth/signup',
        login: 'POST /auth/login',
        logout: 'POST /auth/logout',
        me: 'GET /auth/me',
        verifyToken: 'POST /auth/verify-token'
      },
      chat: {
        sendMessage: 'POST /chat',
        getMessages: 'GET /chat/messages',
        getHistory: 'GET /chat/history',
        clearMessages: 'DELETE /chat/messages',
        getStats: 'GET /chat/stats',
        storageStatus: 'GET /chat/storage-status'
      },
      realtime: {
        status: 'GET /realtime/status',
        userStatus: 'GET /realtime/user-status/:userId',
        broadcast: 'POST /realtime/broadcast',
        sendToUser: 'POST /realtime/send-to-user'
      },
      ai: {
        providers: 'GET /ai/providers',
        test: 'POST /ai/test',
        mockTest: 'POST /ai/mock-test',
        health: 'GET /ai/health',
        models: 'GET /ai/models'
      }
    },
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/realtime', realtimeRoutes);
router.use('/ai', aiRoutes);

module.exports = router;