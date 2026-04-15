import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AVATAR_COLORS = [
  { bg: '#5495E4', text: '#FFFFFF' }, // Blue
  { bg: '#43D288', text: '#FFFFFF' }, // Green
  { bg: '#FAC03D', text: '#FFFFFF' }, // Orange
  { bg: '#AF8DF1', text: '#FFFFFF' }, // Purple
  { bg: '#FC5C51', text: '#FFFFFF' }, // Red
  { bg: '#2BD2D2', text: '#FFFFFF' }, // Cyan
];

const getColorForName = (name) => {
  if (!name) return AVATAR_COLORS[0];
  const charCode = name.charCodeAt(0);
  return AVATAR_COLORS[charCode % AVATAR_COLORS.length];
};

export default function ModernAvatar({ name, size = 50, online = false }) {
  const initials = name ? name.charAt(0).toUpperCase() : '?';
  const theme = getColorForName(name);
  
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View 
        style={[
          styles.avatarBase, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2, 
            backgroundColor: theme.bg 
          }
        ]}
      >
        <Text style={[styles.initials, { fontSize: size * 0.45, color: theme.text }]}>
          {initials}
        </Text>
      </View>
      {online && (
        <View 
          style={[
            styles.onlineBadge,
            { 
              width: size * 0.28, 
              height: size * 0.28, 
              borderRadius: (size * 0.28) / 2,
              bottom: 0,
              right: 0
            }
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarBase: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  onlineBadge: {
    position: 'absolute',
    backgroundColor: '#4CD964',
    borderWidth: 2,
    borderColor: '#0F172A', // tl-bg — nền dark
  }
});
