
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = __DEV__ 
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')
  : 'https://your-production-api.com';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: async (headers) => {
      const token = await AsyncStorage.getItem('userToken');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['User', 'Messages'],
  endpoints: (builder) => ({

    login: builder.mutation({
      query: ({ email, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { email, password },
      }),
    }),

    signup: builder.mutation({
      query: ({ email, password, displayName }) => ({
        url: '/auth/signup',
        method: 'POST',
        body: { email, password, displayName },
      }),
    }),

    sendMessage: builder.mutation({
      query: ({ message }) => ({
        url: '/chat',
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: ['Messages'],
    }),

    getMessages: builder.query({
      query: () => '/chat/messages',
      providesTags: ['Messages'],
      keepUnusedDataFor: 0,
    }),

    clearMessages: builder.mutation({
      query: () => ({
        url: '/chat/messages',
        method: 'DELETE',
      }),
      invalidatesTags: ['Messages'],
    }),
  }),
});

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    token: null,
    isLoggedIn: false,
    loading: false,
  },
  reducers: {

    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      state.loading = false;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.loading = false;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    aiTyping: false,
    sending: false,
  },
  reducers: {

    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    clearAllMessages: (state) => {
      state.messages = [];
    },

    setAiTyping: (state, action) => {
      state.aiTyping = action.payload;
    },

    setSending: (state, action) => {
      state.sending = action.payload;
    },

    setMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
});

export const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDark: false,
  },
  reducers: {

    toggleTheme: (state) => {
      state.isDark = !state.isDark;
    },

    setTheme: (state, action) => {
      state.isDark = action.payload;
    },
  },
});

export const store = configureStore({
  reducer: {
    api: api.reducer,
    user: userSlice.reducer,
    chat: chatSlice.reducer,
    theme: themeSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {

        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],

        ignoredActionsPaths: ['payload.timestamp'],

        ignoredPaths: ['chat.messages.timestamp'],
      },
    }).concat(api.middleware),
});

export const { loginSuccess, logout, setLoading } = userSlice.actions;
export const { addMessage, clearAllMessages, setAiTyping, setSending, setMessages } = chatSlice.actions;
export const { toggleTheme, setTheme } = themeSlice.actions;

export const {
  useLoginMutation,
  useSignupMutation,
  useSendMessageMutation,
  useGetMessagesQuery,
  useClearMessagesMutation,
} = api;
