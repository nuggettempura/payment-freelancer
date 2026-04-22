import { Router } from "express";
import bcrypt from "bcryptjs";
import supabase from "../db.js";
import { signToken } from "../auth.js";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth.js";

const router = Router();

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
