import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { CRISIS_RESOURCES } from '@/constants/ai-prompt';

interface ChatCrisisBannerProps {
  onDismiss?: () => void;
}

export function ChatCrisisBanner({ onDismiss }: ChatCrisisBannerProps) {
  const handleCall = (number: string) => {
    const phoneNumber = number.replace(/\D/g, ''); // Remove non-digits
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleText = () => {
    Linking.openURL('sms:741741&body=HOME');
  };

  return (
    <BlurView intensity={20} tint="dark" style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your safety matters</Text>
        <Text style={styles.message}>{CRISIS_RESOURCES.message}</Text>
        
        <View style={styles.resourcesContainer}>
          {CRISIS_RESOURCES.resources.map((resource, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceButton}
              onPress={() => {
                if (resource.number.includes('Text')) {
                  handleText();
                } else {
                  handleCall(resource.number);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.resourceName}>{resource.name}</Text>
              <Text style={styles.resourceNumber}>{resource.number}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text style={styles.dismissText}>I understand</Text>
          </TouchableOpacity>
        )}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: HomeSpacing.md,
    marginTop: HomeSpacing.md,
    marginBottom: HomeSpacing.sm,
    borderRadius: 16,
    backgroundColor: HomeColors.glassBackground,
    borderWidth: 1,
    borderColor: HomeColors.glassBorder,
    overflow: 'hidden',
  },
  content: {
    padding: HomeSpacing.md,
  },
  title: {
    fontSize: HomeTypography.fontSize.lg,
    fontWeight: HomeTypography.fontWeight.medium,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: HomeSpacing.sm,
    opacity: 0.95,
  },
  message: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    lineHeight: HomeTypography.fontSize.sm * HomeTypography.lineHeight.relaxed,
    marginBottom: HomeSpacing.md,
    opacity: 0.9,
  },
  resourcesContainer: {
    gap: HomeSpacing.sm,
    marginBottom: HomeSpacing.sm,
  },
  resourceButton: {
    paddingVertical: HomeSpacing.sm,
    paddingHorizontal: HomeSpacing.md,
    borderRadius: 12,
    backgroundColor: 'hsla(163, 20%, 50%, 0.15)',
    borderWidth: 1,
    borderColor: 'hsla(163, 20%, 50%, 0.3)',
  },
  resourceName: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.medium,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    marginBottom: 2,
  },
  resourceNumber: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
  },
  dismissButton: {
    marginTop: HomeSpacing.sm,
    paddingVertical: HomeSpacing.xs,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.7,
  },
});
