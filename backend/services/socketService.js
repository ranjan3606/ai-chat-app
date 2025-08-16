const { Server } = require('socket.io');
const admin = require('firebase-admin');
const { validateMessage } = require('../utils/validation');
const { getAIResponse } = require('./aiService');
const { saveMessage, getRecentHistory } = require('./dualChatService');

let io = null;
const connectedUsers = new Map();

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      socket.userId = decodedToken.uid;
      socket.userEmail = decodedToken.email;
      
      next();
      
    } catch (error) {
      console.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userEmail}`);

    connectedUsers.set(socket.userId, socket.id);

    socket.join(`user_${socket.userId}`);

    socket.emit('connected', {
      message: 'Connected to real-time chat',
      userId: socket.userId,
      timestamp: new Date().toISOString()
    });

    socket.on('send_message', async (data) => {
      try {
        const { message } = data;

        const validation = validateMessage(message);
        if (!validation.isValid) {
          socket.emit('error', {
            type: 'VALIDATION_ERROR',
            message: validation.errors.join(', ')
          });
          return;
        }

        const userMessage = validation.trimmedMessage;
        const userId = socket.userId;

        socket.emit('ai_typing', { typing: true });

        try {
          const conversationHistory = await getRecentHistory(userId, 10);

          const aiResult = await getAIResponse(userMessage, conversationHistory);
          const aiResponse = aiResult.text;

          const [userMessageDoc, aiMessageDoc] = await Promise.all([
            saveMessage(userId, userMessage, 'user'),
            saveMessage(userId, aiResponse, 'assistant')
          ]);

          socket.emit('message_sent', {
            id: userMessageDoc.id,
            text: userMessage,
            role: 'user',
            timestamp: userMessageDoc.timestamp,
            status: 'sent'
          });

          socket.emit('ai_typing', { typing: false });

          socket.emit('ai_response', {
            id: aiMessageDoc.id,
            text: aiResponse,
            role: 'assistant',
            timestamp: aiMessageDoc.timestamp,
            status: 'delivered',
            provider: aiResult.provider,
            model: aiResult.model
          });

        } catch (error) {
          console.error('Error processing message:', error);

          socket.emit('ai_typing', { typing: false });
          
          socket.emit('error', {
            type: 'MESSAGE_ERROR',
            message: 'Failed to process your message. Please try again.'
          });
        }

      } catch (error) {
        console.error('Socket message error:', error);
        socket.emit('error', {
          type: 'SOCKET_ERROR',
          message: 'An error occurred while processing your message'
        });
      }
    });

    socket.on('typing', (data) => {
      socket.to(`user_${socket.userId}`).emit('user_typing', {
        userId: socket.userId,
        typing: data.typing
      });
    });

    socket.on('mark_read', async (data) => {
      try {
        const { messageId } = data;

        socket.emit('message_read', {
          messageId,
          readAt: new Date().toISOString()
        });
        
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.userEmail}, Reason: ${reason}`);
      connectedUsers.delete(socket.userId);
    });

    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.userEmail}:`, error);
    });
  });

  return io;
};

const getSocketServer = () => {
  return io;
};

const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

const getOnlineUsersCount = () => {
  return connectedUsers.size;
};

const sendToUser = (userId, event, data) => {
  if (io && connectedUsers.has(userId)) {
    io.to(`user_${userId}`).emit(event, data);
    return true;
  }
  return false;
};

const broadcastToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getSocketServer,
  isUserOnline,
  getOnlineUsersCount,
  sendToUser,
  broadcastToAll
};