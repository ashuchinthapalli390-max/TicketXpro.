import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeColor = 'orange' | 'blue' | 'purple' | 'green' | 'red';

interface ThemeContextType {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  accentColor: ThemeColor;
  setAccentColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const COLOR_MAP: Record<ThemeColor, string> = {
  orange: '#ff6b00',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  green: '#10b981',
  red: '#ef4444',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme-dark');
    return saved ? saved === 'true' : true; // Default to dark as requested
  });

  const [accentColor, setAccentColor] = useState<ThemeColor>(() => {
    return (localStorage.getItem('theme-color') as ThemeColor) || 'orange';
  });

  useEffect(() => {
    localStorage.setItem('theme-dark', String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('theme-color', accentColor);
    document.documentElement.style.setProperty('--primary', COLOR_MAP[accentColor]);
    // Apply RGB version for tailwind opacity if needed
    const hex = COLOR_MAP[accentColor];
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    document.documentElement.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
