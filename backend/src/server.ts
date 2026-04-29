import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payments.js";
import stripeRouter from "./routes/stripe.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));

// Raw body only for the webhook path — must come before express.json()
app.use("/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/payments", paymentRoutes);
app.use("/stripe", stripeRouter);

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Payment Freelancer backend is running." });
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  },
);

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
