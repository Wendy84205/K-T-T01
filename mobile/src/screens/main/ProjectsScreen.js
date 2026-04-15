import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, FlatList, RefreshControl, ActivityIndicator,
  TouchableOpacity, TextInput, Modal, Alert, Animated, Dimensions,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Folder, 
  Plus, 
  Search, 
  Trash2, 
  User as UserIcon, 
  CheckCircle2, 
  Circle,
  ChevronRight,
  Clock,
  Layout
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import {
  getProjects, createProject, deleteProject,
  getProjectTasks, createTask, updateTask, deleteTask, getTeamMembers
} from '../../api/projects';
import ModernAvatar from '../../components/ModernAvatar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const getStatusColor = s => ({ active: '#22C55E', planned: '#6366F1', on_hold: '#F59E0B', completed: '#94A3B8' }[s] || '#94A3B8');
const PRIORITY_COLORS = { low: '#94A3B8', medium: '#6366F1', high: '#F59E0B', critical: '#EF4444' };

const TASK_STATUS_CYCLE = { todo: 'in_progress', in_progress: 'done', done: 'todo' };

const TaskItem = ({ task, onToggle, onDelete, teamMembers }) => {
  const isDone = task.status === 'done' || task.status === 'completed';
  const assignee = task.assignee || teamMembers?.find(m => m.id === task.assigneeId);
  const assigneeName = assignee ? `${assignee.firstName || ''} ${assignee.lastName || ''}`.trim() : null;

  return (
    <View className="flex-row items-center py-3 border-b border-tl-border bg-tl-surface px-4">
      <TouchableOpacity onPress={() => onToggle(task)} className="mr-3">
        {isDone ? (
          <CheckCircle2 size={24} color="#22C55E" fill="#22C55E20" strokeWidth={2.5} />
        ) : (
          <Circle size={24} color="#334155" strokeWidth={2} />
        )}
      </TouchableOpacity>
      <View className="flex-1">
        <Text className={`text-[15px] font-medium ${isDone ? 'text-tl-muted line-through' : 'text-tl-text'}`}>{task.title}</Text>
        {assigneeName && (
          <View className="flex-row items-center mt-1">
            <UserIcon size={12} color="#94A3B8" style={{ marginRight: 4 }} />
            <Text className="text-[12px] text-tl-muted">{assigneeName}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={() => onDelete(task)} className="ml-2">
        <Trash2 size={18} color="#EF4444" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
};

export default function ProjectsScreen() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Project Creation
  const [createVisible, setCreateVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Drawer
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [p, t] = await Promise.all([getProjects().catch(() => []), getTeamMembers().catch(() => [])]);
      setProjects(p); setTeamMembers(t);
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, []);

  const openDrawer = (project) => {
    setSelectedProject(project); setDrawerVisible(true);
    getProjectTasks(project.id).then(setTasks).catch(console.error);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
  };
  const closeDrawer = () => {
    Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, useNativeDriver: true, duration: 250 }).start(() => {
      setDrawerVisible(false); setSelectedProject(null); setTasks([]);
    });
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    try {
      await createProject({ name: newProjectName.trim(), description: newProjectDesc.trim() || 'Secure initiative' });
      setCreateVisible(false);
      setNewProjectName('');
      setNewProjectDesc('');
      loadData();
    } catch (e) {
      Alert.alert('Error', 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const filtered = projects.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()));

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
            <Folder size={18} color="#F8FAFC" style={{ marginRight: 6 }} strokeWidth={2.5} />
            <Text className="text-tl-text text-[17px] font-bold">Projects</Text>
          </View>
          <TouchableOpacity onPress={() => setCreateVisible(true)} className="w-11 items-end">
            <Plus size={28} color="#6366F1" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR CHUẨN */}
        <View className="px-6 pb-4">
          <View className="bg-tl-surface rounded-[10px] h-10 flex-row items-center px-3 border border-tl-border">
            <Search size={18} color="#94A3B8" strokeWidth={2} style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-tl-text text-[16px] h-full"
              placeholder="Search projects"
              placeholderTextColor="#64748B"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#6366F1" />} 
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="border-t border-tl-border">
            {filtered.map(project => (
              <TouchableOpacity key={project.id} onPress={() => openDrawer(project)} className="flex-row items-center px-6 py-4 border-b border-tl-border bg-tl-bg">
                <View className="mr-4">
                  <ModernAvatar name={project.name} size={50} />
                </View>
                <View className="flex-1">
                  <Text className="text-tl-text text-[17px] font-bold mb-1" numberOfLines={1}>{project.name}</Text>
                  <Text className="text-tl-muted text-[14px]" numberOfLines={1}>{project.description || 'Secure initiative'}</Text>
                </View>
                <View className="items-end">
                  <View className="flex-row items-center mb-1.5">
                    <Layout size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                    <Text className="text-tl-muted text-[13px] font-medium">{project.tasks?.length || 0}</Text>
                  </View>
                  <View 
                    className="rounded-full px-2.5 py-0.5"
                    style={{ backgroundColor: `${getStatusColor(project.status)}15` }}
                  >
                    <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: getStatusColor(project.status) }}>{project.status?.replace('_', ' ')}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Create Project Modal */}
      <Modal visible={createVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <TouchableOpacity className="flex-1 bg-black/60 justify-center px-6" activeOpacity={1} onPress={() => setCreateVisible(false)}>
            <TouchableOpacity activeOpacity={1} className="bg-tl-surface rounded-[16px] p-5 shadow-lg border border-tl-border">
              <Text className="text-tl-text text-[20px] font-bold mb-4">New Project</Text>
              <View className="mb-4">
                <Text className="text-tl-muted text-[13px] font-bold uppercase tracking-wider mb-2">Project Key</Text>
                <TextInput 
                  className="bg-tl-bg border border-tl-border text-tl-text text-[16px] rounded-[10px] px-4 py-3"
                  placeholder="e.g. Operation Titan"
                  placeholderTextColor="#64748B"
                  value={newProjectName}
                  onChangeText={setNewProjectName}
                  autoFocus
                />
              </View>
              <View className="mb-6">
                <Text className="text-tl-muted text-[13px] font-bold uppercase tracking-wider mb-2">Description</Text>
                <TextInput 
                  className="bg-tl-bg border border-tl-border text-tl-text text-[16px] rounded-[10px] px-4 py-3"
                  placeholder="Classified details..."
                  placeholderTextColor="#64748B"
                  value={newProjectDesc}
                  onChangeText={setNewProjectDesc}
                />
              </View>
              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity onPress={() => setCreateVisible(false)} className="px-5 py-3 rounded-[8px]">
                   <Text className="text-tl-muted font-bold text-[16px]">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                   onPress={handleCreateProject} 
                   disabled={creating || !newProjectName.trim()}
                   className={`bg-tl-primary px-5 py-3 rounded-[8px] ${(!newProjectName.trim() || creating) ? 'opacity-50' : ''}`}
                >
                   {creating ? <ActivityIndicator size="small" color="#fff"/> : <Text className="text-white font-bold text-[16px]">Create</Text>}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={drawerVisible} transparent animationType="none" onRequestClose={closeDrawer}>
        <TouchableOpacity className="flex-1 bg-black/60" activeOpacity={1} onPress={closeDrawer} />
        <Animated.View 
          className="absolute bottom-0 left-0 right-0 bg-tl-bg rounded-t-[20px] border-t border-tl-border overflow-hidden" 
          style={{ height: SCREEN_HEIGHT * 0.82, transform: [{ translateY: slideAnim }] }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-tl-border bg-tl-surface">
            <Text className="text-tl-text text-[18px] font-bold">{selectedProject?.name}</Text>
            <TouchableOpacity onPress={closeDrawer}>
              <Text className="text-tl-primary text-[17px] font-bold">Done</Text>
            </TouchableOpacity>
          </View>
          
          {/* Input Add Task */}
          <View className="p-4 bg-tl-bg border-b border-tl-border">
            <View className="flex-row items-center bg-tl-surface rounded-[12px] px-4 h-12 border border-tl-border">
              <Plus size={20} color="#6366F1" style={{ marginRight: 12 }} />
              <TextInput 
                className="flex-1 text-tl-text text-[16px]" 
                placeholder="Add new security task..." 
                placeholderTextColor="#64748B"
                value={newTaskTitle} 
                onChangeText={setNewTaskTitle} 
                onSubmitEditing={() => { 
                  if(newTaskTitle.trim()) { 
                    createTask(selectedProject.id, {title: newTaskTitle.trim(), status: 'todo'}).then(()=> {
                      setNewTaskTitle(''); 
                      getProjectTasks(selectedProject.id).then(setTasks).catch(console.error);
                    }).catch(console.error); 
                  } 
                }} 
              />
            </View>
          </View>
          
          <ScrollView className="bg-tl-bg" showsVerticalScrollIndicator={false}>
            {tasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={(t) => updateTask(t.id, {status: TASK_STATUS_CYCLE[t.status] || 'todo'}).then(()=>getProjectTasks(selectedProject.id).then(setTasks).catch(console.error)).catch(console.error)} 
                onDelete={(t) => deleteTask(t.id).then(()=>getProjectTasks(selectedProject.id).then(setTasks).catch(console.error)).catch(console.error)} 
                teamMembers={teamMembers} 
              />
            ))}
            <View className="h-20" />
          </ScrollView>
        </Animated.View>
      </Modal>
    </View>
  );
}
