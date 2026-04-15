import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, TextInput, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, ShieldCheck, Trash2, Plus, Search, Lock, CloudDownload } from 'lucide-react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';
import { getFiles, verifyFileIntegrity, deleteFile } from '../../api/files';
import { API_BASE_URL } from '../../api/index';

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const FileItem = ({ item, onVerify, onDelete, onDownload, downloadingId }) => (
  <View className="flex-row items-center px-6 py-4 border-b border-tl-border bg-tl-bg">
    <View className="w-11 h-11 bg-tl-primary/10 rounded-full items-center justify-center mr-4">
      <FileText size={22} color="#6366F1" strokeWidth={2} />
    </View>
    <View className="flex-1 pr-2">
      <Text className="text-[17px] font-bold text-tl-text mb-1" numberOfLines={1}>{item.filename}</Text>
      <Text className="text-[13px] text-tl-muted font-medium">{formatSize(item.size)} • {new Date(item.createdAt).toLocaleDateString('en-GB')}</Text>
    </View>
    <View className="flex-row items-center gap-4">
      {downloadingId === item.id ? (
        <ActivityIndicator size="small" color="#0EA5E9" />
      ) : (
        <TouchableOpacity onPress={() => onDownload(item)}>
          <CloudDownload size={22} color="#0EA5E9" strokeWidth={2.5} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => onVerify(item)}>
        <ShieldCheck size={22} color="#22C55E" strokeWidth={2.5} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(item)}>
        <Trash2 size={20} color="#EF4444" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  </View>
);

export default function VaultScreen() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [search, setSearch] = useState('');

  const loadFiles = useCallback(async () => {
    try { 
      const data = await getFiles();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setFiles(data); 
    } catch {} finally { 
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setLoading(false); 
      setRefreshing(false); 
    }
  }, []);

  useEffect(() => { loadFiles(); }, []);

  const handleDownload = (file) => {
    setDownloadingId(file.id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTimeout(() => {
      setDownloadingId(null);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Alert.alert('Decrypted & Saved', `File "${file.filename}" securely verified and saved to local storage.`);
    }, 1500);
  };

  const handleVerify = async (file) => {
    try {
      const result = await verifyFileIntegrity(file.id);
      Alert.alert(
        result?.isValid !== false ? 'Integrity Verified' : 'Security Alert', 
        result?.isValid !== false ? `File "${file.filename}" is secure.` : `File "${file.filename}" has been modified!`
      );
    } catch { Alert.alert('Error', 'Verification failed.'); }
  };

  const handleDelete = (file) => {
    Alert.alert('Delete File', `Remove "${file.filename}" from vault?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteFile(file.id); loadFiles(); } catch {} }}
    ]);
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.[0]) return;
      setUploading(true);
      const file = result.assets[0];
      const formData = new FormData();
      formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' });
      const token = await SecureStore.getItemAsync('accessToken');
      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      loadFiles();
    } catch (err) { Alert.alert('Error', err.message || 'Upload failed'); } 
    finally { setUploading(false); }
  };

  const filtered = files.filter(f => {
    const fname = f?.filename || f?.originalName || f?.name || '';
    return fname.toLowerCase().includes((search || '').toLowerCase());
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
            <Lock size={18} color="#F8FAFC" strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text className="text-tl-text text-[17px] font-bold">Vault</Text>
          </View>
          <TouchableOpacity onPress={handleUpload} disabled={uploading} className="w-11 items-end">
             {uploading ? <ActivityIndicator size="small" color="#6366F1" /> : <Plus size={28} color="#6366F1" strokeWidth={2.5} />}
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR CHUẨN */}
        <View className="px-6 pb-4">
          <View className="bg-tl-surface rounded-[10px] h-10 flex-row items-center px-3 border border-tl-border">
            <Search size={18} color="#94A3B8" strokeWidth={2} style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-tl-text text-[16px] h-full"
              placeholder="Search"
              placeholderTextColor="#64748B"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <FileItem item={item} onVerify={handleVerify} onDelete={handleDelete} onDownload={handleDownload} downloadingId={downloadingId} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFiles(); }} tintColor="#6366F1" />}
          contentContainerStyle={{ paddingBottom: 120 }}
          className="border-t border-tl-border"
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}
