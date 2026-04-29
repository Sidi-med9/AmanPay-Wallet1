import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface Colors {
  background: string;
  card: string;
  text: string;
  secondaryText: string;
  primary: string;
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
  background: '#F5F7FA',
  card: '#FFFFFF',
  text: '#0F2C59',
  secondaryText: '#75808A',
  primary: '#00BCD4', // Turquoise/Cyan
  danger: '#F44336',
  success: '#4CAF50',
  border: '#E0E0E0',
  navbar: '#FFFFFF',
};

const darkColors: Colors = {
  background: '#0B132B',
  card: '#1C2541',
  text: '#FFFFFF',
  secondaryText: '#8D99AE',
  primary: '#00E5FF', // Emerald/Cyan accent
  danger: '#FF5252',
  success: '#69F0AE',
  border: '#2C3E50',
  navbar: '#131A32',
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
