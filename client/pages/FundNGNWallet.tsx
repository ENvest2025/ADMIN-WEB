import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function FundNGNWallet() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'amount' | 'payment'>('amount');

  const quickAmounts = [5000, 10000, 25000, 50000];

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleContinue = () => {
    if (amount && parseInt(amount) > 0) {
      setStep('payment');
    }
  };

  const handlePaymentMethod = (method: string) => {
    navigate('/payment-gateway', { state: { amount, currency: 'NGN', method } });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 px-4 py-6">
      <button
        onClick={() => navigate('/home')}
        className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex-1 max-w-sm w-full mx-auto space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Fund NGN Wallet</h1>
          <p className="text-sm text-slate-400">Add funds to your wallet</p>
        </div>

        {step === 'amount' && (
          <>
            <Card className="border-0 bg-slate-800 p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">
                  Amount (NGN)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-slate-600 bg-slate-700 text-white text-lg placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400">Quick amounts</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleAmountSelect(value)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        amount === value.toString()
                          ? 'bg-yellow-400 text-slate-900'
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      ₦{(value / 1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleContinue}
                disabled={!amount || parseInt(amount) <= 0}
                className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-500 disabled:opacity-50"
              >
                Continue
              </Button>
            </Card>
          </>
        )}

        {step === 'payment' && (
          <>
            <Card className="border-0 bg-slate-800 p-4 space-y-4">
              <div className="bg-slate-700 p-3 rounded-lg">
                <p className="text-xs text-slate-400">Amount to fund</p>
                <h2 className="text-2xl font-bold text-white">
                  ₦{parseInt(amount).toLocaleString()}
                </h2>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">
                  Select payment method
                </p>
                <div className="space-y-2">
                  {['Bank Transfer', 'Card', 'USSD'].map((method) => (
                    <button
                      key={method}
                      onClick={() => handlePaymentMethod(method)}
                      className="w-full p-3 rounded-lg border border-slate-600 bg-slate-700 text-white hover:bg-slate-600 transition-colors text-left"
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setStep('amount')}
                variant="outline"
                className="w-full border-slate-600 text-white hover:bg-slate-700"
              >
                Back
              </Button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
