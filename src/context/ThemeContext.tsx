import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface Colors {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  primary: string;
  warning: string;
  danger: string;
  success: string;
  border: string;
  navbar: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: Colors;
  setMode: (mode: ThemeMode) => void;
}

const lightColors: Colors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  secondaryText: '#64748B',
  primary: '#00D2D3',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#10B981',
  border: '#E2E8F0',
  navbar: '#FFFFFF',
};

const darkColors: Colors = {
  background: '#040D1B',
  card: '#0C182B',
  text: '#FFFFFF',
  secondaryText: '#94A3B8',
  primary: '#00D2D3',
  warning: '#FBBF24',
  danger: '#F87171',
  success: '#34D399',
  border: '#1E293B',
  navbar: '#061121',
};

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const isDark = mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
