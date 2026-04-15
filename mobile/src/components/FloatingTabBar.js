import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform, Dimensions } from 'react-native';
import { 
  LayoutDashboard, 
  Briefcase, 
  ClipboardCheck, 
  Shield, 
  MessageCircle, 
  Settings as SettingsIcon,
} from 'lucide-react-native';
import { getNotifications } from '../api/notifications';
import { getTotalUnreadCount } from '../api/chat';

const { width } = Dimensions.get('window');

// Cấu hình tab — Dark Theme CyberSecure
const TAB_CONFIG = {
  // Manager
  Dashboard: { icon: LayoutDashboard, label: 'Overview' },
  Projects:  { icon: Briefcase,       label: 'Projects' },
  // User
  Tasks:     { icon: ClipboardCheck,  label: 'Tasks' },
  Vault:     { icon: Shield,          label: 'Vault' },
  // Shared
  Chat:      { icon: MessageCircle,   label: 'Chats' },
  Settings:  { icon: SettingsIcon,    label: 'Settings' },
};

// Colors — tl-* design tokens
const DARK_BG     = '#1E293B'; // tl-surface
const ACTIVE_CLR  = '#6366F1'; // tl-primary
const ACTIVE_BG   = 'rgba(99,102,241,0.15)';
const INACTIVE    = '#94A3B8'; // tl-muted
const BADGE_CLR   = '#EF4444';
const BORDER_CLR  = '#334155'; // tl-border

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const [unreadCount, setUnreadCount]         = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const scaleRefs = useRef(state.routes.map(() => new Animated.Value(1))).current;

  // Poll unread counts mỗi 10s
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [notifResult, chatResult] = await Promise.all([
          getNotifications(1, 1).catch(() => ({ unreadCount: 0 })),
          getTotalUnreadCount().catch(() => 0),
        ]);
        if (mounted) {
          setUnreadCount(notifResult?.unreadCount || 0);
          setChatUnreadCount(chatResult || 0);
        }
      } catch {}
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const handlePress = (route, index, isFocused) => {
    Animated.sequence([
      Animated.spring(scaleRefs[index], { toValue: 0.88, useNativeDriver: true, speed: 60 }),
      Animated.spring(scaleRefs[index], { toValue: 1,    useNativeDriver: true, speed: 20 }),
    ]).start();

    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        paddingTop: 8,
        paddingHorizontal: 12,
        backgroundColor: DARK_BG,
        borderTopWidth: 1,
        borderTopColor: BORDER_CLR,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        // Shadow phía trên
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 20,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const cfg = TAB_CONFIG[route.name] || { icon: null, label: route.name };
        const IconComponent = cfg.icon;
        const isChat = route.name === 'Chat';
        const badgeCount = isChat
          ? chatUnreadCount
          : (route.name === 'Dashboard')
            ? unreadCount
            : 0;

        return (
          <Animated.View
            key={route.key}
            style={{ flex: 1, transform: [{ scale: scaleRefs[index] }] }}
          >
            <TouchableOpacity
              onPress={() => handlePress(route, index, isFocused)}
              style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}
              activeOpacity={0.8}
            >
              {/* Active background pill */}
              {isFocused && (
                <View style={{
                  position: 'absolute',
                  top: -2,
                  width: 52,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: ACTIVE_BG,
                }} />
              )}

              {/* Icon */}
              <View style={{ height: 30, justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                {IconComponent ? (
                  <IconComponent
                    size={24}
                    color={isFocused ? ACTIVE_CLR : INACTIVE}
                    strokeWidth={isFocused ? 2.5 : 1.8}
                  />
                ) : (
                  <Text style={{ color: isFocused ? ACTIVE_CLR : INACTIVE }}>•</Text>
                )}
              </View>

              {/* Badge */}
              {badgeCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -4,
                  right: '20%',
                  backgroundColor: BADGE_CLR,
                  borderRadius: 10,
                  minWidth: 18,
                  paddingHorizontal: 4,
                  height: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: DARK_BG,
                  zIndex: 2,
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Text>
                </View>
              )}

              {/* Label */}
              <Text style={{
                fontSize: 10,
                marginTop: 3,
                fontWeight: isFocused ? '700' : '500',
                color: isFocused ? ACTIVE_CLR : INACTIVE,
                letterSpacing: 0.2,
              }}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}
