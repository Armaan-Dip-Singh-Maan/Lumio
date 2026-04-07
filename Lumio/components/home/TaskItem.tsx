import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';

export type TaskPriority = 'high' | 'medium' | 'low';

interface TaskItemProps {
  id: string;
  title: string;
  priority: TaskPriority;
  completed?: boolean;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  high: HomeColors.priorityHigh,
  medium: HomeColors.priorityMedium,
  low: HomeColors.priorityLow,
};

export function TaskItem({
  id,
  title,
  priority,
  completed = false,
  onToggleComplete,
  onDelete,
}: TaskItemProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(completed ? 0.55 : 1);

  useEffect(() => {
    if (completed) {
      opacity.value = withTiming(0.55, { duration: 300 });
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    } else {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }, () => {
      scale.value = withSpring(completed ? 0.98 : 1, { damping: 15, stiffness: 300 });
    });
    onToggleComplete(id);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleDelete = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(id);
    swipeableRef.current?.close();
  };

  const renderLeftActions = () => (
    <RectButton style={styles.deleteAction} onPress={handleDelete}>
      <Text style={styles.deleteLabel}>Delete</Text>
    </RectButton>
  );

  return (
    <View style={styles.swipeRow}>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        overshootLeft={false}
        friction={2}
      >
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={[styles.priorityIndicator, { backgroundColor: priorityColors[priority] }]} />
          <RectButton onPress={handlePress} style={styles.content} activeOpacity={0.7}>
            <Text style={[styles.title, completed && styles.titleCompleted]}>{title}</Text>
            <View style={[styles.checkbox, completed && styles.checkboxCompleted]}>
              {completed && <View style={styles.checkmark} />}
            </View>
          </RectButton>
        </Animated.View>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeRow: {
    marginBottom: HomeSpacing.md,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteAction: {
    width: 88,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: HomeColors.priorityHigh,
  },
  deleteLabel: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.medium,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
  },
  priorityIndicator: {
    width: 3,
    height: 40,
    borderRadius: 2,
    marginRight: HomeSpacing.md,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HomeSpacing.sm,
  },
  title: {
    flex: 1,
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    lineHeight: HomeTypography.fontSize.base * HomeTypography.lineHeight.normal,
    opacity: 0.95,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HomeColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: HomeSpacing.md,
  },
  checkboxCompleted: {
    backgroundColor: HomeColors.primary,
    borderColor: HomeColors.primary,
  },
  checkmark: {
    width: 6,
    height: 10,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: HomeColors.primaryForeground,
    transform: [{ rotate: '45deg' }],
    marginTop: -2,
  },
});
