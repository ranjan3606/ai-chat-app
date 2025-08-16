import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../store/useStore';

export default function ThemeToggle({ style }) {
  const { isDark, toggle: toggleTheme } = useTheme();
  
  const theme = {
    colors: {
      primary: '#007AFF'
    }
  };

  return (
    <TouchableOpacity onPress={toggleTheme} style={[styles.container, style]}>
      <MaterialIcons 
        name={isDark ? 'light-mode' : 'dark-mode'} 
        size={24} 
        color={theme.colors.primary} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
