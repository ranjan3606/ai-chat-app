const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const { initializeFirebase } = require('./config/firebase');
const { initializeAIClients } = require('./services/aiService');
const { globalErrorHandler, notFoundHandler } = require('./utils/errorHandler');
const routes = require('./routes');
const { initializeSocket } = require('./services/socketService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const initializeServices = async () => {
  try {
    initializeFirebase();
    initializeAIClients();
    initializeSocket(server);
  } catch (error) {
    process.exit(1);
  }
};

const configureMiddleware = () => {
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
};

const configureRoutes = () => {
  app.use('/', routes);
  app.use('*', notFoundHandler);
  app.use(globalErrorHandler);
};

const startServer = async () => {
  try {
    
    await initializeServices();
    configureMiddleware();
    configureRoutes();
    server.listen(PORT, () => {
      console.log(`Running on: http://localhost:${PORT}`);
    });

    const gracefulShutdown = (signal) => {
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Server start failed:', error);
    process.exit(1);
  }
};
startServer();
module.exports = app;
