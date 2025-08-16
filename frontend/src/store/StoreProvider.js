
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useUser, useTheme } from './useStore';
function AppInitializer({ children }) {
  const { checkLogin } = useUser();
  const { loadTheme } = useTheme();

  useEffect(() => {
    checkLogin();
    loadTheme();
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
