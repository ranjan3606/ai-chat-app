import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HeaderButton({ 
  onPress, 
  icon, 
  iconSize = 20, 
  iconColor = 'white',
  text,
  backgroundColor = '#007AFF',
  style,
  ...props 
}) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.button, { backgroundColor }, style]}
      {...props}
    >
      {icon && (
        <MaterialIcons name={icon} size={iconSize} color={iconColor} />
      )}
      {text && (
        <Text style={[styles.text, { color: iconColor }]}>{text}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    fontSize: 12,
  },
});
