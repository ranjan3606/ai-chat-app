import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser, useChat, useTheme } from '../store/useStore';
import ChatHeader from '../components/chat/ChatHeader';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import MessageInput from '../components/chat/MessageInput';
import useConnectivity from '../hooks/useConnectivity';

export default function ChatScreen({ navigation }) {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);

  const { user, logout } = useUser();
  const { messages, sendMessage, loadMessages, clearMessages, aiTyping, sending } = useChat();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { isOnline, checkConnectivity, startMonitoring, stopMonitoring } = useConnectivity();

  const theme = {
    colors: {
      background: isDark ? '#000000' : '#FFFFFF',
      chatBackground: isDark ? '#111111' : '#F2F2F7',
      textTertiary: isDark ? '#8E8E93' : '#8E8E93'
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    const initialize = async () => {
      startMonitoring();
      
        // Check connectivity first, then load messages with priority to backend
      const connectivity = await checkConnectivity();
      console.log(`Connectivity check result: ${connectivity}`);
      
      await loadMessages(connectivity);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    initialize();
    
    return () => stopMonitoring();
  }, [user?.uid]);

  // Also reload messages when connectivity changes
  useEffect(() => {
    if (user?.uid && isOnline !== null) {
      loadMessages(isOnline);
    }
  }, [isOnline, user?.uid]);

  const handleSendMessage = async () => {
    const messageText = inputText.trim();
    if (!messageText) return;
    
    setInputText('');
    
    try {
      await sendMessage(messageText);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message: ' + error.message);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearMessages();
            } catch (error) {
              Alert.alert('Error', 'Failed to clear messages: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const renderMessage = ({ item }) => (
    <MessageBubble message={item} isUser={item.role === 'user'} />
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
        Start a conversation with the AI assistant!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ChatHeader
        isOnline={isOnline}
        onClearChat={handleClearChat}
        onToggleTheme={toggleTheme}
        onLogout={logout}
        isDark={isDark}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={[styles.messagesList, { backgroundColor: theme.colors.chatBackground }]}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
        ListFooterComponent={<TypingIndicator isVisible={aiTyping} />}
      />

      <MessageInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSendMessage}
        loading={sending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingTop: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
});
