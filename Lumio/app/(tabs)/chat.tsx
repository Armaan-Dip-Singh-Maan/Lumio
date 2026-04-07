import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  TouchableOpacity,
  type ListRenderItem,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeColorsDark, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { TAB_BAR_HEIGHT } from '@/constants/navigation';
import { EmptyState } from '@/components/chat/EmptyState';
import { PromptChips } from '@/components/chat/PromptChips';
import { MessageBubble, Message } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { InputBar } from '@/components/chat/InputBar';
import { ChatCrisisBanner } from '@/components/chat/ChatCrisisBanner';
import * as Haptics from 'expo-haptics';
import {
  loadChatMessages,
  saveChatMessages,
  clearChatMessages,
  ChatMessage,
} from '@/utils/services/chat-storage';
import { getAIResponseWithRetry } from '@/utils/services/ai';
import { containsCrisisKeywords } from '@/constants/ai-prompt';

/** Reserve space above the floating tab bar when keyboard is hidden */
function composerBottomPadding(insets: { bottom: number }) {
  return TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + 8;
}

/** Tight margin above keyboard — tab bar is covered; avoid stacking with KeyboardAvoidingView */
const KEYBOARD_OPEN_COMPOSER_PAD = 10;

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<Message> | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const bottomInset = keyboardVisible
    ? KEYBOARD_OPEN_COMPOSER_PAD
    : composerBottomPadding(insets);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const loadedMessages = await loadChatMessages();
        setMessages(loadedMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    loadMessages();
  }, []);

  useEffect(() => {
    if (!isInitializing && messages.length > 0) {
      saveChatMessages(messages).catch((error) => {
        console.error('Error saving messages:', error);
      });
    }
  }, [messages, isInitializing]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const hasCrisisKeywords = containsCrisisKeywords(text);
    if (hasCrisisKeywords && !showCrisisBanner) {
      setShowCrisisBanner(true);
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}_${Math.random()}`,
      role: 'user',
      content: text.trim(),
      createdAt: Date.now(),
      status: 'sending',
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const messagesForAI: ChatMessage[] = updatedMessages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      }));

      const response = await getAIResponseWithRetry(messagesForAI);

      if (response.error) {
        const assistantMsg: ChatMessage = {
          id: `assistant_${Date.now()}_${Math.random()}`,
          role: 'assistant',
          content: response.error || "Something went wrong. Let's try again.",
          createdAt: Date.now(),
          status: 'error',
        };
        setMessages((prev) => [
          ...prev.map((m) => (m.id === userMessage.id ? { ...m, status: 'sent' as const } : m)),
          assistantMsg,
        ]);
      } else {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const assistantMsg: ChatMessage = {
          id: `assistant_${Date.now()}_${Math.random()}`,
          role: 'assistant',
          content: response.reply,
          createdAt: Date.now(),
          status: 'sent',
        };
        setMessages((prev) => [
          ...prev.map((m) => (m.id === userMessage.id ? { ...m, status: 'sent' as const } : m)),
          assistantMsg,
        ]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}_${Math.random()}`,
        role: 'assistant',
        content: "Something went wrong. Let's try again.",
        createdAt: Date.now(),
        status: 'error',
      };
      setMessages((prev) => [
        ...prev.map((m) => (m.id === userMessage.id ? { ...m, status: 'sent' as const } : m)),
        assistantMsg,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    handleSend(prompt);
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear chat',
      'This will delete all your messages. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearChatMessages();
              setMessages([]);
              setShowCrisisBanner(false);
            } catch (error) {
              console.error('Error clearing chat:', error);
              Alert.alert('Error', 'Failed to clear chat. Please try again.');
            }
          },
        },
      ]
    );
  };

  const showEmptyState = messages.length === 0 && !isLoading && !isInitializing;

  const showDisclaimer = messages.length > 0 && messages.length <= 2 && !isLoading;

  const messageItems: Message[] = messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt,
  }));

  const renderMessage: ListRenderItem<Message> = ({ item }) => (
    <MessageBubble message={item} />
  );

  const composerBlock = (
    <View style={[styles.composerBlock, { paddingBottom: bottomInset }]}>
      {!showEmptyState && isLoading && (
        <View style={styles.typingWrap}>
          <TypingIndicator />
        </View>
      )}
      <InputBar onSend={handleSend} disabled={isLoading} />
      {!showEmptyState && showDisclaimer && (
        <Text style={styles.disclaimerInline}>
          This isn&apos;t medical advice. If you need professional support, please reach out to a
          qualified mental health professional.
        </Text>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={['hsl(28, 7%, 6%)', 'hsl(30, 8%, 9%)', 'hsl(30, 8%, 7%)']}
      locations={[0, 0.45, 1]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Chat</Text>
            <Text style={styles.subtitle}>A calm space to talk.</Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity
              onPress={handleClearChat}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {showCrisisBanner && (
          <ChatCrisisBanner onDismiss={() => setShowCrisisBanner(false)} />
        )}

        {showEmptyState ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyCenter}>
              <EmptyState />
            </View>
            <View style={[styles.emptyComposer, { paddingBottom: bottomInset }]}>
              <PromptChips onSelect={handlePromptSelect} />
              <View style={styles.chipsToInputGap} />
              <InputBar onSend={handleSend} disabled={isLoading} />
            </View>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messageItems}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              onContentSizeChange={scrollToBottom}
            />
            {composerBlock}
          </>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: HomeSpacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: HomeTypography.fontSize['2xl'],
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.7,
  },
  clearButton: {
    paddingVertical: HomeSpacing.xs,
    paddingHorizontal: HomeSpacing.sm,
    marginTop: 4,
  },
  clearButtonText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.7,
  },
  emptyWrap: {
    flex: 1,
  },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: HomeSpacing.md,
  },
  emptyComposer: {
    paddingHorizontal: HomeSpacing.md,
  },
  chipsToInputGap: {
    height: 10,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: HomeSpacing.md,
    paddingTop: HomeSpacing.sm,
    paddingBottom: HomeSpacing.sm,
  },
  composerBlock: {
    paddingHorizontal: HomeSpacing.md,
    paddingTop: HomeSpacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'hsla(40, 10%, 28%, 0.25)',
    backgroundColor: 'hsla(30, 8%, 8%, 0.94)',
  },
  typingWrap: {
    marginBottom: HomeSpacing.sm,
  },
  disclaimerInline: {
    marginTop: HomeSpacing.sm,
    fontSize: HomeTypography.fontSize.xs - 1,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColorsDark.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.65,
    textAlign: 'center',
    lineHeight: (HomeTypography.fontSize.xs - 1) * 1.4,
    paddingHorizontal: HomeSpacing.xs,
  },
});
