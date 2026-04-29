import { Router, Response } from "express";
import Stripe from "stripe";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth.js";
import supabase from "../db.js";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

router.post("/intent", requireAuth, async (req: AuthRequest, res: Response) => {
  const { amount, currency } = req.body;
  const userId = req.user!.id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const amountInCents = Math.round(amount * 100);

    const intent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency?.toLowerCase() ?? "myr",
      metadata: { userId },
    });

    await supabase.from("payments").insert({
      user_id: userId,
      reference: intent.id,
      amount,
      currency: currency ?? "MYR",
      status: "pending",
      stripe_payment_intent_id: intent.id,
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("Stripe intent error:", err);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

router.post("/webhook", async (req: AuthRequest, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from("payments")
        .update({ status: "completed" })
        .eq("stripe_payment_intent_id", intent.id);
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("stripe_payment_intent_id", intent.id);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;
