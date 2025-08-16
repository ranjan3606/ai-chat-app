import { useState, useEffect } from 'react';
import { chatHistoryService } from '../services/chatHistoryService';

export default function useChatHistory() {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const chats = await chatHistoryService.getChatHistory();
      setChatHistory(chats || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setChatHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await chatHistoryService.deleteChat(chatId);
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const clearAllChats = async () => {
    try {
      await chatHistoryService.clearAllChats();
      setChatHistory([]);
    } catch (error) {
      console.error('Error clearing all chats:', error);
    }
  };

  const cleanupDuplicates = async () => {
    try {
      await chatHistoryService.cleanupDuplicateChats();
      await loadChatHistory();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  useEffect(() => {
    loadChatHistory();
    cleanupDuplicates();
  }, []);

  return {
    chatHistory,
    loading,
    loadChatHistory,
    deleteChat,
    clearAllChats,
    cleanupDuplicates
  };
}
