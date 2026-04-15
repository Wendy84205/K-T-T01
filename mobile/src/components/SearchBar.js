import React from 'react';
import { View, TextInput } from 'react-native';

export default function SearchBar({ placeholder = "Search", ...props }) {
  return (
    <View className="px-4 py-2">
      <View className="bg-messenger-bg rounded-xl px-4 py-2 flex-row items-center border border-white/5">
        <TextInput
          className="flex-1 text-white text-base py-1.5"
          placeholder={placeholder}
          placeholderTextColor="#708499"
          {...props}
        />
      </View>
    </View>
  );
}
