import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Stripe initialization as per guidelines
let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required for real Stripe payments");
    }
    stripeClient = new Stripe(key, { apiVersion: "2025-02-28.acacia" } as any);
  }
  return stripeClient;
}

// API endpoint to create Stripe Payment Intent or Checkout Session
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "usd", metadata } = req.body;
    
    if (!process.env.STRIPE_SECRET_KEY) {
      // Return simulated success if Stripe key is not configured yet, allowing seamless test bookings
      return res.json({
        success: true,
        simulated: true,
        clientSecret: `seti_simulated_${Math.random().toString(36).substring(2)}_secret_${Math.random().toString(36).substring(2)}`,
        id: `pi_simulated_${Math.random().toString(36).substring(2)}`,
        message: "Stripe key not configured. Processed with simulated secure payment gateway."
      });
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100), // in cents
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      success: true,
      simulated: false,
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Stripe Payment Intent Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to create payment intent" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY) });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GrowTogether Hospitals server running on http://localhost:${PORT}`);
  });
}

startServer();
