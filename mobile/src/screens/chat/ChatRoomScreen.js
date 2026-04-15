import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSocket } from '../../context/SocketContext';
import { getConversationMessages, sendMessage } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';
import { useE2EE } from '../../context/E2EEContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatRoomScreen({ route, navigation }) {
  const { conversationId, title } = route.params;
  const { user } = useAuth();
  const { socket, joinConversation, leaveConversation } = useSocket();
  const { decrypt, isLocked } = useE2EE();
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: title || 'Secure Channel',
      headerStyle: { backgroundColor: '#1E293B' }, // tl-surface
      headerTintColor: '#F8FAFC', // tl-text
      headerTitleStyle: { fontWeight: '600' },
      headerShadowVisible: false,
    });

    loadMessages();
    joinConversation(conversationId);

    if (socket) {
      socket.on('newMessage', handleNewMessage);
    }

    return () => {
      leaveConversation(conversationId);
      if (socket) socket.off('newMessage', handleNewMessage);
    };
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      const data = await getConversationMessages(conversationId);
      const decryptedMessages = await Promise.all((data || []).map(async (msg) => ({
        ...msg,
        content: await decrypt(msg)
      })));
      setMessages(decryptedMessages);
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = async (msg) => {
    if (msg.conversationId === conversationId) {
      const decryptedContent = await decrypt(msg);
      setMessages((prev) => [...prev, { ...msg, content: decryptedContent }]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    const content = text;
    setText('');
    
    const tempMsg = {
      id: `temp-${Date.now()}`,
      content: content,
      senderId: user.id,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await sendMessage(conversationId, content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.senderId === user.id;
    const time = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <View className={`mb-4 flex-row px-6 ${isMine ? 'justify-end' : 'justify-start'}`}>
        {!isMine && (
          <View className="w-8 h-8 rounded-[6px] bg-tl-hover items-center justify-center mr-3 mt-1">
             <Text className="text-tl-muted font-bold text-[12px]">{title?.charAt(0) || '?'}</Text>
          </View>
        )}
        <View 
          className={`rounded-[12px] px-4 py-3 max-w-[75%] ${
            isMine 
              ? 'bg-tl-primary' 
              : 'bg-tl-surface border border-tl-border'
          }`}
          style={{
             borderTopRightRadius: isMine ? 4 : 12,
             borderTopLeftRadius: !isMine ? 4 : 12,
          }}
        >
          <Text className={`${isMine ? 'text-white' : 'text-tl-text'} text-[14px] leading-5`}>
            {item.content}
          </Text>
          <View className="flex-row justify-end items-center mt-2">
            <Text className={`text-[10px] ${isMine ? 'text-white/70' : 'text-tl-muted'}`}>
              {time}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-tl-bg">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View className="flex-1">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator color="#6366F1" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id?.toString()}
              renderItem={renderMessage}
              contentContainerStyle={{ paddingVertical: 24 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
          )}
        </View>

        <SafeAreaView edges={['bottom']} className="bg-tl-surface border-t border-tl-border">
          <View className="flex-row p-4 items-center">
            <View className="flex-1 bg-tl-bg rounded-[8px] px-4 py-1.5 border border-tl-border flex-row items-center">
              <TextInput
                className="flex-1 text-tl-text text-[14px] py-2"
                placeholder="Type your message..."
                placeholderTextColor="#94A3B8"
                value={text}
                onChangeText={setText}
                multiline
                maxHeight={100}
              />
              <TouchableOpacity className="ml-2">
                 <Text className="text-tl-muted">📎</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              onPress={handleSend}
              disabled={!text.trim()}
              className={`ml-3 rounded-[8px] px-4 py-3 items-center justify-center ${text.trim() ? 'bg-tl-primary' : 'bg-tl-hover'}`}
            >
              <Text className={`font-semibold text-[14px] ${text.trim() ? 'text-white' : 'text-tl-muted'}`}>
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
