import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Search, UserPlus } from 'lucide-react-native';
import { getChatUsers, createDirectConversation } from '../../api/chat';
import ModernAvatar from '../../components/ModernAvatar';

export default function ContactsScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getChatUsers();
        setUsers(data || []);
      } catch (err) {
        console.error('[Contacts] Load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleStartChat = async (otherUser) => {
    try {
      const conv = await createDirectConversation(otherUser.id);
      navigation.navigate('ChatRoom', { 
        conversationId: conv.id, 
        title: `${otherUser.firstName} ${otherUser.lastName}`.trim() || otherUser.username,
        otherUser: {
          id: otherUser.id,
          name: `${otherUser.firstName} ${otherUser.lastName}`.trim() || otherUser.username,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          email: otherUser.email,
          role: otherUser.role,
          status: otherUser.status
        }
      });
    } catch (err) {
      console.error('[Contacts] Start chat failed:', err);
    }
  };

  const filtered = users.filter(u => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const username = (u.username || '').toLowerCase();
    return fullName.includes(search.toLowerCase()) || username.includes(search.toLowerCase());
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      className="flex-row items-center py-4 border-b border-tl-border bg-tl-bg px-6"
      onPress={() => handleStartChat(item)}
    >
      <View className="mr-4">
        <ModernAvatar 
          name={`${item.firstName} ${item.lastName}`.trim() || item.username} 
          size={50} 
          online={item.status === 'active' || item.status === 'online'} 
        />
      </View>
      <View className="flex-1">
        <Text className="text-[17px] font-bold text-tl-text mb-1">{item.firstName} {item.lastName}</Text>
        <Text className="text-[13px] text-tl-muted font-medium">@{item.username || item.email?.split('@')[0]}</Text>
      </View>
      <UserPlus size={20} color="#6366F1" strokeWidth={2} />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-tl-bg">
      <SafeAreaView className="bg-tl-surface border-b border-tl-border" edges={['top']}>
        <View className="flex-row items-center px-4 h-14">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <ChevronLeft size={28} color="#6366F1" strokeWidth={2.5} />
          </TouchableOpacity>
          <Text className="text-[18px] font-bold text-tl-text flex-1 text-center mr-10">New Message</Text>
        </View>
        
        <View className="px-6 pb-4">
          <View className="bg-tl-bg rounded-[10px] flex-row items-center px-3 h-10 border border-tl-border">
            <Search size={18} color="#94A3B8" strokeWidth={2} style={{ marginRight: 12 }} />
            <TextInput
              className="flex-1 text-[16px] text-tl-text h-full"
              placeholder="Who would you like to message?"
              placeholderTextColor="#64748B"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      </SafeAreaView>

      {loading ? (
        <View className="flex-1 justify-center items-center"><ActivityIndicator color="#6366F1" size="large" /></View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id?.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-[16px] text-tl-muted font-medium">No users found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
