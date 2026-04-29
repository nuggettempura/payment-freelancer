import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { createPaymentIntent } from '../../libs/api';
import { StripeCheckout } from '../../components/StripeCheckout';
import type { Step } from '../../types';

export default function NewPayment() {
  const { token } = useAuth();
  const [amount, setAmount] = useState(100);
  const [currency, setCurrency] = useState('MYR');
  const [step, setStep] = useState<Step>('form');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProceed = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setIsLoading(true);

    try {
      const { clientSecret: secret } = await createPaymentIntent({ amount, currency }, token);
      setClientSecret(secret);
      setStep('checkout');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('form');
    setClientSecret(null);
    setError(null);
  };

  const handleReset = () => {
    setStep('form');
    setClientSecret(null);
    setAmount(100);
    setCurrency('MYR');
    setError(null);
  };

  if (step === 'success') {
    return (
      <div className="p-8 max-w-lg">
        <h1 className="text-2xl font-bold text-white">Payment successful</h1>
        <p className="mt-2 text-sm text-white/50">Your payment has been processed.</p>
        <button onClick={handleReset} className="mt-6 btn-primary">
          Make another payment
        </button>
      </div>
    );
  }

  if (step === 'checkout' && clientSecret) {
    return (
      <div className="p-8 max-w-lg">
        <h1 className="text-2xl font-bold text-white">Complete payment</h1>
        <p className="mt-1 text-sm text-white/50">
          {amount} {currency}
        </p>
        <div className="mt-6">
          <StripeCheckout clientSecret={clientSecret} onSuccess={() => setStep('success')} />
        </div>
        <button
          onClick={handleBack}
          className="mt-4 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-white">New payment</h1>
      <p className="mt-1 text-sm text-white/50">Enter an amount to proceed to checkout</p>

      <form onSubmit={handleProceed} className="mt-8 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white/70">Amount</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white
                       focus:outline-none focus:border-white/35 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-white/70">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white
                       focus:outline-none focus:border-white/35 transition-colors focus:text-gray-500"
          >
            <option value="MYR">MYR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full justify-center"
        >
          {isLoading ? 'Preparing…' : 'Proceed to payment'}
        </button>
      </form>
    </div>
  );
}
