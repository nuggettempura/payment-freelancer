const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export type LoginPayload = {
  email: string;
  password: string;
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

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
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
