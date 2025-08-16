import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ChatHistoryItem({ 
  chat, 
  isSelected, 
  onSelect, 
  onDelete,
  theme 
}) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => onDelete(chat.id) 
        }
      ]
    );
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isSelected ? theme.colors.primary + '20' : 'transparent' }
    ]}>
      <TouchableOpacity 
        style={styles.content} 
        onPress={() => onSelect(chat)}
      >
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {chat.title || 'New Chat'}
        </Text>
        <Text style={[styles.preview, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {chat.lastMessage || 'No messages yet'}
        </Text>
        <Text style={[styles.date, { color: theme.colors.textTertiary }]}>
          {new Date(chat.updatedAt).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
});
