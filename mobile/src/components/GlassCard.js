import React from 'react';
import { View } from 'react-native';

export default function GlassCard({ children, className = "" }) {
  return (
    <View 
      className={`bg-tl-surface border border-tl-border rounded-[16px] shadow-sm ${className}`}
    >
      {children}
    </View>
  );
}
