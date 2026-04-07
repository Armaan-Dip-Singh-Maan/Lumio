import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DarkTheme, Theme as NavTheme } from '@react-navigation/native';
import {
  loadPreferences,
  saveBiometricsEnabled,
  saveShowGentlePrompt,
  saveStartBlankPage,
  saveMoodCheckInOnOpen,
} from '@/utils/preferences-storage';
import { getHomeColors, type HomePalette } from '@/constants/home-theme';

/** App is dark-only; no light/system theme switching. */
type AppThemeContextValue = {
  colors: HomePalette;
  fontScale: number;
  resolvedScheme: 'dark';
  navigationTheme: NavTheme;
  isReady: boolean;
  biometricsEnabled: boolean;
  setBiometricsEnabled: (v: boolean) => Promise<void>;
  showGentlePrompt: boolean;
  setShowGentlePrompt: (v: boolean) => Promise<void>;
  startBlankPage: boolean;
  setStartBlankPage: (v: boolean) => Promise<void>;
  moodCheckInOnOpen: boolean;
  setMoodCheckInOnOpen: (v: boolean) => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

const lumioNavDark: NavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'hsl(30, 8%, 8%)',
    card: 'hsl(30, 6%, 12%)',
    text: 'hsl(40, 20%, 92%)',
    border: 'hsl(30, 6%, 20%)',
    primary: 'hsl(163, 20%, 60%)',
  },
};

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [biometricsEnabled, setBiometricsEnabledState] = useState(false);
  const [showGentlePrompt, setShowGentlePromptState] = useState(true);
  const [startBlankPage, setStartBlankPageState] = useState(false);
  const [moodCheckInOnOpen, setMoodCheckInOnOpenState] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await loadPreferences();
      if (cancelled) return;
      setBiometricsEnabledState(p.biometricsEnabled);
      setShowGentlePromptState(p.showGentlePrompt);
      setStartBlankPageState(p.startBlankPage);
      setMoodCheckInOnOpenState(p.moodCheckInOnOpen);
      setIsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const colors = useMemo(() => getHomeColors('dark'), []);

  const setBiometricsEnabled = useCallback(async (v: boolean) => {
    setBiometricsEnabledState(v);
    await saveBiometricsEnabled(v);
  }, []);

  const setShowGentlePrompt = useCallback(async (v: boolean) => {
    setShowGentlePromptState(v);
    await saveShowGentlePrompt(v);
  }, []);

  const setStartBlankPage = useCallback(async (v: boolean) => {
    setStartBlankPageState(v);
    await saveStartBlankPage(v);
  }, []);

  const setMoodCheckInOnOpen = useCallback(async (v: boolean) => {
    setMoodCheckInOnOpenState(v);
    await saveMoodCheckInOnOpen(v);
  }, []);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      colors,
      fontScale: 1,
      resolvedScheme: 'dark',
      navigationTheme: lumioNavDark,
      isReady,
      biometricsEnabled,
      setBiometricsEnabled,
      showGentlePrompt,
      setShowGentlePrompt,
      startBlankPage,
      setStartBlankPage,
      moodCheckInOnOpen,
      setMoodCheckInOnOpen,
    }),
    [
      colors,
      isReady,
      biometricsEnabled,
      setBiometricsEnabled,
      showGentlePrompt,
      setShowGentlePrompt,
      startBlankPage,
      setStartBlankPage,
      moodCheckInOnOpen,
      setMoodCheckInOnOpen,
    ]
  );

  return (
    <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return ctx;
}

export function useThemeColors(): HomePalette {
  const ctx = useContext(AppThemeContext);
  return ctx?.colors ?? getHomeColors('dark');
}
