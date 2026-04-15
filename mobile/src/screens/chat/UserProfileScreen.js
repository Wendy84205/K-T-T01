import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  MessageCircle, 
  Phone, 
  Video, 
  Bell, 
  Search,
  MoreVertical,
  Mail,
  User,
  ShieldCheck,
  Image as ImageIcon,
  File,
  Link,
  Music
} from 'lucide-react-native';
import { 
  getConversationMessages, 
  muteConversation, 
  deleteConversation, 
  blockUser 
} from '../../api/chat';
import ModernAvatar from '../../components/ModernAvatar';

const { width } = Dimensions.get('window');

const InfoRow = ({ icon: Icon, title, value, isLast }) => (
  <View className={`flex-row items-center px-6 py-3 ${!isLast ? 'border-b border-tl-border' : ''}`}>
    <View className="w-10">
      <Icon size={22} color="#94A3B8" />
    </View>
    <View className="flex-1">
      <Text className="text-[17px] text-tl-text">{value}</Text>
      <Text className="text-[13px] text-tl-muted mt-0.5">{title}</Text>
    </View>
  </View>
);

const MediaItem = ({ icon: Icon, color, title, subtitle, onPress }) => (
  <TouchableOpacity className="flex-row items-center p-4 border-b border-tl-border" onPress={onPress}>
    <View 
      className="w-8 h-8 rounded-[6px] items-center justify-center mr-4"
      style={{ backgroundColor: color }}
    >
      <Icon size={20} color="#fff" />
    </View>
    <View className="flex-1">
      <Text className="text-[17px] text-tl-text">{title}</Text>
      <Text className="text-[13px] text-tl-muted">{subtitle}</Text>
    </View>
    <ChevronLeft size={18} color="#475569" style={{ transform: [{ rotate: '180deg' }] }} />
  </TouchableOpacity>
);

