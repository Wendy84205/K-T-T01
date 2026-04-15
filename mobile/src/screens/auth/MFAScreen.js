import React, { useState, useRef, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, KeyRound, ChevronLeft } from 'lucide-react-native';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import CyberInput from '../../components/CyberInput';
import CyberButton from '../../components/CyberButton';

export default function MFAScreen({ route, navigation }) {
  const { userId, tempToken } = route.params;
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Animations
  const iconAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(180, [
      Animated.spring(iconAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(formAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(footerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start();
  }, []);

  const handleVerify = async () => {
    if (!token || token.length < 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-mfa', { tempToken, token });
      const { user, accessToken } = response.data.data;
      await login(user, accessToken);
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid OTP code.';
      Alert.alert('MFA Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-tl-bg">
      <SafeAreaView className="flex-1 px-8">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mt-2 -ml-2 p-2 w-12"
        >
          <ChevronLeft size={30} color="#6366F1" strokeWidth={2.5} />
        </TouchableOpacity>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-start pt-12"
        >
          {/* Icon + Title */}
          <Animated.View 
            className="items-center mb-12"
            style={{
              opacity: iconAnim,
              transform: [{ 
                translateY: iconAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }),
              }, {
                scale: iconAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
              }],
            }}
          >
            <View className="w-20 h-20 bg-tl-primary/20 border border-tl-primary/30 rounded-[16px] items-center justify-center mb-6"
              style={{ shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}
            >
              <ShieldCheck size={44} color="#6366F1" strokeWidth={2} />
            </View>
            <Text className="text-[28px] font-bold text-tl-text tracking-tight mb-3">Verification</Text>
            <Text className="text-tl-muted text-center text-[16px] leading-6 px-4">
              Enter the 6-digit security code from your authenticator app to authorize this session.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={{
              opacity: formAnim,
              transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
            }}
          >
            <View className="bg-tl-surface rounded-[24px] p-8 border border-tl-border"
              style={{ shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}
            >
              <CyberInput 
                icon={KeyRound}
                placeholder="000000"
                keyboardType="numeric"
                maxLength={6}
                value={token}
                onChangeText={setToken}
                textAlign="center"
              />

              <View className="mt-4">
                <CyberButton 
                  onPress={handleVerify}
                  loading={loading}
                  title={loading ? 'Verifying...' : 'Verify and Sign In'}
                />
              </View>

              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                className="mt-4 items-center py-3"
              >
                <Text className="text-tl-muted font-medium text-[15px]">Cancel and go back</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View 
            className="mt-auto pb-10 items-center"
            style={{ opacity: footerAnim }}
          >
            <Text className="text-tl-muted text-[12px] uppercase tracking-widest font-bold">
              CyberSecure Encryption Node v2
            </Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
