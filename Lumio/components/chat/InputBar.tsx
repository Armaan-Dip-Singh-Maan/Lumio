import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function InputBar({ onSend, disabled = false }: InputBarProps) {
  const [text, setText] = useState('');
  const [height, setHeight] = useState(44);

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
      setHeight(44);
    }
  };

  return (
    <BlurView intensity={Platform.OS === 'ios' ? 55 : 40} tint="dark" style={styles.blurWrap}>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { height: Math.min(height, 100) }]}
            value={text}
            onChangeText={setText}
            placeholder="What's on your mind?"
            placeholderTextColor={HomeColors.muted}
            multiline
            maxLength={500}
            onContentSizeChange={(e) => {
              setHeight(Math.max(44, e.nativeEvent.contentSize.height + 16));
            }}
            textAlignVertical="top"
            editable={!disabled}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || disabled}
            style={[
              styles.sendButton,
              (!text.trim() || disabled) && styles.sendButtonDisabled,
            ]}
            activeOpacity={0.7}
          >
            <IconSymbol
              name={'paperplane.fill' as 'paperplane.fill'}
              size={20}
              color={!text.trim() || disabled ? HomeColors.muted : HomeColors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurWrap: {
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(28, 28, 30, 0.35)' : 'rgba(20, 20, 22, 0.92)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  container: {
    borderRadius: 26,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: HomeSpacing.sm,
    gap: HomeSpacing.sm,
  },
  input: {
    flex: 1,
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    paddingHorizontal: HomeSpacing.md,
    paddingVertical: HomeSpacing.sm,
    minHeight: 44,
    maxHeight: 100,
    lineHeight: HomeTypography.fontSize.base * HomeTypography.lineHeight.normal,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
