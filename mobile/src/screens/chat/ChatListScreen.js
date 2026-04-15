import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCirclePlus, Search, MessageCircle } from 'lucide-react-native';
import { getConversations } from '../../api/chat';
import TLCard from '../../components/TLCard';

export default function ChatListScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [query, setQuery]                 = useState('');

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (!query.trim()) { setFiltered(conversations); return; }
    const q = query.toLowerCase();
    setFiltered(
      conversations.filter(c => {
        const otherName = c.otherUser
          ? `${c.otherUser.firstName || ''} ${c.otherUser.lastName || ''}`.trim()
          : '';
        const searchable = `${c.name || ''} ${otherName} ${c.otherUserName || ''}`.toLowerCase();
        return searchable.includes(q);
      })
    );
  }, [query, conversations]);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data || []);
      setFiltered(data || []);
    } catch (error) {
      console.error('Failed to load conversations', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadConversations(); };

  const renderHeader = () => (
    <View className="bg-tl-bg px-6 pt-4 pb-2">
      {/* Top Header */}
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-tl-text text-[28px] font-bold">Chats</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Contacts')}
          className="bg-tl-primary rounded-[10px] px-4 py-2 flex-row items-center"
          style={{ shadowColor: '#6366F1', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 }}
        >
          <MessageCirclePlus size={15} color="#fff" strokeWidth={2.5} />
          <Text className="text-white font-bold text-[13px] ml-1.5">New</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar thực tế */}
      <View className="bg-tl-surface rounded-[10px] px-4 py-2.5 flex-row items-center mb-5 border border-tl-border">
        <Search size={16} color="#94A3B8" strokeWidth={2} />
        <TextInput
          className="flex-1 text-tl-text text-[15px] ml-2.5"
          placeholder="Search conversations..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
      </View>

      {/* Filter Tabs */}
      <View className="flex-row border-b border-tl-border">
        {['All', 'Internal', 'External'].map((tab) => {
          const isActive = tab === 'All';
          return (
            <TouchableOpacity
              key={tab}
              className={`mr-6 pb-3 ${isActive ? 'border-b-2 border-tl-primary' : ''}`}
            >
              <Text className={`text-[14px] font-semibold ${isActive ? 'text-tl-text' : 'text-tl-muted'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-24">
      <View className="w-20 h-20 rounded-full bg-tl-surface items-center justify-center mb-4 border border-tl-border">
        <MessageCircle size={36} color="#334155" strokeWidth={1.5} />
      </View>
      <Text className="text-tl-text font-bold text-[16px] mb-2">No conversations yet</Text>
      <Text className="text-tl-muted text-[13px] text-center px-8 leading-5">
        Tap <Text className="text-tl-primary font-bold">New</Text> to start a secure encrypted chat
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-tl-bg">
      <SafeAreaView className="flex-1" edges={['top']}>
        {renderHeader()}

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color="#6366F1" size="large" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16, paddingBottom: 110, flexGrow: 1 }}
            ListEmptyComponent={renderEmpty}
            renderItem={({ item }) => {
              // Ưu tiên: name (group) → otherUser firstName+lastName → otherUserName → participants
              const otherName = item.otherUser
                ? `${item.otherUser.firstName || ''} ${item.otherUser.lastName || ''}`.trim()
                : null;
              const title   = item.name || otherName || item.otherUserName || 
                (item.participants?.[0] ? `${item.participants[0].firstName || ''} ${item.participants[0].lastName || ''}`.trim() : null) ||
                'Unknown User';
              const lastMsg = item.lastMessage?.content || 'Tap to start chatting...';
              const time    = item.lastMessage?.createdAt
                ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';
              const unread  = item.unreadCount || 0;

              return (
                <TLCard
                  className="mb-3 flex-row items-center"
                  onPress={() => navigation.navigate('ChatRoom', {
                    conversationId: item.id,
                    title: title,
                  })}
                >
                  {/* Avatar */}
                  <View className="w-12 h-12 rounded-[10px] bg-tl-primary/15 items-center justify-center mr-4 border border-tl-primary/20">
                    <Text className="text-tl-primary font-black text-[20px]">
                      {title?.charAt(0)?.toUpperCase() || '?'}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-tl-text font-bold text-[16px] flex-1 mr-2" numberOfLines={1}>{title}</Text>
                      <Text className="text-tl-muted text-[12px]">{time}</Text>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <Text className="text-tl-muted text-[13px] flex-1 mr-2" numberOfLines={1}>
                        {lastMsg}
                      </Text>
                      {unread > 0 && (
                        <View className="bg-tl-primary rounded-full min-w-[20px] h-[20px] items-center justify-center px-1">
                          <Text className="text-white text-[10px] font-black">{unread}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TLCard>
              );
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}
