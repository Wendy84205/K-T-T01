import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Animated } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export default function CyberInput({ 
  icon: Icon, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry, 
  ...props 
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#334155', '#6366F1'], // tl-border → tl-primary
  });

  return (
    <Animated.View 
      style={{ 
        minHeight: 50, 
        flexDirection: 'row', 
        alignItems: 'center',
        backgroundColor: '#0F172A', // tl-bg
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
      }}
    >
      {Icon && (
        <View style={{ marginRight: 12 }}>
          <Icon size={20} color={isFocused ? "#6366F1" : "#94A3B8"} />
        </View>
      )}
      
      <TextInput
        style={{
          flex: 1,
          color: '#F8FAFC',    // tl-text
          fontSize: 17,
          paddingVertical: 10,
        }}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        selectionColor="#6366F1"
        cursorColor="#6366F1"
        autoCorrect={false}
        autoComplete="off"
        {...props}
      />

      {secureTextEntry && (
        <TouchableOpacity 
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={{ marginLeft: 8, padding: 4 }}
        >
          {isPasswordVisible ? (
            <EyeOff size={20} color="#94A3B8" />
          ) : (
            <Eye size={20} color="#94A3B8" />
          )}
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
