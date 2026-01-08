import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@lumio:auth_token';
const USER_EMAIL_KEY = '@lumio:user_email';
const IS_NEW_USER_KEY = '@lumio:is_new_user';

/**
 * Simple authentication storage utilities
 * In production, use secure storage and proper token management
 */

export const AuthStorage = {
  // Check if user is logged in
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return !!token;
    } catch {
      return false;
    }
  },

  // Get stored auth token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  // Save authentication data
  async saveAuth(token: string, email: string, isNewUser: boolean = false): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [AUTH_TOKEN_KEY, token],
        [USER_EMAIL_KEY, email],
        [IS_NEW_USER_KEY, isNewUser.toString()],
      ]);
    } catch (error) {
      console.error('Error saving auth:', error);
    }
  },

  // Get user email
  async getUserEmail(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(USER_EMAIL_KEY);
    } catch {
      return null;
    }
  },

  // Check if user is new
  async isNewUser(): Promise<boolean> {
    try {
      const isNew = await AsyncStorage.getItem(IS_NEW_USER_KEY);
      return isNew === 'true';
    } catch {
      return false;
    }
  },

  // Clear authentication data (logout)
  async clearAuth(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_EMAIL_KEY, IS_NEW_USER_KEY]);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  },
};

