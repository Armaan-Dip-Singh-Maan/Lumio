import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TopBar } from '@/components/home/TopBar';
import { PrimaryJournalCard } from '@/components/home/PrimaryJournalCard';
import { PlanGently, Task } from '@/components/home/PlanGently';
import { MoodIndicator } from '@/components/home/MoodIndicator';
import { HomeColors, HomeSpacing } from '@/constants/home-theme';
import { TAB_BAR_HEIGHT } from '@/constants/navigation';

// Mock data - replace with actual data management
const mockTasks: Task[] = [
  { id: '1', title: 'Take a short walk', priority: 'low', completed: false },
  { id: '2', title: 'Reply to Sarah', priority: 'medium', completed: false },
  { id: '3', title: 'Review project notes', priority: 'high', completed: true },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [hasEntryToday, setHasEntryToday] = useState(false);
  const [mood, setMood] = useState<{ emoji: string; label: string } | null>(null);

  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(20);

  React.useEffect(() => {
    containerOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    containerTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  const handleWritePress = () => {
    router.push('/journal-write');
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleAddTask = () => {
    console.log('Add new task');
    // Show add task modal
  };

  const handleViewAll = () => {
    console.log('View all tasks');
    // Navigate to tasks screen
  };

  const handleProfilePress = () => {
    // Navigate to profile
    console.log('Open profile');
  };

  return (
    <View style={[styles.container, { backgroundColor: HomeColors.background }]}>
      <TopBar onProfilePress={handleProfilePress} />
      
      <Animated.View style={[styles.scrollContainer, containerStyle]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + HomeSpacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <PrimaryJournalCard
            hasEntryToday={hasEntryToday}
            onWritePress={handleWritePress}
          />

          <PlanGently
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onViewAll={tasks.length > 3 ? handleViewAll : undefined}
          />

          {mood && (
            <MoodIndicator
              mood={mood.label}
              emoji={mood.emoji}
              onPress={() => console.log('Edit mood')}
            />
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
