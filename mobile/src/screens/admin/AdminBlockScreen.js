import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert, Monitor, LogOut } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function AdminBlockScreen() {
  const { logout } = useAuth();

  return (
    <View className="flex-1 bg-tl-bg">
      <SafeAreaView className="flex-1 px-8 justify-center items-center">
        <View className="w-24 h-24 bg-tl-error/10 rounded-[32px] items-center justify-center mb-8 border border-tl-error/20">
          <ShieldAlert size={50} color="#EF4444" strokeWidth={2} />
        </View>

        <Text className="text-[28px] font-bold text-tl-text text-center tracking-tight mb-4">
          Desktop Access Only
        </Text>

        <View className="bg-tl-surface rounded-[24px] p-6 border border-tl-border mb-10 shadow-lg shadow-black">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-tl-primary/10 rounded-full items-center justify-center mr-3">
              <Monitor size={18} color="#6366F1" />
            </View>
            <Text className="text-tl-text font-bold flex-1">
              Admin Dashboard specialized for Web
            </Text>
          </View>
          
          <Text className="text-tl-muted leading-6 text-[15px] font-medium">
            The Admin Management Console is not supported on mobile due to the complexity of security operations and data processing. Please use a desktop browser to manage the system.
          </Text>
        </View>

        <TouchableOpacity 
          onPress={logout}
          className="flex-row items-center bg-tl-primary px-10 py-4 rounded-2xl shadow-tl-primary/20 shadow-lg"
        >
          <LogOut size={20} color="#fff" />
          <Text className="text-white font-bold text-lg ml-3">Log Out of Console</Text>
        </TouchableOpacity>

        <View className="absolute bottom-12 items-center">
          <Text className="text-tl-muted/40 text-xs font-bold tracking-widest uppercase">
            Security Isolation Layer v4
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
