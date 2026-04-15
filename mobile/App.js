import { StatusBar } from 'expo-status-bar';
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import { E2EEProvider } from './src/context/E2EEContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

// Dành cho việc khởi tạo NativeWind className mapping
import { NativeWindStyleSheet } from "nativewind";



export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <E2EEProvider>
            <AppNavigator />
            <StatusBar style="light" />
          </E2EEProvider>
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
