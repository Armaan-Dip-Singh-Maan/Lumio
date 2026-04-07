import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAT_STORAGE_KEY = '@lumio:chat_messages';

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  status?: 'sending' | 'sent' | 'error';
};

/**
 * Load chat messages from local storage
 */
export async function loadChatMessages(): Promise<ChatMessage[]> {
  try {
    const data = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
    if (!data) return [];
    
    const messages = JSON.parse(data) as ChatMessage[];
    // Validate and filter out any invalid messages
    return messages.filter(
      (msg) =>
        msg.id &&
        msg.role &&
        msg.content &&
        typeof msg.createdAt === 'number'
    );
  } catch (error) {
    console.error('Error loading chat messages:', error);
    return [];
  }
}

/**
 * Save chat messages to local storage
 */
export async function saveChatMessages(messages: ChatMessage[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving chat messages:', error);
  }
}

/**
 * Clear all chat messages from local storage
 */
export async function clearChatMessages(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing chat messages:', error);
  }
}

/**
 * Add a single message to storage
 */
export async function addChatMessage(message: ChatMessage): Promise<void> {
  const messages = await loadChatMessages();
  messages.push(message);
  await saveChatMessages(messages);
}

/**
 * Update a message in storage (e.g., change status from 'sending' to 'sent')
 */
export async function updateChatMessage(
  messageId: string,
  updates: Partial<ChatMessage>
): Promise<void> {
  const messages = await loadChatMessages();
  const index = messages.findIndex((msg) => msg.id === messageId);
  
  if (index !== -1) {
    messages[index] = { ...messages[index], ...updates };
    await saveChatMessages(messages);
  }
}
