import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        const { error: stripeError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + "/dashboard",
            },
            redirect: "if_required", // stays on page if no redirect needed
        });

        if (stripeError) {
            setError(stripeError.message ?? "Payment failed");
        } else {
            onSuccess();
        }

        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
            >
                {loading ? "Processing…" : "Pay Now"}
            </button>
        </form>
    );
}

interface Props {
    clientSecret: string;
    onSuccess: () => void;
}

export function StripeCheckout({ clientSecret, onSuccess }: Props) {
    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onSuccess={onSuccess} />
        </Elements>
    );
}
