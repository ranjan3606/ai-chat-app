import { useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const API_BASE_URL = __DEV__ 
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')
  : 'https://your-production-api.com';

export default function useMessages(currentUser) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  
  const CHAT_CACHE_KEY = `chat_messages_${currentUser?.uid || 'anonymous'}`;

  const saveToCache = async (messages) => {
    try {
      await AsyncStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('❌ Error saving messages to cache:', error);
    }
  };

  const loadFromCache = async () => {
    try {
      const cachedMessages = await AsyncStorage.getItem(CHAT_CACHE_KEY);
      if (cachedMessages) {
        const parsedMessages = JSON.parse(cachedMessages);
        return parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading messages from cache:', error);
      return [];
    }
  };

  const loadMessages = async (isOnline) => {
    const cachedMessages = await loadFromCache();
    if (cachedMessages.length > 0) {
      setMessages(cachedMessages);
    }

    if (isOnline) {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/chat/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const serverMessages = data.data?.messages || data.messages || [];
          setMessages(serverMessages);
          await saveToCache(serverMessages);
        }
      } catch (error) {
        console.error('❌ Error loading messages from server:', error);
      }
    }
  };

  const sendMessage = async (messageText, isOnline, checkConnectivity) => {
    if (!messageText.trim() || loading) return;

    setLoading(true);
    
    const online = await checkConnectivity(true);
    
    if (!online) {
      Alert.alert(
        'No Internet Connection', 
        'You are currently offline. Please check your internet connection and try again.',
        [
          {
            text: 'Retry',
            onPress: async () => {
              const retryOnline = await checkConnectivity(true);
              if (retryOnline) {
                setTimeout(() => sendMessage(messageText, retryOnline, checkConnectivity), 500);
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      setLoading(false);
      return;
    }

    setAiTyping(true);

    const tempUserMessage = {
      id: `temp_${Date.now()}`,
      text: messageText,
      role: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    const updatedMessages = [...messages, tempUserMessage];
    setMessages(updatedMessages);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const userMessage = data.data.userMessage;
      const aiMessage = data.data.aiResponse;
      
      setTimeout(() => {
        setMessages(prevMessages => {
          const finalMessages = [
            ...prevMessages.map(msg => 
              msg.id === tempUserMessage.id 
                ? { ...msg, id: userMessage.id, status: 'sent' }
                : msg
            ),
            {
              id: aiMessage.id,
              text: aiMessage.text,
              role: aiMessage.role,
              timestamp: new Date(aiMessage.timestamp),
              provider: aiMessage.provider
            }
          ];
          
          saveToCache(finalMessages);
          return finalMessages;
        });
        
        setAiTyping(false);
      }, 800);
      
    } catch (error) {
      const isNetworkError = error.name === 'TypeError' || error.message.includes('fetch');
      
      if (isNetworkError) {
        Alert.alert(
          'Connection Lost', 
          'Unable to send message. Please check your internet connection and try again.',
          [
            {
              text: 'Retry',
              onPress: async () => {
                const retryOnline = await checkConnectivity(true);
                if (retryOnline) {
                  setTimeout(() => sendMessage(messageText, retryOnline, checkConnectivity), 500);
                }
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
      
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== tempUserMessage.id)
      );
      setAiTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = async (isOnline) => {
    setMessages([]);
    await saveToCache([]);
    
    if (isOnline) {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          await fetch(`${API_BASE_URL}/chat/messages`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } catch (error) {
      }
    }
  };

  return {
    messages,
    loading,
    aiTyping,
    loadMessages,
    sendMessage,
    clearMessages
  };
}
