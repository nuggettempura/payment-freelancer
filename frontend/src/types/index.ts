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

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayLoad = {
  email: string;
  password: string;
  name: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
};

export type PaymentPayload = {
  amount: number;
  currency: string;
  idempotencyKey: string;
};

export type PaymentResponse = {
  reused: boolean;
  payment: {
    id: string;
    reference: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  };
};

export type Payment = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  user_id: string;
  created_at: string;
};

export type Step = "form" | "checkout" | "success";
