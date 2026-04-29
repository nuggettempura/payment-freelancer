import type {
  LoginPayload,
  LoginResponse,
  Payment,
  PaymentPayload,
  RegisterPayLoad,
} from "../types";

// /api prefix is proxied to Express by Vite (see vite.config.ts).
// No hardcoded port or hostname — works in dev and production without changes.
const API_PREFIX = "/api";

async function request<T>(path: string, options: RequestInit = {}) {
  const { headers: optionHeaders, ...restOptions } = options;
  const response = await fetch(`${API_PREFIX}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(optionHeaders ?? {}),
    },
    ...restOptions,
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error || "API request failed");
  }

  return body as T;
}

export async function loginUser(payload: LoginPayload) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerUser(payload: RegisterPayLoad) {
  return request<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Uses a plain fetch (not the request() helper) because a 429 from the rate
// limiter should not throw — the UI handles it as a soft "slow down" state.
export async function checkEmail(
  email: string,
): Promise<{ available: boolean }> {
  const response = await fetch(
    `${API_PREFIX}/auth/check-email?email=${encodeURIComponent(email)}`,
  );
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "Check failed");
  return body;
}

export async function createPayment(payload: PaymentPayload, token: string) {
  return request<PaymentResponse>("/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-idempotency-key": payload.idempotencyKey,
    },
    body: JSON.stringify({
      amount: payload.amount,
      currency: payload.currency,
    }),
  });
}

export async function getPayments(token: string) {
  return request<{ payments: Payment[] }>("/payments", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createPaymentIntent(
  payload: { amount: number; currency: string },
  token: string,
) {
  return request<{ clientSecret: string }>("/stripe/intent", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export async function getMe(token: string) {
  return request<{ user: { id: string; email: string; name?: string } }>(
    "/auth/me",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
}
