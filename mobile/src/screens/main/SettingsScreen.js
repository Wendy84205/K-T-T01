import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TelegramSettingsRow from '../../components/TelegramSettingsRow';
import CyberLogo from '../../components/CyberLogo';
import CyberInput from '../../components/CyberInput';
import CyberButton from '../../components/CyberButton';
import { 
  Bell, Lock, ShieldCheck, MonitorSmartphone, LogOut, 
  User, Mail, Save, Smartphone, Monitor, Trash2, 
  RefreshCcw, Shield, ChevronLeft, CheckCircle2
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { getNotifications, markAllNotificationsRead } from '../../api/notifications';

export default function SettingsScreen({ navigation }) {
  const { logout, user } = useAuth();

  // States
  const [activeSection, setActiveSection] = useState(null); // null = main menu
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Profile
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');

  // Security
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);

  // Derived
  const initial = (user?.firstName || user?.username || '?').charAt(0).toUpperCase();
  const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.username || 'User';

  // ── Load functions ──
  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await api.get('/users/profile/sessions');
      setSessions(Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      console.error('[Settings] Sessions failed:', err);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setNotifsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data.slice(0, 20) : []);
    } catch (err) {
      console.error('[Settings] Notifications failed:', err);
    } finally {
      setNotifsLoading(false);
    }
  }, []);

  // ── Handlers ──
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.patch('/users/profile', { firstName, lastName, email });
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    Alert.alert('Revoke Session', 'This device will lose access immediately.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/users/profile/sessions/${sessionId}`);
          setSessions(prev => prev.filter(s => s.id !== sessionId));
        } catch (err) {
          Alert.alert('Error', 'Failed to revoke session.');
        }
      }}
    ]);
  };

  const handleToggleMFA = async () => {
    const newVal = !mfaEnabled;
    setMfaEnabled(newVal);
    try {
      await api.patch('/users/profile', { mfaEnabled: newVal });
    } catch (err) {
      setMfaEnabled(!newVal); // rollback
      Alert.alert('Error', 'Failed to update MFA setting.');
    }
  };

  const handleClearNotifications = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      Alert.alert('Done', 'All notifications marked as read.');
    } catch (err) {
      Alert.alert('Error', 'Failed to clear notifications.');
    }
  };

  // Load data when entering a section
  useEffect(() => {
    if (activeSection === 'security') loadSessions();
    if (activeSection === 'notifications') loadNotifications();
  }, [activeSection]);

  // ── SUB-SCREEN: Edit Profile ──
  if (activeSection === 'profile') {
    return (
      <View className="flex-1 bg-tl-bg">
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="flex-row items-center px-4 h-14 border-b border-tl-border">
            <TouchableOpacity onPress={() => setActiveSection(null)} className="p-2">
              <ChevronLeft size={28} color="#6366F1" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-tl-text text-[18px] font-bold flex-1 text-center mr-10">Edit Profile</Text>
          </View>
          <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 120 }}>
            <Text className="text-tl-muted text-[12px] font-bold uppercase mb-2">First Name</Text>
            <CyberInput placeholder="First Name" value={firstName} onChangeText={setFirstName} icon={User} />
            
            <Text className="text-tl-muted text-[12px] font-bold uppercase mb-2">Last Name</Text>
            <CyberInput placeholder="Last Name" value={lastName} onChangeText={setLastName} icon={User} />

            <Text className="text-tl-muted text-[12px] font-bold uppercase mb-2">Email</Text>
            <CyberInput placeholder="Email" value={email} onChangeText={setEmail} icon={Mail} keyboardType="email-address" autoCapitalize="none" />

            <View className="mt-4">
              <CyberButton onPress={handleSaveProfile} loading={saving} title={saving ? 'Saving...' : 'Save Changes'} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ── SUB-SCREEN: Security & Sessions ──
  if (activeSection === 'security') {
    return (
      <View className="flex-1 bg-tl-bg">
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="flex-row items-center px-4 h-14 border-b border-tl-border">
            <TouchableOpacity onPress={() => setActiveSection(null)} className="p-2">
              <ChevronLeft size={28} color="#6366F1" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-tl-text text-[18px] font-bold flex-1 text-center mr-10">Security</Text>
          </View>
          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
            {/* MFA Toggle */}
            <View className="bg-tl-surface border-b border-tl-border px-6 py-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-tl-primary/15 rounded-[10px] items-center justify-center mr-4">
                    <ShieldCheck size={22} color="#6366F1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-tl-text text-[16px] font-bold">Two-Factor Authentication</Text>
                    <Text className="text-tl-muted text-[13px] mt-0.5">Require OTP on every login</Text>
                  </View>
                </View>
                <Switch
                  value={mfaEnabled}
                  onValueChange={handleToggleMFA}
                  trackColor={{ false: '#334155', true: '#6366F1' }}
                  thumbColor="#F8FAFC"
                />
              </View>
            </View>

            {/* Sessions Header */}
            <View className="flex-row justify-between items-center px-6 pt-6 pb-3">
              <Text className="text-tl-muted text-[11px] font-bold uppercase tracking-widest">Active Sessions</Text>
              <TouchableOpacity onPress={loadSessions}>
                <RefreshCcw size={16} color="#6366F1" />
              </TouchableOpacity>
            </View>

            {sessionsLoading ? (
              <View className="py-10 items-center">
                <ActivityIndicator color="#6366F1" />
              </View>
            ) : sessions.length === 0 ? (
              <View className="py-10 items-center">
                <Text className="text-tl-muted text-[14px]">No active sessions found</Text>
              </View>
            ) : (
              <View className="bg-tl-surface border-y border-tl-border">
                {sessions.map((session, i) => (
                  <View key={session.id || i} className={`flex-row items-center px-6 py-4 ${i < sessions.length - 1 ? 'border-b border-tl-border' : ''}`}>
                    <View className="w-10 h-10 bg-tl-hover rounded-[10px] items-center justify-center mr-4">
                      {(session.device || '').includes('Mobile') || (session.device || '').includes('iPhone') ? (
                        <Smartphone size={20} color="#94A3B8" />
                      ) : (
                        <Monitor size={20} color="#94A3B8" />
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-tl-text text-[15px] font-bold">{session.device || 'Unknown Device'}</Text>
                        {session.isCurrent && (
                          <View className="ml-2 bg-tl-success/15 px-2 py-0.5 rounded-full">
                            <Text className="text-tl-success text-[10px] font-bold">CURRENT</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-tl-muted text-[12px] mt-0.5">
                        IP: {session.ipAddress || 'Unknown'} • {session.lastActive ? new Date(session.lastActive).toLocaleDateString() : 'N/A'}
                      </Text>
                    </View>
                    {!session.isCurrent && (
                      <TouchableOpacity onPress={() => handleRevokeSession(session.id)}>
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ── SUB-SCREEN: Notifications ──
  if (activeSection === 'notifications') {
    return (
      <View className="flex-1 bg-tl-bg">
        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="flex-row items-center px-4 h-14 border-b border-tl-border">
            <TouchableOpacity onPress={() => setActiveSection(null)} className="p-2">
              <ChevronLeft size={28} color="#6366F1" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text className="text-tl-text text-[18px] font-bold flex-1 text-center">Notifications</Text>
            <TouchableOpacity onPress={handleClearNotifications} className="p-2">
              <CheckCircle2 size={22} color="#6366F1" />
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={notifsLoading} onRefresh={loadNotifications} tintColor="#6366F1" />}
          >
            {notifications.length === 0 ? (
              <View className="py-20 items-center">
                <View className="w-16 h-16 bg-tl-surface rounded-full items-center justify-center mb-4 border border-tl-border">
                  <Bell size={28} color="#334155" />
                </View>
                <Text className="text-tl-muted text-[15px] font-bold">No notifications</Text>
                <Text className="text-tl-muted/60 text-[13px] mt-1">You're all caught up!</Text>
              </View>
            ) : (
              notifications.map((n, i) => (
                <View key={n.id || i} className={`flex-row items-start px-6 py-4 ${i < notifications.length - 1 ? 'border-b border-tl-border' : ''}`}>
                  <View 
                    className="w-2.5 h-2.5 rounded-full mt-1.5 mr-4"
                    style={{ backgroundColor: n.isRead ? '#334155' : (n.type === 'error' || n.type === 'security' ? '#EF4444' : '#6366F1') }}
                  />
                  <View className="flex-1">
                    <Text className="text-tl-text text-[15px] font-bold mb-0.5">{n.title || 'System Notification'}</Text>
                    <Text className="text-tl-muted text-[13px] leading-5">{n.message || n.content || ''}</Text>
                    <Text className="text-tl-muted/50 text-[11px] mt-1 font-medium">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ── MAIN SETTINGS MENU ──
  return (
    <View className="flex-1 bg-tl-bg">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-row justify-between items-center px-6 pt-4 pb-3 border-b border-tl-border">
          <Text className="text-tl-text text-[24px] font-bold">Settings</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {/* ── Profile Card ── */}
          <TouchableOpacity 
            onPress={() => setActiveSection('profile')}
            activeOpacity={0.7}
            className="bg-tl-surface border-b border-tl-border pt-8 pb-6 items-center mb-2"
          >
            <View
              style={{
                width: 88, height: 88, borderRadius: 44, backgroundColor: '#6366F1',
                alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
              }}
            >
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', borderTopLeftRadius: 44, borderTopRightRadius: 44, backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <Text style={{ color: '#fff', fontSize: 36, fontWeight: '900' }}>{initial}</Text>
            </View>

            <Text className="text-tl-text text-[22px] font-bold">{fullName}</Text>
            <Text className="text-tl-muted text-[14px] mt-1 font-medium">
              {user?.role || 'Member'} • @{user?.username || 'user'}
            </Text>
            {user?.email && <Text className="text-tl-muted text-[13px] mt-0.5">{user.email}</Text>}

            <View className="flex-row items-center mt-3 bg-tl-success/10 px-4 py-1.5 rounded-full border border-tl-success/20">
              <View className="w-2 h-2 rounded-full bg-tl-success mr-2" />
              <Text className="text-tl-success text-[11px] font-bold uppercase tracking-wider">Active Session</Text>
            </View>

            <Text className="text-tl-primary text-[13px] mt-3 font-medium">Tap to edit profile →</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View className="items-center py-6 mb-2">
            <CyberLogo size="sm" horizontal />
          </View>

          {/* ── Group 1: Preferences ── */}
          <Text className="text-tl-muted text-[11px] font-bold uppercase tracking-widest mb-2 ml-6">
            Preferences
          </Text>
          <View className="bg-tl-surface border-y border-tl-border mb-6">
            <TelegramSettingsRow 
              icon={Bell} iconBg="bg-teal-600" title="Notifications" 
              onPress={() => setActiveSection('notifications')}
            />
            <TelegramSettingsRow 
              icon={Shield} iconBg="bg-purple-600" title="Appearance" value="Dark Theme" isLast={true} 
            />
          </View>

          {/* ── Group 2: Account & Security ── */}
          <Text className="text-tl-muted text-[11px] font-bold uppercase tracking-widest mb-2 ml-6">
            Account {'&'} Security
          </Text>
          <View className="bg-tl-surface border-y border-tl-border mb-6">
            <TelegramSettingsRow 
              icon={ShieldCheck} iconBg="bg-indigo-600" title="Two-Factor Auth" 
              value={mfaEnabled ? 'Enabled' : 'Disabled'}
              onPress={() => setActiveSection('security')}
            />
            <TelegramSettingsRow 
              icon={MonitorSmartphone} iconBg="bg-orange-600" title="Active Sessions" 
              onPress={() => setActiveSection('security')}
              isLast={true}
            />
          </View>

          {/* ── Danger Zone ── */}
          <View className="bg-tl-surface border-y border-tl-border mb-4">
            <TelegramSettingsRow
              icon={LogOut} iconBg="bg-red-600" title="Log Out" color="text-red-400" isLast={true}
              onPress={() => {
                Alert.alert(
                  'Log Out',
                  'Are you sure you want to securely wipe your session key and log out?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Log Out', style: 'destructive', onPress: logout },
                  ]
                );
              }}
            />
          </View>

          <Text className="text-tl-muted text-[11px] text-center font-bold uppercase tracking-widest mt-2 mb-4 opacity-40">
            CyberSecure v2.0 · Enterprise
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
