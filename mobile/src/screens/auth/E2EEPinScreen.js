import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ShieldAlert, 
  Fingerprint, 
  Lock, 
  LogOut, 
  SkipForward, 
  KeyRound,
  ShieldCheck,
  Trash2
} from 'lucide-react-native';
import { useE2EE } from '../../context/E2EEContext';
import { useAuth } from '../../context/AuthContext';
import CyberInput from '../../components/CyberInput';
import CyberButton from '../../components/CyberButton';

export default function E2EEPinScreen() {
  const [pin, setPin] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { unlock, setupWithMasterPassword, hasKey, skip, wipeLocalKeys } = useE2EE();
  const { logout } = useAuth();

  // Animations
  const iconAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset animations when switching between setup/unlock
    iconAnim.setValue(0);
    formAnim.setValue(0);
    footerAnim.setValue(0);

    Animated.stagger(180, [
      Animated.spring(iconAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(formAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
      Animated.spring(footerAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 8 }),
    ]).start();
  }, [isSettingUp, hasKey]);

  const handleUnlock = async () => {
    if (pin.length < 6) {
      Alert.alert('Error', 'Please enter your 6-digit PIN.');
      return;
    }
    setLoading(true);
    const success = await unlock(pin);
    setLoading(false);
    if (!success) {
      Alert.alert('Failed', 'Incorrect security PIN. Please try again.');
      setPin('');
    }
  };

  const handleSetup = async () => {
    if (!masterPassword || !newPin) {
      Alert.alert('Error', 'Please enter your Master Password and new PIN.');
      return;
    }
    if (newPin.length !== 6 || newPin !== confirmPin) {
      Alert.alert('Error', 'PIN must be 6 digits and match the confirmation.');
      return;
    }
    setLoading(true);
    try {
      const success = await setupWithMasterPassword(masterPassword, newPin);
      if (success) {
        Alert.alert('Success', 'Mobile security has been activated and synced.');
      }
    } catch (err) {
      Alert.alert('Failed', err.message || 'Could not synchronize security keys.');
    } finally {
      setLoading(false);
    }
  };

  const handleWipeKeys = () => {
    Alert.alert(
      'Wipe Device Keys?',
      'This will destroy the local security keys. You will need your Master Password to set them up again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Wipe Keys', 
          style: 'destructive', 
          onPress: async () => {
            await wipeLocalKeys();
            Alert.alert('Wiped', 'Local device keys have been destroyed.');
          } 
        }
      ]
    );
  };

  // ── SETUP SCREEN ──
  if (!hasKey || isSettingUp) {
    return (
      <View className="flex-1 bg-tl-bg">
        <SafeAreaView className="flex-1 px-8">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            className="flex-1 justify-center"
          >
            <Animated.View 
              className="items-center mb-10"
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
                <ShieldAlert size={40} color="#6366F1" />
              </View>
              <Text className="text-[28px] font-bold text-tl-text tracking-tight mb-2">Security Setup</Text>
              <Text className="text-tl-muted text-center text-[15px] leading-5 px-2">
                Enter your Web Master Password to sync security keys, then create a local 6-digit PIN.
              </Text>
            </Animated.View>

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
                  placeholder="Enter your password"
                  secureTextEntry={true}
                  value={masterPassword}
                  onChangeText={setMasterPassword}
                />

                <View className="flex-row justify-between">
                  <View className="w-[48%]">
                    <CyberInput 
                      placeholder="New PIN"
                      keyboardType="numeric"
                      maxLength={6}
                      secureTextEntry={true}
                      value={newPin}
                      onChangeText={setNewPin}
                      textAlign="center"
                    />
                  </View>
                  <View className="w-[48%]">
                    <CyberInput 
                      placeholder="Confirm"
                      keyboardType="numeric"
                      maxLength={6}
                      secureTextEntry={true}
                      value={confirmPin}
                      onChangeText={setConfirmPin}
                      textAlign="center"
                    />
                  </View>
                </View>

                <CyberButton 
                  onPress={handleSetup}
                  loading={loading}
                  title={loading ? 'Syncing Keys...' : 'Activate Security'}
                />
                
                {hasKey && (
                   <TouchableOpacity onPress={() => setIsSettingUp(false)} className="mt-6 items-center">
                     <Text className="text-tl-primary font-medium">Return to unlock</Text>
                   </TouchableOpacity>
                )}

                <View className="mt-8 pt-6 border-t border-tl-border flex-row justify-between items-center">
                  <TouchableOpacity onPress={logout} className="flex-row items-center bg-tl-hover px-3 py-2 rounded-[8px]">
                    <LogOut size={16} color="#EF4444" style={{ marginRight: 8 }} />
                    <Text className="text-tl-error font-medium text-[13px]">Sign Out</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={skip} className="flex-row items-center border border-tl-border px-3 py-2 rounded-[8px]">
                    <Text className="text-tl-muted font-medium text-[13px] mr-1">Skip Setup</Text>
                    <SkipForward size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }

  // ── UNLOCK SCREEN ──
  return (
    <View className="flex-1 bg-tl-bg">
      <SafeAreaView className="flex-1 px-8">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-center"
        >
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
              <Fingerprint size={44} color="#6366F1" />
            </View>
            <Text className="text-[28px] font-bold text-tl-text tracking-tight mb-3">Vault Unlocking</Text>
            <Text className="text-tl-muted text-center text-[15px] leading-6 px-4">
              Enter your 6-digit security PIN to decrypt your operational keys and access secure messages.
            </Text>
          </Animated.View>

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
                icon={Lock}
                placeholder="••••••"
                keyboardType="numeric"
                maxLength={6}
                secureTextEntry={true}
                value={pin}
                onChangeText={setPin}
                textAlign="center"
              />

              <CyberButton 
                onPress={handleUnlock}
                loading={loading}
                title={loading ? 'Decrypting...' : 'Unlock Local Store'}
              />

              <TouchableOpacity onPress={() => setIsSettingUp(true)} className="mt-8 items-center bg-tl-hover py-3 rounded-[8px]">
                <Text className="text-tl-primary font-medium">Forgot PIN? Reset keys</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleWipeKeys}
                className="mt-4 border border-tl-error/30 bg-tl-error/10 flex-row justify-center items-center py-3 rounded-[8px]"
              >
                <Trash2 size={16} color="#EF4444" style={{ marginRight: 8 }} />
                <Text className="text-tl-error font-medium">Wipe Device Keys (Stuck Fix)</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View 
            className="mt-12 items-center flex-row justify-center"
            style={{ opacity: footerAnim }}
          >
            <ShieldCheck size={18} color="#22C55E" />
            <Text className="text-tl-success text-[12px] font-bold ml-2 tracking-widest uppercase">
              End-to-End Encrypted
            </Text>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
