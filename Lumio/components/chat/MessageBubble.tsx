import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const isUser = message.role === 'user';

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.text,
          isUser ? styles.userText : styles.assistantText,
        ]}
      >
        {message.content}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: HomeSpacing.md,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  userContainer: {
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
    borderRadius: 18,
    paddingHorizontal: HomeSpacing.md,
    paddingVertical: HomeSpacing.sm,
  },
  assistantContainer: {
    // No background, just text
  },
  text: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.regular,
    letterSpacing: HomeTypography.letterSpacing,
    lineHeight: HomeTypography.fontSize.base * HomeTypography.lineHeight.relaxed,
  },
  userText: {
    color: HomeColors.foreground,
    opacity: 0.95,
  },
  assistantText: {
    color: HomeColors.muted,
    opacity: 0.9,
  },
});

