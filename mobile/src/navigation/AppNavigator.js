import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import MFAScreen from '../screens/auth/MFAScreen';
import { useAuth } from '../context/AuthContext';
import { useE2EE } from '../context/E2EEContext';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ManagerTab from './ManagerTab';
import UserTab from './UserTab';
import AdminBlockScreen from '../screens/admin/AdminBlockScreen';
import ChatRoomScreen from '../screens/chat/ChatRoomScreen';
import UserProfileScreen from '../screens/chat/UserProfileScreen';
import SharedMediaScreen from '../screens/chat/SharedMediaScreen';
import ContactsScreen from '../screens/chat/ContactsScreen';
import E2EEPinScreen from '../screens/auth/E2EEPinScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();
  const { isLocked, isSkipped } = useE2EE();

  // Show loading spinner while reading token from SecureStore
  if (isLoading) {
    return (
      <View className="flex-1 bg-tl-bg justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          (isLocked && !isSkipped) ? (
            // If logged in but E2EE PIN not entered yet
            <Stack.Screen name="E2EEPin" component={E2EEPinScreen} />
          ) : (
            // Authenticated and E2EE unlocked screens
            <Stack.Group>
              {user.role === 'Admin' ? (
                <Stack.Screen name="AdminBlock" component={AdminBlockScreen} />
              ) : user.role === 'Manager' ? (
                <Stack.Screen name="ManagerApp" component={ManagerTab} />
              ) : (
                <Stack.Screen name="UserApp" component={UserTab} />
              )}

              {/* Shared screens outside bottom tab */}
              {user.role !== 'Admin' && 
                <Stack.Screen
                  name="ChatRoom"
                  component={ChatRoomScreen}
                  options={{
                    headerShown: true,
                    headerStyle: { backgroundColor: '#1E293B' },
                    headerTintColor: '#F8FAFC',
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerShadowVisible: false,
                  }}
                />
              }
              {user.role !== 'Admin' &&
                <Stack.Screen
                  name="UserProfile"
                  component={UserProfileScreen}
                />
              }
              {user.role !== 'Admin' &&
                <>
                  <Stack.Screen
                    name="SharedMedia"
                    component={SharedMediaScreen}
                  />
                  <Stack.Screen
                    name="Contacts"
                    component={ContactsScreen}
                  />
                </>
              }
            </Stack.Group>
          )
        ) : (
          // Not logged in -> Auth Flow
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MFA" component={MFAScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


