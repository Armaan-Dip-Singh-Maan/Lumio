import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/icon-symbol';

// Separate component for animated tab to use hooks properly
function AnimatedTab({
  isFocused,
  iconName,
  label,
  activeColor,
  inactiveColor,
  onPress,
}: {
  isFocused: boolean;
  iconName: 'house.fill' | 'book.fill' | 'bubble.left.and.bubble.right.fill' | 'person.fill';
  label: string;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(isFocused ? 1.05 : 1);
  const opacity = useSharedValue(isFocused ? 1 : 0.65);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.05 : 1, {
      damping: 18,
      stiffness: 180,
    });
    opacity.value = withTiming(isFocused ? 1 : 0.65, {
      duration: 250,
    });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabButton}
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <IconSymbol
          name={iconName}
          size={isFocused ? 26 : 24}
          color={isFocused ? activeColor : inactiveColor}
        />
      </Animated.View>
      <Animated.Text
        style={[
          styles.tabLabel,
          {
            color: isFocused ? activeColor : inactiveColor,
          },
          animatedLabelStyle,
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  index: { active: 'house.fill', inactive: 'house.fill' },
  journal: { active: 'book.fill', inactive: 'book.fill' },
  chat: { active: 'bubble.left.and.bubble.right.fill', inactive: 'bubble.left.and.bubble.right.fill' },
  you: { active: 'person.fill', inactive: 'person.fill' },
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  journal: 'Journal',
  chat: 'Chat',
  you: 'You',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeColor = '#2D3748'; // Darker for better contrast
  const inactiveColor = '#808b99'; // Slightly lighter for inactive

  // Split routes into left and right groups for center button
  const leftRoutes = state.routes.slice(0, 2); // Home, Journal
  const rightRoutes = state.routes.slice(2); // Chat, You

  const renderTab = (route: typeof state.routes[0], index: number, globalIndex: number) => {
    const { options } = descriptors[route.key];
    const label = TAB_LABELS[route.name] || options.title || route.name;
    const isFocused = state.index === globalIndex;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    const iconName = (isFocused
      ? TAB_ICONS[route.name]?.active
      : TAB_ICONS[route.name]?.inactive) || 'house.fill';

    // Type assertion for IconSymbol name prop
    const iconNameTyped = iconName as 'house.fill' | 'book.fill' | 'bubble.left.and.bubble.right.fill' | 'person.fill';

    return (
      <AnimatedTab
        key={route.key}
        isFocused={isFocused}
        iconName={iconNameTyped}
        label={label}
        activeColor={activeColor}
        inactiveColor={inactiveColor}
        onPress={onPress}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* Glassmorphism Tab Bar */}
      <BlurView intensity={100} tint="light" style={styles.blurContainer}>
        <View style={styles.tabBar}>
          {/* Left side tabs */}
          <View style={styles.leftTabs}>
            {leftRoutes.map((route, index) => renderTab(route, index, index))}
          </View>

          {/* Center spacer for button */}
          <View style={styles.centerSpacer} />

          {/* Right side tabs */}
          <View style={styles.rightTabs}>
            {rightRoutes.map((route, index) => renderTab(route, index, index + 2))}
          </View>
        </View>
      </BlurView>

      {/* Center Floating Action Button */}
      <View style={[styles.centerButtonContainer, { bottom: Math.max(insets.bottom, 8) + 38 }]}>
        <Pressable
          style={styles.centerButton}
          onPress={() => {
            // Handle center button press - you can navigate to a create screen
            console.log('Center button pressed');
          }}
          android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <View style={styles.centerButtonInner}>
            <IconSymbol name="plus" size={26} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  blurContainer: {
    width: '92%',
    maxWidth: 400,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: Platform.select({
      ios: 'rgba(255, 255, 255, 0.7)',
      android: 'rgba(255, 255, 255, 0.9)',
      default: 'rgba(255, 255, 255, 0.8)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    height: 68,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftTabs: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    gap: 20,
  },
  rightTabs: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 20,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minWidth: 56,
    gap: 5,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: '#2D3748',
  },
  centerSpacer: {
    width: 68, // Space for center button
  },
  centerButtonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 10,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#86AFA0',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#86AFA0',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  centerButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#86AFA0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

