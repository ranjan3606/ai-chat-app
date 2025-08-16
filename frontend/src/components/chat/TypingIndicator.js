import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../store/useStore';

export default function TypingIndicator({ isVisible }) {
  const { isDark } = useTheme();
  const theme = {
    colors: {
      background: isDark ? '#2C2C2E' : '#F2F2F7',
      text: isDark ? '#8E8E93' : '#8E8E93',
      primary: '#007AFF'
    }
  };

  if (!isVisible) return null;

  return (
    <View style={[styles.container, styles.aiMessage]}>
      <View style={[
        styles.bubble, 
        { backgroundColor: theme.colors.typingBubble, borderBottomLeftRadius: 5 }
      ]}>
        <View style={styles.content}>
          <ActivityIndicator size="small" color={theme.colors.primary} style={styles.spinner} />
          <View style={styles.dots}>
            <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
          </View>
        </View>
        <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
          🧠 AI is thinking...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  spinner: {
    marginRight: 8,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 2,
  },
  text: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
