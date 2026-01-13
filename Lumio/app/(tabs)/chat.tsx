import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { TAB_BAR_HEIGHT } from '@/constants/navigation';
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Calculate resting and active bottom offsets
  const restingBottom = TAB_BAR_HEIGHT + insets.bottom + 12;
  const activeBottom = keyboardHeight > 0 ? keyboardHeight + 8 : restingBottom;

  // Animated value for composer bottom offset
  const composerBottom = useSharedValue(restingBottom);

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

  // Keyboard event listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const height = e.endCoordinates.height;
        setKeyboardHeight(height);
        composerBottom.value = withTiming(height + 8, {
          duration: Platform.OS === 'ios' ? 250 : 300,
          easing: Easing.out(Easing.ease),
        });
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        const currentRestingBottom = TAB_BAR_HEIGHT + insets.bottom + 12;
        composerBottom.value = withTiming(currentRestingBottom, {
          duration: Platform.OS === 'ios' ? 250 : 300,
          easing: Easing.out(Easing.ease),
        });
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [insets.bottom]);

  // Animated style for composer container
  const composerAnimatedStyle = useAnimatedStyle(() => {
    return {
      bottom: composerBottom.value,
    };
  });

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

  // Calculate message list bottom padding
  const messageListPaddingBottom = keyboardHeight > 0
    ? 120 + keyboardHeight + 8
    : 120 + 12 + TAB_BAR_HEIGHT + insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: HomeColors.background }]}>
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
          { paddingBottom: messageListPaddingBottom },
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

      {/* Floating Input Bar */}
      <Animated.View style={[styles.inputBarContainer, composerAnimatedStyle]}>
        <InputBar onSend={handleSend} disabled={isTyping} />
      </Animated.View>
    </View>
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
  inputBarContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,
  },
});
