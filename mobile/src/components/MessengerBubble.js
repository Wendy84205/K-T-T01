import React from 'react';
import { View, Text } from 'react-native';
import { CheckCheck } from 'lucide-react-native';

export default function MessengerBubble({ content, isMine, time }) {
  return (
    <View className={`mb-2 flex-row px-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
      <View 
        className={`rounded-[18px] px-4 py-2.5 max-w-[80%] ${
          isMine 
            ? 'bg-messenger-blue rounded-tr-[4px]' 
            : 'bg-messenger-other rounded-tl-[4px]'
        }`}
      >
        <Text className="text-white text-[16px] leading-5">
          {content}
        </Text>
        <View className="flex-row justify-end items-center mt-1">
          <Text className="text-messenger-muted text-[10px] font-medium opacity-80">
            {time}
          </Text>
          {isMine && (
            <CheckCheck 
              size={14} 
              color="#B3D9FF" 
              style={{ marginLeft: 3, opacity: 0.8 }} 
              strokeWidth={2.5} 
            />
          )}
        </View>
      </View>
    </View>
  );
}
