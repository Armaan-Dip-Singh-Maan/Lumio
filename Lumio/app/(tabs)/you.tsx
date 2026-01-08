import { StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import { AuthStorage } from '@/utils/auth-storage';
import { AuthColors, AuthTypography } from '@/constants/auth-theme';
import { MaterialIcons } from '@expo/vector-icons';

export default function YouScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await AuthStorage.clearAuth();
            router.replace('/auth');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>You</ThemedText>
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <MaterialIcons name="logout" size={20} color={AuthColors.foreground} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    marginBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AuthColors.card,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AuthColors.border,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: AuthColors.foreground,
    letterSpacing: 0.2,
  },
});

