import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth.js";
import supabase from "../db.js";

// Extends Express's Request type so route handlers can access req.user safely
export interface AuthRequest extends Request {
  user?: {
    id: string;   // UUID — was incorrectly typed as number before
    email: string;
  };
}

// Middleware runs before every protected route handler.
// It has one job: prove the caller is a real, existing user.
// Flow: extract token → verify signature → fetch user from DB → attach to req → next()
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const raw = req.headers.authorization;

  // Step 1: check the Authorization header exists and has the right format
  if (!raw || !raw.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = raw.replace(/^Bearer\s+/i, "");

  try {
    // Step 2: verify the JWT signature and expiry — throws if tampered or expired
    const payload = verifyToken(token);

    // Step 3: confirm the user still exists in the database
    // (handles the case where a user was deleted after their token was issued)
    const { data: user } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", payload.sub)
      .single();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    // Step 4: attach user to request so downstream route handlers don't re-query
    req.user = { id: user.id, email: user.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
