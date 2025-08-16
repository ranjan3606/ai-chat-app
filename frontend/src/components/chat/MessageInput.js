import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../store/useStore';

export default function MessageInput({ 
  value, 
  onChangeText, 
  onSend, 
  loading, 
  placeholder = "Type your message..." 
}) {
  const { isDark } = useTheme();
  const theme = {
    colors: {
      background: isDark ? '#000' : '#FFFFFF',
      inputBackground: isDark ? '#1C1C1E' : '#F2F2F7',
      border: isDark ? '#38383A' : '#D1D1D6',
      text: isDark ? '#FFFFFF' : '#000000',
      placeholder: isDark ? '#8E8E93' : '#8E8E93',
      primary: '#007AFF'
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background, 
          borderTopColor: theme.colors.border 
        }
      ]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.inputBackground, 
            borderColor: theme.colors.border,
            color: theme.colors.text
          }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          multiline
          maxLength={1000}
          editable={!loading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: theme.colors.primary },
            (!value.trim() || loading) && styles.sendButtonDisabled
          ]}
          onPress={onSend}
          disabled={!value.trim() || loading}
        >
          {loading ? (
            <Text style={styles.sendButtonText}>...</Text>
          ) : (
            <MaterialIcons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 48,
    textAlignVertical: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
