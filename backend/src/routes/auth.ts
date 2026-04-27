import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import supabase from "../db.js";
import { signToken } from "../auth.js";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth.js";

const router = Router();

// Tight rate limit only for this endpoint — it's unauthenticated and could be
// abused to enumerate registered emails by scanning for "taken" responses.
const checkEmailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 20,             // max 20 checks per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

// ── Check email availability ─────────────────────────────────────────────────
// GET /auth/check-email?email=...
// Returns { available: true } if the email is not yet registered.
// Rate limited to prevent email enumeration attacks.
router.get("/check-email", checkEmailLimiter, async (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  // .maybeSingle() — like .single() but returns null instead of an error when
  // no row is found. We only need the id — no point fetching password etc.
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  return res.json({ available: existing === null });
});

// ── Register ────────────────────────────────────────────────────────────────
// Flow: validate input → hash password → insert user → sign JWT → respond
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // .insert()  → write a new row
  // .select()  → return the inserted row (Supabase doesn't return it by default)
  // .single()  → unwrap the array into a single object (errors if 0 or 2+ rows)
  const { data: user, error } = await supabase
    .from("users")
    .insert({ email, name, password: hashedPassword })
    .select("id, email, name")
    .single();

  if (error) {
    // Supabase error code 23505 = unique constraint violation (duplicate email)
    return res.status(409).json({ error: "Email already exists." });
  }

  const token = signToken({ id: user.id, email: user.email });
  return res.status(201).json({ token, user });
});

// ── Login ────────────────────────────────────────────────────────────────────
// Flow: validate input → find user by email → compare password → sign JWT → respond
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // .eq("email", email) → WHERE email = $1
  // We need the password field here to compare, but we never send it back
  const { data: user } = await supabase
    .from("users")
    .select("id, email, name, password")
    .eq("email", email)
    .single();

  // Always return the same vague error — never tell the caller which field was wrong
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = signToken({ id: user.id, email: user.email });
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// ── Current user ─────────────────────────────────────────────────────────────
// Flow: requireAuth middleware already verified the token and attached req.user
//       Nothing to query — just return what middleware already loaded
router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  return res.json({ user: req.user });
});

export default router;
