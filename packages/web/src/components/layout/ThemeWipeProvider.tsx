import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: (event?: React.MouseEvent) => void;
  setTheme: (theme: ThemeMode, coords?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'gokkalkan_theme';

export const ThemeWipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Default Light First standard
  });

  const overlayRef = useRef<HTMLDivElement>(null);
  const wipeTimeoutRef = useRef<number | null>(null);

  // Sync with HTML root attribute & meta theme-color
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.getElementById('theme-color-meta');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0b0f19' : '#f4f6fa');
    }
  }, [theme]);

  const executeWipe = useCallback((newTheme: ThemeMode, x: number, y: number) => {
    const overlay = overlayRef.current;
    if (!overlay) {
      setThemeState(newTheme);
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      return;
    }

    if (wipeTimeoutRef.current) {
      window.clearTimeout(wipeTimeoutRef.current);
    }

    const targetBg = newTheme === 'dark' ? '#0b0f19' : '#f4f6fa';
    overlay.style.setProperty('--wipe-x', `${x}px`);
    overlay.style.setProperty('--wipe-y', `${y}px`);
    overlay.style.setProperty('--wipe-bg', targetBg);

    // Dairesel perdelemeyi başlat
    overlay.classList.add('wipe-active');

    // Perde ekranı kapladığında temayı arka planda değiştir (220ms)
    window.setTimeout(() => {
      setThemeState(newTheme);
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }, 220);

    // Animasyon tamamlandığında perdeyi sıfırla (560ms)
    wipeTimeoutRef.current = window.setTimeout(() => {
      overlay.classList.remove('wipe-active');
    }, 560);
  }, []);

  const toggleTheme = useCallback(
    (event?: React.MouseEvent) => {
      const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
      let x = window.innerWidth - 48;
      let y = 36;

      if (event && event.clientX && event.clientY) {
        x = event.clientX;
        y = event.clientY;
      } else {
        // Butonun konumunu deneysel bul
        const btn = document.getElementById('gokThemeToggleBtn');
        if (btn) {
          const rect = btn.getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        }
      }

      executeWipe(nextTheme, x, y);
    },
    [theme, executeWipe]
  );

  const setTheme = useCallback(
    (newTheme: ThemeMode, coords?: { x: number; y: number }) => {
      if (newTheme === theme) return;
      const x = coords?.x ?? window.innerWidth / 2;
      const y = coords?.y ?? window.innerHeight / 2;
      executeWipe(newTheme, x, y);
    },
    [theme, executeWipe]
  );

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
      {/* CSS Dairesel Perdeleme Katmanı */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="theme-wipe-canvas"
      />
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme, bir ThemeWipeProvider içerisinde kullanılmalıdır.');
  }
  return context;
};
