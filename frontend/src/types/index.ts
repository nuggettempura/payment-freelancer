export type User = {
  id: string;
  email: string;
  name?: string;
};

export type Theme = "light" | "dark";

export type ThemeColors = {
  bg: string;
  primary: string;
  headline: string;
  paragraph: string;
  tertiary: string;
  border: string;
  cardBg: string;
  secondary: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
};
