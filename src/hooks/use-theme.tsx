import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Check if user has a theme preference stored
    const storedTheme = localStorage.getItem('theme');
    
    // If there's a stored preference, use it
    if (storedTheme) {
      setTheme(storedTheme as 'light' | 'dark');
    } else {
      // Otherwise, default to dark mode
      setTheme('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  useEffect(() => {
    // Update DOM and localStorage when theme changes
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      return newTheme;
    });
  };

  return { theme, toggleTheme };
}
