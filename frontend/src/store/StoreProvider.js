
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useUser, useTheme } from './useStore';

function AppInitializer({ children }) {
  const { checkLogin } = useUser();
  const { loadTheme } = useTheme();

  useEffect(() => {
    const initializeApp = async () => {
      // Load theme first
      loadTheme();
      
      // Check login status (but don't load messages here)
      // Messages will be loaded by ChatScreen when needed
      await checkLogin();
    };

    initializeApp();
  }, []);

  return children;
}

export function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <AppInitializer>
        {children}
      </AppInitializer>
    </Provider>
  );
}
