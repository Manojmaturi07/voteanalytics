import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if context is not available
    return { theme: 'light', toggleTheme: () => {} };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme || 'light';
    } catch (err) {
      console.warn('Failed to read theme from localStorage:', err);
      return 'light';
    }
  });

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    try {
      // Save theme to localStorage whenever it changes
      localStorage.setItem('theme', theme);
      
      // Apply theme class to document root (html element)
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    } catch (err) {
      console.warn('Failed to save theme to localStorage:', err);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

