import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  CheckCircle2, 
  Circle, 
  ClipboardCheck, 
  Search, 
  RefreshCcw, 
  Folder,
  ChevronRight
} from 'lucide-react-native';
import { getMyTasks, updateTaskStatus } from '../../api/tasks';
import ModernAvatar from '../../components/ModernAvatar';

const STATUS_TABS = ['All', 'Pending', 'In Progress', 'Done'];

const normStatus = (s) => {
  if (!s || s === 'todo' || s === 'pending') return 'Pending';
  if (s === 'completed' || s === 'done') return 'Done';
  if (s === 'in_progress' || s === 'in-progress') return 'In Progress';
  return 'Pending';
};

const TaskItem = ({ task, onUpdateStatus }) => {
  const status = normStatus(task.status);
  const isDone = status === 'Done';
  
  const handleCycleStatus = () => {
    const map = { 'Pending': 'in_progress', 'In Progress': 'done', 'Done': 'pending' };
    onUpdateStatus(task.id, map[status] || 'pending');
  };

  return (
    <View className="flex-row items-center px-6 py-4 border-b border-tl-border bg-tl-bg">
      <TouchableOpacity onPress={handleCycleStatus} className="mr-4">
        {isDone ? (
          <CheckCircle2 size={26} color="#22C55E" fill="#22C55E20" strokeWidth={2.5} />
        ) : status === 'In Progress' ? (
          <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2.5, borderColor: '#6366F1', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#6366F1' }} />
          </View>
        ) : (
          <Circle size={26} color="#475569" strokeWidth={2} />
        )}
      </TouchableOpacity>
      <View className="flex-1 pr-2">
        <Text className={`text-[17px] font-bold mb-1.5 ${isDone ? 'text-tl-muted line-through' : 'text-tl-text'}`}>{task.title}</Text>
        <View className="flex-row items-center">
          <ModernAvatar name={task.project?.name || 'Personal'} size={18} />
          <Text className="text-[14px] text-tl-muted ml-2 font-medium">{task.project?.name || 'Personal'}</Text>
        </View>
      </View>
      <View className="items-end">
        <View 
          className="rounded-full px-2.5 py-0.5"
          style={{ backgroundColor: isDone ? '#22C55E15' : (status === 'In Progress' ? '#6366F115' : '#1E293B') }}
        >
          <Text className={`text-[11px] font-bold uppercase tracking-wider ${isDone ? 'text-tl-success' : (status === 'In Progress' ? 'text-tl-primary' : 'text-tl-muted')}`}>
            {status}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function UserTasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const loadTasks = useCallback(async () => {
    try { setTasks(await getMyTasks()); } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadTasks(); }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try { await updateTaskStatus(taskId, newStatus); } catch { loadTasks(); }
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab !== 'All' && normStatus(t.status) !== activeTab) return false;
    const title = t?.title || '';
    return title.toLowerCase().includes((search || '').toLowerCase());
  });

  if (loading && !refreshing) {
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
            <ClipboardCheck size={20} color="#F8FAFC" style={{ marginRight: 6 }} strokeWidth={2.5} />
            <Text className="text-tl-text text-[17px] font-bold">Tasks</Text>
          </View>
          <TouchableOpacity onPress={loadTasks} className="w-11 items-end">
            <RefreshCcw size={22} color="#6366F1" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR CHUẨN */}
        <View className="px-6 pb-4">
          <View className="bg-tl-surface rounded-[10px] h-10 flex-row items-center px-3 border border-tl-border">
            <Search size={18} color="#94A3B8" strokeWidth={2} style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-tl-text text-[16px] h-full"
              placeholder="Search tasks"
              placeholderTextColor="#64748B"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* SEGMENTED CONTROL */}
        {!search && (
          <View className="px-6 pb-4">
            <View className="bg-tl-surface rounded-full p-1 flex-row border border-tl-border">
              {STATUS_TABS.map((tab) => {
                const isActive = activeTab === tab;
                const count = tab === 'All' ? tasks.length : tasks.filter(t => normStatus(t.status) === tab).length;
                return (
                  <TouchableOpacity
                    key={tab} onPress={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-full ${isActive ? 'bg-tl-bg border border-tl-border' : ''}`}
                  >
                    <Text className={`text-center text-[13px] font-bold ${isActive ? 'text-tl-text' : 'text-tl-muted'}`}>
                      {tab} {count > 0 ? `(${count})` : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id?.toString()}
          renderItem={({ item }) => <TaskItem task={item} onUpdateStatus={handleUpdateStatus} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTasks(); }} tintColor="#6366F1" />}
          contentContainerStyle={{ paddingBottom: 120 }}
          className="border-t border-tl-border"
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}
