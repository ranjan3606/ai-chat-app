import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../store/useStore';
import ConnectivityIndicator from '../common/ConnectivityIndicator';
import HeaderButton from '../common/HeaderButton';

export default function ChatHeader({ 
  title = "AI Chat",
  isOnline,
  onRefresh,
  onClearChat,
  onToggleTheme,
  onLogout,
  isDark
}) {
  const { isDark: currentIsDark } = useTheme();

  const theme = {
    colors: {
      headerBackground: currentIsDark ? '#111' : '#f8f9fa',
      border: currentIsDark ? '#333' : '#e0e0e0',
      text: currentIsDark ? '#fff' : '#000',
      primary: '#007AFF'
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.colors.headerBackground, 
        borderBottomColor: theme.colors.border 
      }
    ]}>
      <View style={styles.left}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
        <ConnectivityIndicator isOnline={isOnline} />
      </View>
      
      <View style={styles.right}>
        <HeaderButton 
          onPress={onClearChat}
          icon="delete-outline"
          backgroundColor="#FF6B6B"
        />
        <HeaderButton 
          onPress={onToggleTheme}
          icon={isDark ? 'light-mode' : 'dark-mode'}
          backgroundColor="#9C27B0"
        />
        <HeaderButton 
          onPress={onLogout}
          text="Logout"
          backgroundColor="#ff4757"
          style={styles.logoutButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    marginRight: 0,
    paddingHorizontal: 15,
  },
});
