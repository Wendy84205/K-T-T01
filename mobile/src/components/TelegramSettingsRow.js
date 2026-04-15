import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function TelegramSettingsRow({ icon: Icon, title, value, color, iconBg = "bg-blue-500", isLast = false, onPress }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center ml-4 py-3 ${!isLast ? 'border-b border-tl-border' : ''}`}
    >
      <View className={`w-8 h-8 rounded-lg ${iconBg.replace('bg-blue-500', 'bg-tl-primary')} items-center justify-center mr-3`}>
        {Icon ? (
          <Icon size={18} color="white" strokeWidth={2.5} />
        ) : (
          <Text className="text-white text-lg font-bold">?</Text>
        )}
      </View>
      
      <View className="flex-1 flex-row justify-between items-center pr-4">
        <Text className={`text-[17px] font-medium ${color || 'text-tl-text'}`}>{title}</Text>
        <View className="flex-row items-center">
          {value && <Text className="text-tl-muted text-[17px] mr-2">{value}</Text>}
          <Text className="text-tl-muted text-lg">›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
