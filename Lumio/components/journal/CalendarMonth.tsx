import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { HomeColors, HomeTypography, HomeSpacing } from '@/constants/home-theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface CalendarMonthProps {
  markedDates: Set<string>;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onNoEntryDate?: (date: string) => void;
  isExpanded: boolean;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  return (day + 6) % 7;
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isToday(year: number, month: number, day: number): boolean {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day
  );
}

export function CalendarMonth({
  markedDates,
  selectedDate,
  onDateSelect,
  onNoEntryDate,
  isExpanded,
}: CalendarMonthProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const height = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isExpanded) {
      height.value = withTiming(320, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });
      opacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.ease),
      });
    } else {
      opacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      height.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    opacity: opacity.value,
  }));

  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleDatePress = (dateKey: string) => {
    if (markedDates.has(dateKey)) {
      onDateSelect(dateKey);
    } else {
      onNoEntryDate?.(dateKey);
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days: (number | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const monthLabel = `${MONTHS[currentMonth]} ${currentYear}`;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.calendarContainer, animatedStyle]} collapsable={false}>
        {/* Month Header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity
            onPress={() => changeMonth('prev')}
            style={styles.monthNavButton}
            activeOpacity={0.6}
          >
            <IconSymbol
              name={'chevron.left' as 'chevron.left'}
              size={20}
              color={HomeColors.muted}
            />
          </TouchableOpacity>
          
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          
          <TouchableOpacity
            onPress={() => changeMonth('next')}
            style={styles.monthNavButton}
            activeOpacity={0.6}
          >
            <IconSymbol
              name={'chevron.right' as 'chevron.right'}
              size={20}
              color={HomeColors.muted}
            />
          </TouchableOpacity>
        </View>

        {/* Weekday Labels */}
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((day, index) => (
            <View key={index} style={styles.weekdayCell}>
              <Text style={styles.weekdayLabel}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.grid}>
          {days.map((day, index) => {
            if (day === null) {
              return <View key={index} style={styles.dateCell} />;
            }
            
            const dateKey = formatDateKey(currentYear, currentMonth, day);
            const hasEntry = markedDates.has(dateKey);
            const isSelected = selectedDate === dateKey;
            const isTodayDate = isToday(currentYear, currentMonth, day);
            
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleDatePress(dateKey)}
                style={styles.dateCell}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.dateContainer,
                    isTodayDate && styles.todayContainer,
                    isSelected && styles.selectedContainer,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      isSelected && styles.selectedDateText,
                    ]}
                  >
                    {day}
                  </Text>
                  {hasEntry && <View style={styles.dot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  calendarContainer: {
    paddingHorizontal: HomeSpacing.md,
    paddingBottom: HomeSpacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: HomeSpacing.md,
  },
  monthNavButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  monthLabel: {
    fontSize: HomeTypography.fontSize.base,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.9,
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingBottom: HomeSpacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayLabel: {
    fontSize: HomeTypography.fontSize.xs,
    fontWeight: HomeTypography.fontWeight.light,
    color: HomeColors.muted,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  dateContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayContainer: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: HomeColors.primary,
    backgroundColor: 'transparent',
  },
  selectedContainer: {
    borderRadius: 18,
    backgroundColor: HomeColors.primary + '20',
  },
  dateText: {
    fontSize: HomeTypography.fontSize.sm,
    fontWeight: HomeTypography.fontWeight.regular,
    color: HomeColors.foreground,
    letterSpacing: HomeTypography.letterSpacing,
    opacity: 0.85,
  },
  selectedDateText: {
    opacity: 1,
    color: HomeColors.foreground,
  },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: HomeColors.primary,
  },
  toggleButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
});

