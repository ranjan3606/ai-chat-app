import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../store/useStore';

export default function ConnectivityIndicator({ isOnline }) {
  const { isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (isOnline) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOnline, pulseAnim]);
  const theme = {
    colors: {
      onlineDot: '#34C759',
      offlineDot: '#FF3B30',
      onlineText: '#34C759',
      offlineText: '#FF3B30',
      textSecondary: isDark ? '#8E8E93' : '#8E8E93'
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.dot, 
        { 
          backgroundColor: isOnline ? theme.colors.onlineDot : theme.colors.offlineDot,
          transform: [{ scale: isOnline ? pulseAnim : 1 }]
        }
      ]} />
      <Text style={[
        styles.text, 
        { color: isOnline ? theme.colors.onlineText : theme.colors.offlineText }
      ]}>
        {isOnline ? 'Online' : 'Offline'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
