import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../store/useStore';
import ThemeToggle from '../components/auth/ThemeToggle';
import LoginForm from '../components/auth/LoginForm';

export default function LoginScreen({ navigation }) {
  const { isDark } = useTheme();
  const theme = {
    colors: {
      background: isDark ? '#000' : '#fff',
      primary: isDark ? '#007AFF' : '#007AFF',
      textSecondary: isDark ? '#666' : '#999'
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemeToggle style={styles.themeToggle} />

        <View style={styles.headerContainer}>
          <Text style={[styles.appTitle, { color: theme.colors.primary }]}>
            🤖 AI Chat
          </Text>
          <Text style={[styles.appDescription, { color: theme.colors.textSecondary }]}>
            Chat with multiple AI providers including Gemini, OpenAI, and more!
          </Text>
        </View>
        
        <LoginForm />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  themeToggle: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 60,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  appDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});
