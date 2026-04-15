import api from './index';

export const getConversations = async () => {
  const response = await api.get('/chat/conversations');
  return response.data.data;
};

export const getConversationMessages = async (conversationId, page = 1, limit = 50) => {
  const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
    params: { page, limit }
  });
  // API response format is { success: true, data: { data: [], total: 100 } }
  // Nen ta can lay .data.data
  return response.data.data.data || [];
};

export const sendMessage = async (conversationId, content, messageType = 'text', fileId = null, parentMessageId = null) => {
  const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
    content,
    messageType,
    fileId,
    parentMessageId
  });
  return response.data.data;
};

export const getChatUsers = async () => {
  const response = await api.get('/chat/users');
  return response.data.data;
};

export const createDirectConversation = async (otherUserId) => {
  const response = await api.post('/chat/conversations/direct', {
    otherUserId
  });
  return response.data.data;
};
export const getE2EEBundle = async () => {
  const response = await api.get('/users/profile/e2ee-bundle');
  return response.data; // { encryptedPrivateKey, salt, iv }
};

export const muteConversation = async (conversationId, isMuted) => {
  const response = await api.put(`/chat/conversations/${conversationId}/mute`, {
    isMuted
  });
  return response.data;
};

export const deleteConversation = async (conversationId) => {
  const response = await api.delete(`/chat/conversations/${conversationId}`);
  return response.data;
};

export const blockUser = async (userId) => {
  const response = await api.post(`/users/block`, { userId });
  return response.data;
};

export const getTotalUnreadCount = async () => {
  try {
    const data = await getConversations();
    return (data || []).reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
  } catch (error) {
    console.error('[Chat API] Get total unread failed:', error);
    return 0;
  }
};
