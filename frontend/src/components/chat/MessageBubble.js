import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../store/useStore';

export default function MessageBubble({ message, isUser }) {
  const { isDark } = useTheme();
  const theme = {
    colors: {
      chatUser: '#007AFF',
      chatUserText: '#FFFFFF',
      timestampUser: 'rgba(255, 255, 255, 0.8)',
      chatAI: isDark ? '#2C2C2E' : '#F2F2F7',
      chatAIText: isDark ? '#FFFFFF' : '#000000',
      timestampAI: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      statusUnread: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 122, 255, 0.8)',
      textSecondary: isDark ? '#98989D' : '#8E8E93'
    }
  };

  const formatTime = (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[
      styles.container,
      isUser ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.bubble,
        isUser 
          ? { backgroundColor: theme.colors.chatUser, borderBottomRightRadius: 5 } 
          : { backgroundColor: theme.colors.chatAI, borderBottomLeftRadius: 5 }
      ]}>
        <Text style={[
          styles.messageText,
          { color: isUser ? theme.colors.chatUserText : theme.colors.chatAIText }
        ]}>
          {message.text}
        </Text>
        
        <View style={styles.footer}>
          <Text style={[
            styles.timestamp,
            { color: isUser ? theme.colors.timestampUser : theme.colors.timestampAI }
          ]}>
            {formatTime(message.timestamp)}
          </Text>
          
          {isUser && message.status && (
            <Text style={[styles.status, { color: theme.colors.statusUnread }]}>
              {message.status === 'sending' ? '⏳' : 
               message.status === 'sent' ? '✓' : '✓✓'}
            </Text>
          )}
          
          {!isUser && message.provider && (
            <Text style={[styles.provider, { color: theme.colors.textSecondary }]}>
              {message.provider === 'gemini' ? '🧠 Gemini' : 
               message.provider === 'openai' ? '🤖 OpenAI' : 
               `🤖 ${message.provider}`}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    minWidth: '20%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '400',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  provider: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 8,
  },
});
