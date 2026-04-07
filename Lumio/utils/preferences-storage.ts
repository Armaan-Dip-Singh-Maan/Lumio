import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'system' | 'light' | 'dark';
export type TextSizePreference = 'small' | 'default' | 'large';

const KEYS = {
  theme: '@lumio:pref_theme',
  textSize: '@lumio:pref_text_size',
  biometrics: '@lumio:pref_biometrics',
  gentlePrompt: '@lumio:pref_gentle_prompt',
  blankPage: '@lumio:pref_blank_page',
  moodCheckIn: '@lumio:pref_mood_checkin',
  /** Shown the one-time mood prompt at least once (persists across launches). */
  moodPromptDone: '@lumio:mood_prompt_done',
} as const;

const defaults = {
  theme: 'system' as ThemePreference,
  textSize: 'default' as TextSizePreference,
  biometrics: false,
  gentlePrompt: true,
  blankPage: false,
  moodCheckIn: false,
};

export async function loadPreferences(): Promise<{
  theme: ThemePreference;
  textSize: TextSizePreference;
  biometricsEnabled: boolean;
  showGentlePrompt: boolean;
  startBlankPage: boolean;
  moodCheckInOnOpen: boolean;
}> {
  try {
    const [
      themeRaw,
      textRaw,
      bioRaw,
      promptRaw,
      blankRaw,
      moodRaw,
    ] = await Promise.all([
      AsyncStorage.getItem(KEYS.theme),
      AsyncStorage.getItem(KEYS.textSize),
      AsyncStorage.getItem(KEYS.biometrics),
      AsyncStorage.getItem(KEYS.gentlePrompt),
      AsyncStorage.getItem(KEYS.blankPage),
      AsyncStorage.getItem(KEYS.moodCheckIn),
    ]);

    return {
      theme: parseTheme(themeRaw),
      textSize: parseTextSize(textRaw),
      biometricsEnabled: bioRaw === 'true',
      showGentlePrompt: promptRaw === null ? defaults.gentlePrompt : promptRaw === 'true',
      startBlankPage: blankRaw === 'true',
      moodCheckInOnOpen: moodRaw === 'true',
    };
  } catch {
    return {
      theme: defaults.theme,
      textSize: defaults.textSize,
      biometricsEnabled: false,
      showGentlePrompt: defaults.gentlePrompt,
      startBlankPage: defaults.blankPage,
      moodCheckInOnOpen: defaults.moodCheckIn,
    };
  }
}

function parseTheme(raw: string | null): ThemePreference {
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return defaults.theme;
}

function parseTextSize(raw: string | null): TextSizePreference {
  if (raw === 'small' || raw === 'default' || raw === 'large') return raw;
  return defaults.textSize;
}

export async function saveThemePreference(value: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(KEYS.theme, value);
}

export async function saveTextSizePreference(value: TextSizePreference): Promise<void> {
  await AsyncStorage.setItem(KEYS.textSize, value);
}

export async function saveBiometricsEnabled(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.biometrics, value ? 'true' : 'false');
}

export async function saveShowGentlePrompt(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.gentlePrompt, value ? 'true' : 'false');
}

export async function saveStartBlankPage(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.blankPage, value ? 'true' : 'false');
}

export async function saveMoodCheckInOnOpen(value: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.moodCheckIn, value ? 'true' : 'false');
}

export function getTextSizeScale(size: TextSizePreference): number {
  switch (size) {
    case 'small':
      return 0.92;
    case 'large':
      return 1.08;
    default:
      return 1;
  }
}

export async function hasMoodPromptBeenCompleted(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEYS.moodPromptDone)) === 'true';
  } catch {
    return false;
  }
}

export async function setMoodPromptCompleted(): Promise<void> {
  await AsyncStorage.setItem(KEYS.moodPromptDone, 'true');
}
