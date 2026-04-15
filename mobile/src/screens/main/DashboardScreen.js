import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, RefreshControl, ActivityIndicator,
  TouchableOpacity, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  BarChart3, 
  Folder, 
  Users, 
  Clock, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCcw,
  MessageCircle,
  ChevronRight,
  Layout
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { getProjects, getTeamMembers } from '../../api/projects';
import api from '../../api/index';

const { width } = Dimensions.get('window');

// Telegram-style stats: Simple, large icons
const StatCard = ({ label, value, color, icon: Icon }) => (
  <View style={{ width: (width - 40) / 2 - 8 }} className="bg-tl-surface rounded-[16px] p-4 mb-3 border border-tl-border">
    <View className="flex-row items-center mb-2">
      <View 
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={20} color={color} strokeWidth={2.5} />
      </View>
      <Text className="text-tl-text text-2xl font-bold">{value}</Text>
    </View>
    <Text className="text-tl-muted text-[13px] font-medium">{label}</Text>
  </View>
);

const getStatusColor = (status) => ({
  active: '#22C55E', planned: '#6366F1', on_hold: '#F59E0B', completed: '#94A3B8'
}[status] || '#94A3B8');

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, team: 0, tasks: 0, alerts: 0 });
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [projectData, userData] = await Promise.all([
        getProjects().catch(() => []),
        getTeamMembers().catch(() => []),
      ]);
      const allTasks = projectData.reduce((acc, p) => [...acc, ...(p.tasks || [])], []);
      const pendingTasks = allTasks.filter(t => t.status !== 'done' && t.status !== 'completed').length;
      let alertCount = 0;
      try {
        const sec = await api.get('/security/alerts?active=true');
        alertCount = sec?.data?.data?.alerts?.length || sec?.data?.data?.length || 0;
      } catch {}

      setProjects(projectData);
      setTeam(userData.slice(0, 5));
      setStats({ projects: projectData.length, team: userData.length, tasks: pendingTasks, alerts: alertCount });
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-tl-bg justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-tl-bg">
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* TELEGRAM HEADER */}
        <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
          <TouchableOpacity>
            <Text className="text-tl-primary text-[17px] font-medium">Edit</Text>
          </TouchableOpacity>
          <View className="flex-row items-center">
            <BarChart3 size={18} color="#F8FAFC" style={{ marginRight: 6 }} strokeWidth={2.5} />
            <Text className="text-tl-text text-[17px] font-bold">Overview</Text>
          </View>
          <TouchableOpacity onPress={() => loadData()} className="w-11 items-end">
            <RefreshCcw size={22} color="#6366F1" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#6366F1" />}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Stats Grid */}
          <View className="px-4 mt-4 flex-row flex-wrap justify-between">
            <StatCard label="Total Projects" value={stats.projects} color="#6366F1" icon={Folder} />
            <StatCard label="Team Members" value={stats.team} color="#22C55E" icon={Users} />
            <StatCard label="Pending Tasks" value={stats.tasks} color="#F59E0B" icon={Clock} />
            <StatCard label="Security Alerts" value={stats.alerts} color={stats.alerts > 0 ? '#EF4444' : '#22C55E'} icon={stats.alerts > 0 ? ShieldAlert : ShieldCheck} />
          </View>

          {/* Recent Projects ListView */}
          <View className="mt-8">
            <View className="flex-row justify-between px-6 mb-3 items-center">
              <Text className="text-tl-muted text-[13px] font-bold uppercase tracking-widest">Recent Projects</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
                <Text className="text-tl-primary text-[14px] font-semibold">See All</Text>
              </TouchableOpacity>
            </View>
            
            <View className="bg-tl-surface border-y border-tl-border">
              {projects.slice(0, 5).map((project) => {
                const color = getStatusColor(project.status);
                return (
                  <TouchableOpacity 
                    key={project.id} 
                    onPress={() => navigation.navigate('Projects')} 
                    className="flex-row items-center px-6 py-4 border-b border-tl-border last:border-0"
                  >
                    <View 
                      className="w-11 h-11 rounded-full items-center justify-center mr-4"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Folder size={20} color={color} strokeWidth={2} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-tl-text text-[17px] font-bold mb-1">{project.name}</Text>
                      <Text className="text-tl-muted text-[14px]">{project.tasks?.length || 0} tasks • {project.status?.replace('_', ' ')}</Text>
                    </View>
                    <ChevronRight size={20} color="#334155" strokeWidth={2.5} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Team List */}
          <View className="mt-8">
            <Text className="text-tl-muted text-[13px] font-bold uppercase tracking-widest px-6 mb-3">My Team</Text>
            <View className="bg-tl-surface border-y border-tl-border">
              {team.map((member) => (
                <View key={member.id} className="flex-row items-center px-6 py-4 border-b border-tl-border last:border-0">
                  <View className="w-11 h-11 rounded-full bg-tl-primary/20 items-center justify-center mr-4 border border-tl-primary/30">
                    <Text className="text-tl-primary text-[18px] font-bold">{(member?.firstName || member?.username || '?')?.charAt(0)?.toUpperCase() || '?'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-tl-text text-[17px] font-bold">{member.firstName} {member.lastName}</Text>
                    <Text className={`text-[13px] font-medium mt-0.5 ${member.status === 'active' ? 'text-tl-success' : 'text-tl-muted'}`}>
                      {member.status === 'active' ? 'online' : 'offline'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('ChatRoom', { conversationId: `direct_${member.id}`, title: member.firstName || member.username })}
                    className="w-9 h-9 rounded-full bg-tl-hover items-center justify-center border border-tl-border"
                  >
                    <MessageCircle size={18} color="#6366F1" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
