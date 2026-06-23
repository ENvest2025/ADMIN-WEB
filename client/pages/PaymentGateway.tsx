import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

export default function PaymentGateway() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<'details' | 'otp' | 'success'>('details');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [otp, setOtp] = useState('');

  const amount = location.state?.amount || '0';
  const currency = location.state?.currency || 'NGN';
  const method = location.state?.method || '';

  const handleCardNumberChange = (value: string) => {
    const formatted = value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .slice(0, 5);
    setExpiryDate(formatted);
  };

  const handleCVVChange = (value: string) => {
    if (/^\d{0,3}$/.test(value)) {
      setCvv(value);
    }
  };

  const handlePayment = () => {
    if (cardNumber && expiryDate && cvv) {
      setStep('otp');
    }
  };

  const handleOTPVerify = () => {
    if (otp.length === 4) {
      setStep('success');
    }
  };

  const handleSuccess = () => {
    if (currency === 'NGN') {
      navigate('/home');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex-1 max-w-sm w-full mx-auto space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Payment Gateway</h1>
          <p className="text-sm text-slate-400">
            {method} • {currency === 'NGN' ? '₦' : '$'}{amount}
          </p>
        </div>

        {step === 'details' && (
          <Card className="border-0 bg-slate-800 p-4 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">
                Card Number
              </label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">
                  Expiry Date
                </label>
                <Input
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">
                  CVV
                </label>
                <Input
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => handleCVVChange(e.target.value)}
                  className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <Button
              onClick={handlePayment}
              disabled={!cardNumber || !expiryDate || !cvv}
              className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-500 disabled:opacity-50"
            >
              Continue
            </Button>
          </Card>
        )}

        {step === 'otp' && (
          <Card className="border-0 bg-slate-800 p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">Verify OTP</h2>
              <p className="text-sm text-slate-400">
                Enter the 4-digit code sent to your device
              </p>
            </div>

            <div className="space-y-1">
              <Input
                type="text"
                placeholder="0000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="border-slate-600 bg-slate-700 text-white text-center text-2xl letter-spacing font-mono placeholder:text-slate-500"
              />
            </div>

            <Button
              onClick={handleOTPVerify}
              disabled={otp.length !== 4}
              className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-500 disabled:opacity-50"
            >
              Verify
            </Button>
          </Card>
        )}

        {step === 'success' && (
          <Card className="border-0 bg-slate-800 p-6 flex flex-col items-center justify-center space-y-6 min-h-96">
            <div className="text-5xl">✓</div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Payment Successful</h2>
              <p className="text-slate-400">
                {currency === 'NGN' ? '₦' : '$'}{amount} has been added to your wallet
              </p>
            </div>
            <Button
              onClick={handleSuccess}
              className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-500"
            >
              Done
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
