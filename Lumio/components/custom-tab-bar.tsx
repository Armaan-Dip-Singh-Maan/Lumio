import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useEffect } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  Dimensions,
  type DimensionValue,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from './ui/icon-symbol';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Soft, soothing light tones on dark glass */
const TAB_ACTIVE = 'rgba(250, 248, 245, 0.95)';
const TAB_INACTIVE = 'rgba(255, 255, 255, 0.42)';

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
  const opacity = useSharedValue(isFocused ? 1 : 0.72);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.05 : 1, {
      damping: 18,
      stiffness: 180,
    });
    opacity.value = withTiming(isFocused ? 1 : 0.72, {
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
      android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <IconSymbol
          name={iconName}
          size={
            isFocused
              ? SCREEN_WIDTH < 375
                ? 22
                : SCREEN_WIDTH < 414
                  ? 24
                  : 26
              : SCREEN_WIDTH < 375
                ? 20
                : SCREEN_WIDTH < 414
                  ? 22
                  : 24
          }
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
  const activeColor = TAB_ACTIVE;
  const inactiveColor = TAB_INACTIVE;

  const renderTab = (route: (typeof state.routes)[0], globalIndex: number) => {
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

    const iconNameTyped = iconName as
      | 'house.fill'
      | 'book.fill'
      | 'bubble.left.and.bubble.right.fill'
      | 'person.fill';

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
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 70}
        tint="dark"
        style={styles.blurContainer}
      >
        <View style={styles.tabBar}>
          {state.routes.map((route, index) => renderTab(route, index))}
        </View>
      </BlurView>
    </View>
  );
}

const getResponsiveStyles = () => {
  const isSmall = SCREEN_WIDTH < 375;
  const isMedium = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;

  return {
    containerPadding: isSmall ? 12 : isMedium ? 14 : 16,
    blurWidth: (isSmall ? '96%' : isMedium ? '94%' : '92%') as DimensionValue,
    blurMaxWidth: isSmall ? SCREEN_WIDTH - 24 : isMedium ? 380 : 400,
    blurBorderRadius: isSmall ? 24 : isMedium ? 27 : 30,
    tabBarHeight: isSmall ? 60 : isMedium ? 64 : 68,
    tabBarPadding: isSmall ? 4 : isMedium ? 8 : 10,
    tabButtonPadding: isSmall ? 4 : 6,
    iconContainerHeight: isSmall ? 24 : isMedium ? 26 : 28,
    tabLabelFontSize: isSmall ? 9 : isMedium ? 10 : 10.5,
  };
};

const responsive = getResponsiveStyles();

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: responsive.containerPadding,
    paddingBottom: 8,
  },
  blurContainer: {
    width: responsive.blurWidth,
    maxWidth: responsive.blurMaxWidth,
    borderRadius: responsive.blurBorderRadius,
    overflow: 'hidden',
    backgroundColor:
      Platform.OS === 'ios' ? 'rgba(28, 28, 30, 0.42)' : 'rgba(22, 22, 24, 0.88)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabBar: {
    flexDirection: 'row',
    height: responsive.tabBarHeight,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsive.tabBarPadding,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsive.tabButtonPadding,
    minWidth: 0,
    gap: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: responsive.iconContainerHeight,
  },
  tabLabel: {
    fontSize: responsive.tabLabelFontSize,
    fontWeight: '500',
    letterSpacing: 0.2,
    color: TAB_INACTIVE,
  },
}) as {
  container: ViewStyle;
  blurContainer: ViewStyle;
  tabBar: ViewStyle;
  tabButton: ViewStyle;
  iconContainer: ViewStyle;
  tabLabel: TextStyle;
};
