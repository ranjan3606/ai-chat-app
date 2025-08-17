
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { 
  loginSuccess, 
  logout, 
  setLoading,
  addMessage,
  clearAllMessages,
  setAiTyping,
  setSending,
  setMessages,
  toggleTheme,
  setTheme,
  useLoginMutation,
  useSignupMutation,
  useSendMessageMutation,
  useGetMessagesQuery,
  useClearMessagesMutation,
} from './store';

export const useUser = () => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [loginAPI] = useLoginMutation();
  const [signupAPI] = useSignupMutation();



  const login = async (email, password) => {
    try {
      dispatch(setLoading(true));
      const result = await loginAPI({ email, password }).unwrap();

      await AsyncStorage.setItem('userToken', result.token);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));

      dispatch(loginSuccess({ user: result.user, token: result.token }));
      
      return result;
    } catch (error) {
      dispatch(setLoading(false));
      throw error;
    }
  };

  const signup = async (email, password, displayName) => {
    try {
      dispatch(setLoading(true));
      const result = await signupAPI({ email, password, displayName }).unwrap();

      await AsyncStorage.setItem('userToken', result.token);
      await AsyncStorage.setItem('userData', JSON.stringify(result.user));

      dispatch(loginSuccess({ user: result.user, token: result.token }));
      
      return result;
    } catch (error) {
      dispatch(setLoading(false));
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await AsyncStorage.clear();      

      dispatch(logout());
      dispatch(clearAllMessages());
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        dispatch(loginSuccess({ user, token }));
        return { user, token };
      }
      return null;
    } catch (error) {
      console.error('Check login error:', error);
      return null;
    }
  };

  return {

    user: user.user,
    isLoggedIn: user.isLoggedIn,
    loading: user.loading,

    login,
    signup,
    logout: logoutUser,
    checkLogin,
  };
};

export const useChat = () => {
  const chat = useSelector(state => state.chat);
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const [sendMessageAPI] = useSendMessageMutation();
  const [clearMessagesAPI] = useClearMessagesMutation();
  const { data: serverMessages, refetch } = useGetMessagesQuery();

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    try {
      dispatch(setSending(true));
      dispatch(setAiTyping(true));

      const userMessage = {
        id: `temp_${Date.now()}`,
        text: messageText,
        role: 'user',
        timestamp: new Date().toISOString(),
        status: 'sending'
      };
      dispatch(addMessage(userMessage));

      if (user?.uid) {
        const currentMessages = [...chat.messages, userMessage];
        await saveCachedMessages({ userId: user.uid, messages: currentMessages });
      }

      const result = await sendMessageAPI({ message: messageText }).unwrap();

      setTimeout(() => {
        const aiMessage = {
          id: result.data.aiResponse.id,
          text: result.data.aiResponse.text,
          role: 'assistant',
          timestamp: result.data.aiResponse.timestamp,
        };
        dispatch(addMessage(aiMessage));
        dispatch(setAiTyping(false));

        if (user?.uid) {

          setTimeout(async () => {
            const updatedMessages = [...chat.messages, aiMessage];
            await saveCachedMessages({ userId: user.uid, messages: updatedMessages });
          }, 100);
        }
      }, 1000);

      return result;
    } catch (error) {
      dispatch(setAiTyping(false));
      throw error;
    } finally {
      dispatch(setSending(false));
    }
  };

  const loadMessages = async (isOnline = true) => {
    if (!user?.uid) {
      return;
    }

    try {
      let backendSuccess = false;

      // Priority 1: Try to fetch from backend if online
      if (isOnline) {
        try {
          const result = await refetch();
          
          if (result.data?.data?.messages) {
            
            // Normalize timestamps for consistency
            const normalizedMessages = result.data.data.messages.map(msg => ({
              ...msg,
              timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : new Date(msg.timestamp).toISOString()
            }));

            dispatch(setMessages(normalizedMessages));
            await saveCachedMessages({ userId: user.uid, messages: normalizedMessages });
            
            backendSuccess = true;
          } else if (serverMessages?.data?.messages) {
            
            // Normalize timestamps for consistency
            const normalizedMessages = serverMessages.data.messages.map(msg => ({
              ...msg,
              timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : new Date(msg.timestamp).toISOString()
            }));

            dispatch(setMessages(normalizedMessages));
            await saveCachedMessages({ userId: user.uid, messages: normalizedMessages });
            backendSuccess = true;
          }
        } catch (serverError) {
          backendSuccess = false;
        }
      }

      if (!backendSuccess) {
        const hadCachedMessages = await loadCachedMessages();
        
        if (!hadCachedMessages) {
          dispatch(setMessages([]));
        }
      }

    } catch (error) {
      dispatch(setMessages([]));
    }
  };

  const loadCachedMessages = async () => {
    if (!user?.uid) {
      return false;
    }
    
    try {
      const cacheKey = `chat_messages_${user.uid}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const cachedMessages = JSON.parse(cachedData);

        if (Array.isArray(cachedMessages) && cachedMessages.length > 0) {
          const normalizedMessages = cachedMessages.map(msg => ({
            ...msg,
            timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : new Date(msg.timestamp).toISOString()
          }));
          
          dispatch(setMessages(normalizedMessages));
          return true;
        } else if (!Array.isArray(cachedMessages)) {
          await AsyncStorage.removeItem(cacheKey);
          return false;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.error('❌ Error loading cached messages:', error);

      try {
        const cacheKey = `chat_messages_${user.uid}`;
        await AsyncStorage.removeItem(cacheKey);
      } catch (clearError) {
        console.error('❌ Error clearing corrupted cache:', clearError);
      }
      return false;
    }
  };

  const saveCachedMessages = async ({ userId, messages }) => {
    try {
      const cacheKey = `chat_messages_${userId}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving cached messages:', error);
    }
  };

  const clearMessages = async () => {
    try {

      await clearMessagesAPI().unwrap();

      dispatch(clearAllMessages());

      if (user?.uid) {
        const cacheKey = `chat_messages_${user.uid}`;
        await AsyncStorage.removeItem(cacheKey);
      }
    } catch (error) {
      console.error('Clear messages error:', error);
    }
  };

  return {

    messages: chat.messages,
    aiTyping: chat.aiTyping,
    sending: chat.sending,

    sendMessage,
    loadMessages,
    clearMessages,
    loadCachedMessages,
    saveCachedMessages,
  };
};

export const useTheme = () => {
  const theme = useSelector(state => state.theme);
  const dispatch = useDispatch();

  const toggle = async () => {
    dispatch(toggleTheme());

    await AsyncStorage.setItem('theme', theme.isDark ? 'light' : 'dark');
  };

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark') {
        dispatch(setTheme(true));
      }
    } catch (error) {
      console.error('Load theme error:', error);
    }
  };

  return {

    isDark: theme.isDark,

    toggle,
    loadTheme,
  };
};
