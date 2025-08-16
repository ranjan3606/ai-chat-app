require('dotenv').config();
const AI_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini', 
  CLAUDE: 'claude',
  COHERE: 'cohere',
  HUGGINGFACE: 'huggingface',
  OLLAMA: 'ollama',
  MOCK: 'mock'
};

const PROVIDER_CONFIG = {
  [AI_PROVIDERS.OPENAI]: {
    name: 'OpenAI GPT',
    apiKey: process.env.OPENAI_API_KEY,
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    defaultModel: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7
  },
  
  [AI_PROVIDERS.GEMINI]: {
    name: 'Google Gemini',
    apiKey: process.env.GEMINI_API_KEY,
    models: ['gemini-2.0-flash', 'gemini-pro', 'gemini-pro-vision'],
    defaultModel: 'gemini-2.0-flash',
    maxTokens: 1000,
    temperature: 0.7
  },
  
  [AI_PROVIDERS.CLAUDE]: {
    name: 'Anthropic Claude',
    apiKey: process.env.CLAUDE_API_KEY,
    models: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
    defaultModel: 'claude-3-haiku',
    maxTokens: 1000,
    temperature: 0.7
  },
  
  [AI_PROVIDERS.COHERE]: {
    name: 'Cohere',
    apiKey: process.env.COHERE_API_KEY,
    models: ['command', 'command-light', 'command-nightly'],
    defaultModel: 'command',
    maxTokens: 1000,
    temperature: 0.7
  },
  
  [AI_PROVIDERS.HUGGINGFACE]: {
    name: 'Hugging Face',
    apiKey: process.env.HUGGINGFACE_API_KEY,
    models: ['microsoft/DialoGPT-medium', 'facebook/blenderbot-400M-distill'],
    defaultModel: 'microsoft/DialoGPT-medium',
    maxTokens: 1000,
    temperature: 0.7
  },
  
  [AI_PROVIDERS.OLLAMA]: {
    name: 'Ollama (Local)',
    apiKey: null,
    endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
    models: ['llama2', 'codellama', 'mistral'],
    defaultModel: 'llama2',
    maxTokens: 1000,
    temperature: 0.7
  },
  
  [AI_PROVIDERS.MOCK]: {
    name: 'Mock AI (Development)',
    apiKey: null,
    models: ['mock-v1'],
    defaultModel: 'mock-v1',
    maxTokens: 1000,
    temperature: 0.7
  }
};

const getPreferredProviders = () => {
  const preferredOrder = process.env.AI_PROVIDER_ORDER || 'gemini,openai,claude,cohere,huggingface,ollama,mock';
  return preferredOrder.split(',').map(p => p.trim().toLowerCase());
};

const isProviderAvailable = (provider) => {
  const config = PROVIDER_CONFIG[provider];
  if (!config) return false;

  if (provider === AI_PROVIDERS.MOCK || provider === AI_PROVIDERS.OLLAMA) {
    return true;
  }

  return config.apiKey && 
         config.apiKey !== 'your_api_key_here' && 
         config.apiKey !== 'mock-key' &&
         config.apiKey.length > 10;
};

const getAvailableProviders = () => {
  const preferred = getPreferredProviders();
  const available = [];

  preferred.forEach(provider => {
    if (isProviderAvailable(provider)) {
      available.push(provider);
    }
  });

  if (!available.includes(AI_PROVIDERS.MOCK)) {
    available.push(AI_PROVIDERS.MOCK);
  }
  
  return available;
};

const getPrimaryProvider = () => {
  const available = getAvailableProviders();
  return available[0] || AI_PROVIDERS.MOCK;
};

const getProviderConfig = (provider) => {
  return PROVIDER_CONFIG[provider] || PROVIDER_CONFIG[AI_PROVIDERS.MOCK];
};

const getSystemPrompt = () => {
  return process.env.AI_SYSTEM_PROMPT || 
    "You are a helpful AI assistant in a mobile chat app. Be concise, friendly, and helpful. Keep responses under 500 characters when possible.";
};

const getProvidersStatus = () => {
  const status = {};
  
  Object.keys(PROVIDER_CONFIG).forEach(provider => {
    const config = PROVIDER_CONFIG[provider];
    status[provider] = {
      name: config.name,
      available: isProviderAvailable(provider),
      hasApiKey: !!config.apiKey,
      models: config.models,
      defaultModel: config.defaultModel
    };
  });
  
  return {
    providers: status,
    available: getAvailableProviders(),
    primary: getPrimaryProvider(),
    preferredOrder: getPreferredProviders()
  };
};

module.exports = {
  AI_PROVIDERS,
  PROVIDER_CONFIG,
  getPreferredProviders,
  isProviderAvailable,
  getAvailableProviders,
  getPrimaryProvider,
  getProviderConfig,
  getSystemPrompt,
  getProvidersStatus
};
