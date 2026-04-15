import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function TLCard({ children, className = "", onPress }) {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  return (
    <CardComponent 
      onPress={onPress}
      activeOpacity={0.7}
      className={`bg-tl-surface border border-tl-border rounded-[12px] p-5 shadow-sm ${className}`}
    >
      {children}
    </CardComponent>
  );
}
