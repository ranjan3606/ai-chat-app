import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useUser, useTheme } from '../../store/useStore';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const { login, signup, loading } = useUser();
  const { isDark } = useTheme();

  const theme = {
    colors: {
      surface: isDark ? '#222' : '#f8f9fa',
      text: isDark ? '#fff' : '#000',
      textSecondary: isDark ? '#666' : '#999',
      input: isDark ? '#333' : '#fff',
      borderLight: isDark ? '#444' : '#e0e0e0',
      placeholder: isDark ? '#888' : '#666',
      primary: '#007AFF'
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      if (isSignUp) {
        await signup(email, password, email.split('@')[0]);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await login(email, password);
      }
      // Note: Messages will be loaded by ChatScreen when it mounts
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {isSignUp ? 'Sign up to start chatting with AI' : 'Sign in to continue chatting'}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.input, 
            borderColor: theme.colors.borderLight,
            color: theme.colors.text
          }]}
          placeholder="Email"
          placeholderTextColor={theme.colors.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.input, 
            borderColor: theme.colors.borderLight,
            color: theme.colors.text
          }]}
          placeholder="Password"
          placeholderTextColor={theme.colors.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }, loading && styles.buttonDisabled]}
        onPress={handleAuth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsSignUp(!isSignUp)}
      >
        <Text style={[styles.switchText, { color: theme.colors.primary }]}>
          {isSignUp 
            ? 'Already have an account? Sign In' 
            : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 16,
  },
});
