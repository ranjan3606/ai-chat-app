import React from 'react';
import { View, StyleSheet, Modal, Animated, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useUser, useChat } from '../store/useStore';
import { useTheme } from '../store/useStore';
import DrawerHeader from './drawer/DrawerHeader';
import ChatHistoryItem from './drawer/ChatHistoryItem';

const { width } = Dimensions.get('window');

export default function ChatDrawer({ visible, onClose }) {
  const { user: currentUser } = useUser();
  const { currentChatId, selectChat } = useChat();
  const { isDark } = useTheme();
  const theme = {
    colors: {
      background: isDark ? '#111' : '#fff',
      surface: isDark ? '#222' : '#f8f9fa',
      text: isDark ? '#fff' : '#000',
      textSecondary: isDark ? '#999' : '#666',
      border: isDark ? '#333' : '#e0e0e0',
      primary: '#007AFF'
    }
  };
  const chatHistory = [];
  const loading = false;
  const deleteChat = () => {};
  const clearAllChats = () => {};

  const slideAnim = React.useRef(new Animated.Value(-280)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleNewChat = () => {
    selectChat(null);
    onClose();
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Chats',
      'Are you sure you want to delete all chat history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: clearAllChats 
        }
      ]
    );
  };

  const handleSelectChat = (chat) => {
    selectChat({ chat });
    onClose();
  };

  if (!currentUser) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[
          styles.drawer,
          { backgroundColor: theme.colors.surface, transform: [{ translateX: slideAnim }] }
        ]}>
          <DrawerHeader
            onClose={onClose}
            onNewChat={handleNewChat}
            onClearAll={handleClearAll}
            theme={theme}
          />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <ScrollView style={styles.historyContainer}>
              {chatHistory.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  chat={chat}
                  isSelected={chat.id === currentChatId}
                  onSelect={handleSelectChat}
                  onDelete={deleteChat}
                  theme={theme}
                />
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: Math.min(280, width * 0.8),
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
});
