import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UserTasksScreen from '../screens/main/UserTasksScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import VaultScreen from '../screens/vault/VaultScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import FloatingTabBar from '../components/FloatingTabBar';

const Tab = createBottomTabNavigator();

export default function UserTab() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tab.Screen name="Tasks"    component={UserTasksScreen} />
      <Tab.Screen name="Chat"     component={ChatListScreen} />
      <Tab.Screen name="Vault"    component={VaultScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