export default function UserProfileScreen({ route, navigation }) {
  const { user: otherUser, conversationId } = route.params;
  const [stats, setStats] = React.useState({ media: 0, files: 0, links: 0, audio: 0 });
  const [loading, setLoading] = React.useState(true);
  const [isMuted, setIsMuted] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!conversationId) return;
        const messages = await getConversationMessages(conversationId, 1, 100);
        
        let mediaCount = 0;
        let filesCount = 0;
        let linksCount = 0;
        let audioCount = 0;

        messages.forEach(msg => {
          if (msg.messageType === 'image') mediaCount++;
          else if (msg.messageType === 'file') filesCount++;
          else if (msg.messageType === 'audio') audioCount++;
          
          if (msg.content && (msg.content.includes('http://') || msg.content.includes('https://'))) {
            linksCount++;
          }
        });

        setStats({ media: mediaCount, files: filesCount, links: linksCount, audio: audioCount });
      } catch (err) {
        console.error('[Profile] Fetch stats failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [conversationId]);

  const toggleMute = async () => {
    setActionLoading(true);
    try {
      await muteConversation(conversationId, !isMuted);
      setIsMuted(!isMuted);
      Alert.alert('Success', isMuted ? 'Notifications enabled' : 'Chat muted');
    } catch {
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Chat', 'Are you sure you want to delete all messages? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteConversation(conversationId);
            navigation.navigate('Chat');
          } catch {
            Alert.alert('Error', 'Failed to delete conversation');
          }
        }
      }
    ]);
  };

  const handleBlock = () => {
    Alert.alert('Block User', `Are you sure you want to block ${otherUser?.name}? They will not be able to message or call you.`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Block', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await blockUser(otherUser.id);
            Alert.alert('Blocked', 'User has been blocked');
          } catch {
            Alert.alert('Error', 'Failed to block user');
          }
        }
      }
    ]);
  };

  const navigateToShared = (type, title) => {
    navigation.navigate('SharedMedia', { conversationId, type, title });
  };

  const handleBack = () => navigation.goBack();

  return (
    <View className="flex-1 bg-tl-bg">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Section */}
        <View className="bg-tl-hover pb-6 border-b border-tl-border">
          <SafeAreaView edges={['top']} className="px-4">
            <View className="flex-row justify-between items-center h-11">
              <TouchableOpacity onPress={handleBack}>
                <ChevronLeft size={28} color="#6366F1" strokeWidth={2.5} />
              </TouchableOpacity>
              <View className="flex-row">
                <TouchableOpacity className="ml-5"><Search size={22} color="#F8FAFC" /></TouchableOpacity>
                <TouchableOpacity className="ml-5"><MoreVertical size={22} color="#F8FAFC" /></TouchableOpacity>
              </View>
            </View>

            <View className="items-center mt-3">
              <View className="border-[3px] border-tl-primary/30 rounded-full p-1 shadow-sm">
                <ModernAvatar name={otherUser?.name || `${otherUser?.firstName} ${otherUser?.lastName}`} size={100} />
              </View>
              <Text className="text-[24px] font-bold text-tl-text mt-4">
                {otherUser?.firstName ? `${otherUser.firstName} ${otherUser.lastName || ''}` : (otherUser?.name || 'Secure Contact')}
              </Text>
              <Text className="text-[15px] text-tl-muted mt-1 font-medium">{otherUser?.role || 'Security User'}</Text>
            </View>
          </SafeAreaView>
        </View>

        {/* Action Buttons */}
        <View className="flex-row bg-tl-surface py-4 border-b border-tl-border">
          <TouchableOpacity className="flex-1 items-center" onPress={() => navigation.goBack()}>
            <View className="w-10 h-10 rounded-full bg-tl-bg items-center justify-center mb-1 border border-tl-border">
              <MessageCircle size={22} color="#6366F1" />
            </View>
            <Text className="text-[12px] color-tl-primary font-bold">Message</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center" onPress={() => Alert.alert('Call', 'Secure Voice Call is initializing...')}>
            <View className="w-10 h-10 rounded-full bg-tl-bg items-center justify-center mb-1 border border-tl-border">
              <Phone size={22} color="#6366F1" />
            </View>
            <Text className="text-[12px] color-tl-primary font-bold">Call</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center" onPress={() => Alert.alert('Video', 'Secure Video Call is initializing...')}>
            <View className="w-10 h-10 rounded-full bg-tl-bg items-center justify-center mb-1 border border-tl-border">
              <Video size={22} color="#6366F1" />
            </View>
            <Text className="text-[12px] color-tl-primary font-bold">Video</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center" onPress={toggleMute} disabled={actionLoading}>
            <View className="w-10 h-10 rounded-full bg-tl-bg items-center justify-center mb-1 border border-tl-border">
              <Bell size={22} color={isMuted ? '#64748B' : '#6366F1'} />
            </View>
            <Text className={`text-[12px] font-bold ${isMuted ? 'text-tl-muted' : 'text-tl-primary'}`}>
              {actionLoading ? '...' : isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Table */}
        <View className="bg-tl-surface border-y border-tl-border mt-3">
          <InfoRow 
            icon={Mail} 
            title="Email" 
            value={otherUser?.email || 'N/A'} 
          />
          <InfoRow 
            icon={User} 
            title="Account Type" 
            value={otherUser?.role || 'Standard'} 
          />
          <InfoRow 
            icon={ShieldCheck} 
            title="Encryption" 
            value="Active (E2EE)" 
            isLast={true}
          />
        </View>

        {/* Shared Content */}
        <Text className="text-[13px] text-tl-muted uppercase font-bold tracking-widest ml-6 mt-8 mb-3">Shared Content</Text>
        <View className="bg-tl-surface border-y border-tl-border">
          <MediaItem 
            icon={ImageIcon} 
            color="#6366F1" 
            title="Media" 
            subtitle={loading ? '...' : `${stats.media} photos`} 
            onPress={() => navigateToShared('media', 'Photos')}
          />
          <MediaItem 
            icon={File} 
            color="#22C55E" 
            title="Files" 
            subtitle={loading ? '...' : `${stats.files} documents`} 
            onPress={() => navigateToShared('files', 'Documents')}
          />
          <MediaItem 
            icon={Link} 
            color="#F59E0B" 
            title="Links" 
            subtitle={loading ? '...' : `${stats.links} links`} 
            onPress={() => navigateToShared('links', 'Shared Links')}
          />
          <MediaItem 
            icon={Music} 
            color="#8B5CF6" 
            title="Audio" 
            subtitle={loading ? '...' : `${stats.audio} voice messages`} 
            onPress={() => navigateToShared('audio', 'Voice Messages')}
          />
        </View>

        {/* Footer Actions */}
        <TouchableOpacity 
          className="bg-tl-surface border-y border-tl-border mt-8"
          onPress={handleBlock}
        >
          <Text className="text-[17px] text-tl-error font-bold text-center py-4">Block User</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-tl-surface border-b border-tl-border mt-1"
          onPress={handleDelete}
        >
          <Text className="text-[17px] text-tl-error font-bold text-center py-4">Delete Chat</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
