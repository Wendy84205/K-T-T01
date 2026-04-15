import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions, Image, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, File, Link, Music } from 'lucide-react-native';
import { getConversationMessages } from '../../api/chat';

const { width } = Dimensions.get('window');

export default function SharedMediaScreen({ route, navigation }) {
  const { conversationId, type, title } = route.params; // type: 'media' | 'files' | 'links' | 'audio'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const messages = await getConversationMessages(conversationId, 1, 100);
        let filtered = [];
        
        if (type === 'media') {
          filtered = messages.filter(m => m.messageType === 'image');
        } else if (type === 'files') {
          filtered = messages.filter(m => m.messageType === 'file');
        } else if (type === 'audio') {
          filtered = messages.filter(m => m.messageType === 'audio');
        } else if (type === 'links') {
          filtered = messages.filter(m => m.content && (m.content.includes('http://') || m.content.includes('https://')));
        }
        
        setItems(filtered);
      } catch (err) {
        console.error('[SharedMedia] Load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [conversationId, type]);

  const renderItem = ({ item }) => {
    if (type === 'media') {
      return (
        <TouchableOpacity className="m-[1px]" style={{ width: width / 3 - 2, height: width / 3 - 2 }}>
          <Image source={{ uri: item.content }} className="w-full h-full" />
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity className="flex-row items-center py-4 border-b border-tl-border bg-tl-bg px-6">
        <View 
          className="w-11 h-11 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: type === 'files' ? '#22C55E15' : type === 'links' ? '#F59E0B15' : '#6366F115' }}
        >
          {type === 'files' ? <File size={20} color="#22C55E" /> : 
           type === 'links' ? <Link size={20} color="#F59E0B" /> : 
           <Music size={20} color="#6366F1" />}
        </View>
        <View className="flex-1">
          <Text className="text-[16px] font-bold text-tl-text mb-1" numberOfLines={1}>{item.content}</Text>
          <Text className="text-[13px] text-tl-muted font-medium">{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-tl-bg">
      <SafeAreaView className="bg-tl-surface border-b border-tl-border" edges={['top']}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center px-4 h-14">
          <ChevronLeft size={28} color="#6366F1" strokeWidth={2.5} />
          <Text className="text-[18px] font-bold text-tl-text ml-2">{title}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {loading ? (
        <View className="flex-1 justify-center items-center"><ActivityIndicator color="#6366F1" size="large" /></View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id?.toString()}
          numColumns={type === 'media' ? 3 : 1}
          contentContainerStyle={{ paddingBottom: 100, padding: type === 'media' ? 2 : 0 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-[16px] text-tl-muted font-medium">No {type} shared yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
