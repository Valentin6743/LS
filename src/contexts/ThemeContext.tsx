import React, { createContext, useContext, useState, useEffect } from 'react';

type ColorPalette = {
  50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string;
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  primaryColor: string;
  setPrimaryColor: (colorName: string) => void;
  background: string;
  setBackground: (bgName: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const colorPalettes: { [key: string]: ColorPalette } = {
  blue: { 50: '240 249 255', 100: '224 242 254', 200: '186 230 253', 300: '125 211 252', 400: '56 189 248', 500: '14 165 233', 600: '2 132 199', 700: '3 105 161', 800: '7 89 133', 900: '12 74 110' },
  green: { 50: '240 253 244', 100: '220 252 231', 200: '187 247 208', 300: '134 239 172', 400: '74 222 128', 500: '34 197 94', 600: '22 163 74', 700: '21 128 61', 800: '22 101 52', 900: '20 83 45' },
  purple: { 50: '245 243 255', 100: '237 233 254', 200: '221 214 254', 300: '196 181 253', 400: '167 139 250', 500: '139 92 246', 600: '124 58 237', 700: '109 40 217', 800: '91 33 182', 900: '76 29 149' },
  red: { 50: '254 242 242', 100: '254 226 226', 200: '254 202 202', 300: '252 165 165', 400: '248 113 113', 500: '239 68 68', 600: '220 38 38', 700: '185 28 28', 800: '153 27 27', 900: '127 29 29' },
};

export const backgroundPatterns = ['default', 'dots', 'lines', 'gradient'];

const applyBackground = (bgName: string, isDark: boolean) => {
    document.body.classList.forEach(className => {
      if (className.startsWith('bg-pattern-')) {
        document.body.classList.remove(className);
      }
    });
    if (bgName === 'default') {
        document.body.classList.add('bg-pattern-default');
    } else {
        document.body.classList.add(`bg-pattern-${bgName}-${isDark ? 'dark' : 'light'}`);
    }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [primaryColor, setPrimaryColorState] = useState('blue');
  const [background, setBackgroundState] = useState('default');

  useEffect(() => {
    const storedTheme = localStorage.getItem('lifesync_theme');
    const newIsDark = storedTheme === 'dark';
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);

    const storedColor = localStorage.getItem('lifesync_primary_color');
    if (storedColor && colorPalettes[storedColor]) {
      setPrimaryColor(storedColor);
    }

    const storedBackground = localStorage.getItem('lifesync_background');
    if (storedBackground && backgroundPatterns.includes(storedBackground)) {
      setBackground(storedBackground);
    } else {
      applyBackground(background, newIsDark);
    }
  }, []);

  useEffect(() => {
    applyBackground(background, isDark);
  }, [background, isDark]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('lifesync_theme', newIsDark ? 'dark' : 'light');
    applyBackground(background, newIsDark); // Re-apply background for the new theme
  };

  const setPrimaryColor = (colorName: string) => {
    const palette = colorPalettes[colorName];
    if (!palette) return;

    setPrimaryColorState(colorName);
    localStorage.setItem('lifesync_primary_color', colorName);

    const root = document.documentElement;
    Object.entries(palette).forEach(([shade, rgb]) => {
      root.style.setProperty(`--color-primary-${shade}`, rgb);
    });
  };

  const setBackground = (bgName: string) => {
    if (!backgroundPatterns.includes(bgName)) return;
    setBackgroundState(bgName);
    localStorage.setItem('lifesync_background', bgName);
    applyBackground(bgName, isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, primaryColor, setPrimaryColor, background, setBackground }}>
      {children}
    </ThemeContext.Provider>
  );
};
