import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';

export default function CyberButton({ title, onPress, loading, variant = 'primary', className = "" }) {
  const isPrimary = variant === 'primary';
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={loading}
      activeOpacity={0.7}
      style={{ minHeight: 50 }}
      className={`rounded-[12px] flex-row items-center justify-center px-4 ${isPrimary ? 'bg-tl-primary' : 'bg-tl-hover border border-tl-border'} ${className} ${loading ? 'opacity-70' : ''}`}
    >
      {loading && <ActivityIndicator color={isPrimary ? "white" : "#6366F1"} style={{ marginRight: 8 }} />}
      <Text className={`font-semibold text-[17px] ${isPrimary ? 'text-white' : 'text-tl-text'}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
