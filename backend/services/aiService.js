const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const axios = require('axios');
const { 
  AI_PROVIDERS, 
  getAvailableProviders, 
  getProviderConfig, 
  getSystemPrompt,
  isProviderAvailable 
} = require('../config/aiProviders');

let openaiClient = null;
let geminiClient = null;

const initializeAIClients = () => {
  try {
    const openaiConfig = getProviderConfig(AI_PROVIDERS.OPENAI);
    if (isProviderAvailable(AI_PROVIDERS.OPENAI)) {
      openaiClient = new OpenAI({ apiKey: openaiConfig.apiKey });
    }
    const geminiConfig = getProviderConfig(AI_PROVIDERS.GEMINI);
    if (isProviderAvailable(AI_PROVIDERS.GEMINI)) {
      geminiClient = new GoogleGenerativeAI(geminiConfig.apiKey);
    }
    
  } catch (error) {
    console.error('AI clients setup failed:', error);
  }
};

const mockResponses = {
  greeting: [
    "Hello! I'm your AI assistant. This is a mock response for development.",
    "Hi there! I'm running in mock mode right now. How can I help you?",
    "Hey! I'm a mock AI assistant. What would you like to chat about?"
  ],
  
  question: [
    "That's an interesting question! I'm a mock AI, so I can't give you a real answer right now.",
    "I'd love to help with that! Currently running in mock mode for development.",
    "Great question! This is a simulated response since no AI API is configured."
  ],
  
  general: [
    "That's interesting! I'm a mock AI assistant for development purposes.",
    "I see what you mean. Currently providing simulated responses.",
    "Thanks for sharing! This is a mock response while in development mode."
  ]
};

const generateMockResponse = (userMessage) => {
  const message = userMessage.toLowerCase();

  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return mockResponses.greeting[Math.floor(Math.random() * mockResponses.greeting.length)];
  }

  if (message.includes('?') || message.includes('what') || message.includes('how')) {
    return mockResponses.question[Math.floor(Math.random() * mockResponses.question.length)];
  }

  return mockResponses.general[Math.floor(Math.random() * mockResponses.general.length)];
};

const getOpenAIResponse = async (userMessage, conversationHistory = []) => {
  if (!openaiClient) throw new Error('OpenAI client not initialized');
  
  const config = getProviderConfig(AI_PROVIDERS.OPENAI);
  
  const messages = [{ role: "system", content: getSystemPrompt() }];
  
  if (conversationHistory.length > 0) {
    conversationHistory.slice(-10).forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });
  }
  
  messages.push({ role: "user", content: userMessage });
  
  const completion = await openaiClient.chat.completions.create({
    model: config.defaultModel,
    messages: messages,
    max_tokens: config.maxTokens,
    temperature: config.temperature
  });
  
  return completion.choices[0]?.message?.content?.trim();
};

const getGeminiResponse = async (userMessage, conversationHistory = []) => {
  const config = getProviderConfig(AI_PROVIDERS.GEMINI);
  if (!config.apiKey) throw new Error('Gemini API key not configured');
  
  let fullPrompt = getSystemPrompt() + "\n\n";
  
  if (conversationHistory.length > 0) {
    fullPrompt += "Conversation history:\n";
    conversationHistory.slice(-10).forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
    });
    fullPrompt += "\n";
  }
  
  fullPrompt += `User: ${userMessage}\nAssistant:`;

  const requestBody = {
    contents: [{ parts: [{ text: fullPrompt }] }]
  };
  
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.defaultModel}:generateContent`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': config.apiKey
      }
    }
  );
  
  const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!generatedText) {
    throw new Error('No response generated from Gemini API');
  }
  
  return generatedText.trim();
};

const getAIResponse = async (userMessage, conversationHistory = [], preferredProvider = null) => {
  const availableProviders = getAvailableProviders();

  const providersToTry = preferredProvider && availableProviders.includes(preferredProvider) 
    ? [preferredProvider, ...availableProviders.filter(p => p !== preferredProvider)]
    : availableProviders;
  
  for (const provider of providersToTry) {
    try {
      let response;
      
      switch (provider) {
        case AI_PROVIDERS.OPENAI:
          response = await getOpenAIResponse(userMessage, conversationHistory);
          break;
          
        case AI_PROVIDERS.GEMINI:
          response = await getGeminiResponse(userMessage, conversationHistory);
          break;
          
        case AI_PROVIDERS.MOCK:
        default:
          response = generateMockResponse(userMessage);
          break;
      }
      
      if (response && response.length > 0) {
        return {
          text: response,
          provider: provider,
          model: getProviderConfig(provider).defaultModel
        };
      }
      
    } catch (error) {
      console.error(`Error with ${provider}:`, error.message);
      continue;
    }
  }

  return {
    text: generateMockResponse(userMessage),
    provider: AI_PROVIDERS.MOCK,
    model: 'mock-v1'
  };
};

const getAIServiceStatus = () => {
  return {
    availableProviders: getAvailableProviders(),
    clients: {
      openai: !!openaiClient,
      gemini: !!geminiClient
    },
    systemPrompt: getSystemPrompt()
  };
};

module.exports = {
  initializeAIClients,
  getAIResponse,
  generateMockResponse,
  getAIServiceStatus,
  getOpenAIResponse,
  getGeminiResponse
};