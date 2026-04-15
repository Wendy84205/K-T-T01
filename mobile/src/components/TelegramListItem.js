import React, { useRef } from 'react';
import { View, Text, TouchableWithoutFeedback, Animated } from 'react-native';
import { CheckCheck } from 'lucide-react-native';
import ModernAvatar from './ModernAvatar';

export default function TelegramListItem({ title, message, time, unread, online, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 40
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ scale }] }} className="flex-row items-center px-4 py-2 bg-tl-bg">
        <ModernAvatar name={title} size={56} online={online} />

        <View className="flex-1 ml-3 pb-3 border-b border-tl-border">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-tl-text font-bold text-[17px] flex-1 mr-2" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-tl-muted text-[13px]">{time}</Text>
          </View>

          <View className="flex-row justify-between items-start">
            <Text className="text-tl-muted text-[15px] flex-1 mr-2 leading-5" numberOfLines={2}>
              {message}
            </Text>

            <View className="items-end justify-between h-full pt-1">
              {unread > 0 ? (
                <View className="bg-tl-primary rounded-full min-w-[22px] h-[22px] items-center justify-center px-1.5 mt-1">
                  <Text className="text-white text-[12px] font-bold">{unread}</Text>
                </View>
              ) : (
                <CheckCheck size={16} color="#22C55E" strokeWidth={2.5} />
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
