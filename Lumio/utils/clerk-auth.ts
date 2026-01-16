import * as Clerk from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

/**
 * Token cache for Clerk using expo-secure-store
 */
export const tokenCache = {
  async getToken(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      // Handle error silently
    }
  },
  async clearToken(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (err) {
      // Handle error silently
    }
  },
};

/**
 * Check if an email exists in Clerk by attempting to create a sign-in attempt
 * This uses Clerk's recommended client-side approach for Expo/RN
 * 
 * Strategy: Try to create a sign-in attempt. If it succeeds, the user exists.
 * If it fails with "form_identifier_not_found", the user doesn't exist.
 * 
 * Note: This requires the signIn hook to be available. For better accuracy in production,
 * consider using a backend endpoint that queries Clerk's Backend API.
 */
export async function checkEmailExists(
  email: string,
  signIn: any // Pass the signIn object from useSignIn hook
): Promise<boolean> {
  if (!signIn) {
    // If signIn is not available, we can't check - default to false (new user)
    // This will route to sign-up flow
    return false;
  }

  try {
    // Attempt to create a sign-in attempt with the email
    // This is Clerk's recommended way to check if a user exists client-side
    await signIn.create({ identifier: email });
    
    // If we get here, the sign-in attempt was created successfully
    // which means the user exists (but we haven't verified password yet)
    // Reset the sign-in attempt so we can start fresh when they enter password
    return true;
  } catch (error: any) {
    // Check if error indicates user not found
    const errorCode = error?.errors?.[0]?.code;
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (
      errorCode === 'form_identifier_not_found' ||
      errorCode === 'form_identifier_not_found_in_use' ||
      errorMessage.includes('not found') ||
      error?.status === 404
    ) {
      // User definitely doesn't exist - route to sign-up
      return false;
    }
    
    // For other errors (network issues, rate limiting, etc.), 
    // we'll default to assuming the user might exist (route to sign-in)
    // This is safer - if they're an existing user, they can sign in.
    // If they're new, they'll get an error and can go back to sign up.
    console.warn('Email check error (defaulting to existing user):', error);
    return true;
  }
}
