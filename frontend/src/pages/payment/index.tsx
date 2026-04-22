import { useState, type FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import { createPayment } from "../../libs/api";

const Payment = () => {
    const { user, token, logout } = useAuth();
    const [amount, setAmount] = useState(100);
    const [currency, setCurrency] = useState("USD");
    const [idempotencyKey, setIdempotencyKey] = useState<string>(() => crypto.randomUUID());
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [paymentInfo, setPaymentInfo] = useState<null | {
        reused: boolean;
        payment: {
            id: string;
            reference: string;
            amount: number;
            currency: string;
            status: string;
            createdAt: string;
        };
    }>(null);

    if (!user) {
        return <p className="text-white">Please sign in to access payments.</p>;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!token) return;

        setMessage(null);
        setIsLoading(true);

        try {
            const result = await createPayment({ amount, currency, idempotencyKey }, token);
            setPaymentInfo(result);
            setMessage(result.reused ? "Payment was reused by idempotency." : "Payment created successfully.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Payment request failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-full max-w-lg p-8 rounded-lg border border-white/10 bg-[#1a1a1a]">
                <div className="mb-6 flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Payment dashboard</h1>
                        <p className="text-sm text-white/50 mt-1">Logged in as {user.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-sm px-3 py-2 rounded-md border border-white/10 text-white/90 hover:bg-white/5 transition"
                    >
                        Logout
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="text-sm text-white/70">Amount</label>
                        <input
                            type="number"
                            min={1}
                            value={amount}
                            onChange={(event) => setAmount(Number(event.target.value))}
                            className="mt-2 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-white/70">Currency</label>
                        <select
                            value={currency}
                            onChange={(event) => setCurrency(event.target.value)}
                            className="mt-2 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white"
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-white/70">Idempotency key</label>
                        <div className="mt-2 flex gap-2">
                            <input
                                type="text"
                                value={idempotencyKey}
                                onChange={(event) => setIdempotencyKey(event.target.value)}
                                className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setIdempotencyKey(crypto.randomUUID())}
                                className="rounded-md border border-white/10 px-3 py-2 text-white/90 hover:bg-white/5 transition"
                            >
                                New key
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full justify-center mt-1"
                    >
                        {isLoading ? "Submitting..." : "Create payment"}
                    </button>
                </form>

                {message && <p className="mt-4 text-sm text-white/80">{message}</p>}

                {paymentInfo && (
                    <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white">
                        <p><strong>Status:</strong> {paymentInfo.payment.status}</p>
                        <p><strong>Amount:</strong> {paymentInfo.payment.amount} {paymentInfo.payment.currency}</p>
                        <p><strong>Reference:</strong> {paymentInfo.payment.reference}</p>
                        <p><strong>Created:</strong> {new Date(paymentInfo.payment.createdAt).toLocaleString()}</p>
                        <p><strong>Idempotency reused:</strong> {paymentInfo.reused ? "Yes" : "No"}</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Payment;
