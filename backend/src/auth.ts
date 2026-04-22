import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "please-change-this-in-production";

export function signToken(user: { id: string; email: string }) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    secret,
    {
      expiresIn: "2h",
    },
  );
}

export function verifyToken(token: string) {
  const payload = jwt.verify(token, secret);
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("sub" in payload) ||
    !("email" in payload)
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    sub: String((payload as any).sub),
    email: String((payload as any).email),
    iat: Number((payload as any).iat),
    exp: Number((payload as any).exp),
  };
}
