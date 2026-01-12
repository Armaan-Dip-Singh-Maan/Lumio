import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { EmptyState } from '@/components/chat/EmptyState';
import { PromptChips } from '@/components/chat/PromptChips';
import { MessageBubble, Message } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { InputBar } from '@/components/chat/InputBar';
import { generateNoviResponse } from '@/utils/novi-responses';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate Novi thinking (600-900ms)
    const delay = 600 + Math.random() * 300;
    
    timeoutRef.current = setTimeout(() => {
      const noviResponse = generateNoviResponse(text);
      
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: noviResponse,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
      timeoutRef.current = null;
    }, delay);
  };

  const handlePromptSelect = (prompt: string) => {
    handleSend(prompt);
  };

  const showEmptyState = messages.length === 0 && !isTyping;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: HomeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16, paddingBottom: 16 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Novi</Text>
          <Text style={styles.subtitle}>A calm space to talk things through</Text>
        </View>
      </View>

      {/* Conversation Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {showEmptyState ? (
          <>
            <EmptyState />
            <PromptChips onSelect={handlePromptSelect} />
          </>
        ) : (
          <View style={styles.messagesContainer}>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={{ paddingBottom: insets.bottom }}>
        <InputBar onSend={handleSend} disabled={isTyping} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: HomeSpacing.md,
    borderBottomWidth: 0,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: HomeTypography.fontSize['2xl'],
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: HomeSpacing.md,
    paddingTop: HomeSpacing.lg,
  },
  messagesContainer: {
    flex: 1,
  },
});
