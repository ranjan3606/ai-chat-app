import { useState, useRef, useEffect } from 'react';
import { Platform } from 'react-native';

const API_BASE_URL = __DEV__ 
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')
  : 'https://your-production-api.com';

export default function useConnectivity() {
  const [isOnline, setIsOnline] = useState(false);
  const connectivityInterval = useRef(null);

  const checkConnectivity = async (showLogs = true) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const healthResponse = await fetch(`${API_BASE_URL}/health`, { 
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      const online = healthResponse.ok;
      
      if (isOnline !== online) {
        setIsOnline(online);
        if (showLogs) {
        }
      }
      
      return online;
    } catch (error) {
      if (isOnline !== false) {
        setIsOnline(false);
        if (showLogs) {
        }
      }
      return false;
    }
  };

  const startMonitoring = () => {
    if (connectivityInterval.current) {
      clearInterval(connectivityInterval.current);
    }
    
    checkConnectivity();
    
    connectivityInterval.current = setInterval(() => {
      checkConnectivity(false);
    }, 10000);
  };

  const stopMonitoring = () => {
    if (connectivityInterval.current) {
      clearInterval(connectivityInterval.current);
      connectivityInterval.current = null;
    }
  };

  useEffect(() => {
    return () => stopMonitoring();
  }, []);

  return {
    isOnline,
    checkConnectivity,
    startMonitoring,
    stopMonitoring
  };
}
