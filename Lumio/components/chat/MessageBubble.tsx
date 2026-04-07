import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  status?: 'sending' | 'sent' | 'error';
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(6);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 280 });
    translateY.value = withTiming(0, { duration: 280 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const isUser = message.role === 'user';

  const BubbleContent = (
    <View
      style={[
        styles.bubbleContent,
        isUser ? styles.userBubble : styles.assistantBubble,
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
    </View>
  );

  return (
    <View style={styles.row}>
      <Animated.View
        style={[
          styles.bubbleWrap,
          isUser ? styles.userBubbleWrap : styles.assistantBubbleWrap,
          animatedStyle,
        ]}
      >
        {isUser ? (
          BubbleContent
        ) : (
          <BlurView intensity={15} tint="dark" style={styles.assistantBlur}>
            {BubbleContent}
          </BlurView>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    marginBottom: HomeSpacing.md,
  },
  bubbleWrap: {
    maxWidth: '82%',
  },
  userBubbleWrap: {
    alignSelf: 'flex-end',
  },
  assistantBubbleWrap: {
    alignSelf: 'flex-start',
  },
  bubbleContent: {
    paddingHorizontal: HomeSpacing.md,
    paddingVertical: HomeSpacing.sm + 2,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: 'hsla(163, 20%, 50%, 0.35)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  assistantBubble: {
    backgroundColor: 'hsla(30, 6%, 16%, 0.6)',
  },
  assistantBlur: {
    borderRadius: 20,
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
    overflow: 'hidden',
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
    color: 'hsl(40, 20%, 88%)',
    opacity: 0.95,
  },
});
