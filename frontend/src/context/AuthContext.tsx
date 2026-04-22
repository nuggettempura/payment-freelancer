import { createContext, useState, useEffect } from "react";
import type { AuthContextType, User, Theme, ThemeColors } from "../types";

export const AuthContext = createContext<AuthContextType | null>(null);

const authStorageKey = "payment-freelancer-auth";

const lightColors: ThemeColors = {
    bg: '#ffffff',
    primary: '#1a1a1a',
    headline: '#0f0f0f',
    paragraph: '#191f2b',
    tertiary: '#374151',
    border: '#d1d5db',
    cardBg: '#ffffff',
    secondary: '#2563eb',
};

const darkColors: ThemeColors = {
    bg: '#0f0f0f',
    primary: '#f5f5f5',
    headline: '#f9fafb',
    paragraph: '#9ca3af',
    tertiary: '#d1d5db',
    border: '#374151',
    cardBg: '#1a1a1a',
    secondary: '#3b82f6',
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme');
        return (saved as Theme) || 'light';
    });

    const login = (userData: User, jwt: string) => {
        setUser(userData);
        setToken(jwt);
        localStorage.setItem(authStorageKey, JSON.stringify({ user: userData, token: jwt }));
    };

    const logout = (): void => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(authStorageKey);
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }

    const colors = theme === 'light' ? lightColors : darkColors;

    useEffect(() => {
        const saved = localStorage.getItem(authStorageKey);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as { user: User; token: string };
                setUser(parsed.user);
                setToken(parsed.token);
            } catch {
                localStorage.removeItem(authStorageKey);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, theme, toggleTheme, colors }}>
            {children}
        </AuthContext.Provider>
    )
}
