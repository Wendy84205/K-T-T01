import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import CyberInput from '../../components/CyberInput';
import TLCard from '../../components/TLCard';
import CyberButton from '../../components/CyberButton';
import CyberLogo from '../../components/CyberLogo';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(formAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(footerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter all credentials.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken, requiresMfa } = res.data.data;

      if (requiresMfa) {
        navigation.navigate('MFA', { 
          userId: res.data.data.userId || user?.id,
          tempToken: res.data.data.tempToken 
        });
      } else if (accessToken) {
        await login(user, accessToken);
      } else {
        throw new Error('Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      const data = error.response?.data;
      Alert.alert('Login Error', data?.message || 'Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-tl-bg">
      <SafeAreaView className="flex-1 px-6 justify-center">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="w-full"
        >
          {/* ── Logo & Brand ── */}
          <Animated.View 
            className="mb-10 items-center"
            style={{
              opacity: logoAnim,
              transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
            }}
          >
            <CyberLogo size="lg" showText={true} />
            <Text className="text-tl-muted text-[14px] text-center mt-4 font-medium leading-6">
              Insight-driven secure operations platform.{'\n'}End-to-end encrypted workspace.
            </Text>
          </Animated.View>

          {/* ── Login Form ── */}
          <Animated.View
            style={{
              opacity: formAnim,
              transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
            }}
          >
            <TLCard className="mb-6">
              <Text className="text-tl-text font-semibold text-[18px] mb-4">Sign in to your account</Text>
              
              <View className="mb-1">
                <Text className="text-tl-muted text-[12px] font-medium uppercase mb-2">Email Address</Text>
                <CyberInput 
                  placeholder="name@company.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View className="mb-2">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-tl-muted text-[12px] font-medium uppercase">Password</Text>
                  <TouchableOpacity>
                    <Text className="text-tl-primary text-[12px] font-medium">Forgot?</Text>
                  </TouchableOpacity>
                </View>
                <CyberInput 
                  placeholder="••••••••"
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <CyberButton 
                onPress={handleLogin}
                loading={loading}
                title={loading ? 'Authenticating...' : 'Sign In'}
              />
            </TLCard>
          </Animated.View>

        </KeyboardAvoidingView>
      </SafeAreaView>
      
      {/* Footer */}
      <Animated.View 
        className="pb-8 items-center"
        style={{ opacity: footerAnim }}
      >
        <Text className="text-tl-muted text-[12px]">System Version 2.0.0-stable</Text>
      </Animated.View>
    </View>
  );
}
