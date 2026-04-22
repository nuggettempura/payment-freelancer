import { Router } from "express";
import supabase from "../db.js";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth.js";

const router = Router();

// POST /payments
// Flow: validate inputs → call DB function (atomic) → return result
router.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  const idempotencyKey = String(
    req.header("x-idempotency-key") || req.body.idempotencyKey || "",
  ).trim();
  const amount = Number(req.body.amount);
  const currency = String(req.body.currency || "USD").toUpperCase();

  if (!idempotencyKey) {
    return res
      .status(400)
      .json({ error: "x-idempotency-key header is required." });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "A valid amount is required." });
  }

  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  // supabase.rpc() calls the PostgreSQL function we created in the DB.
  // The function handles idempotency checking + both inserts atomically.
  // If it finds an existing key it returns { reused: true, payment: {...} }.
  // If it creates a new payment it returns { reused: false, payment: {...} }.
  const { data, error } = await supabase.rpc("create_payment_idempotent", {
    p_user_id: req.user.id,
    p_key: idempotencyKey,
    p_amount: amount,
    p_currency: currency,
  });

  if (error) {
    return next(error);
  }

  const statusCode = data.reused ? 200 : 201;
  return res.status(statusCode).json(data);
});

export default router;
