import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

export default function InvestStocks() {
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const stocks = [
    {
      id: '1',
      name: 'SEPLAT Energy',
      symbol: 'SEPLAT',
      price: 750,
      change: 5.2,
      logo: '⚡',
      description: 'Energy & Oil',
    },
    {
      id: '2',
      name: 'MTN Nigeria',
      symbol: 'MTNN',
      price: 288.5,
      change: 2.1,
      logo: '📱',
      description: 'Telecommunications',
    },
    {
      id: '3',
      name: 'Guaranty Trust Bank',
      symbol: 'GUARANTY',
      price: 32.75,
      change: 3.8,
      logo: '🏦',
      description: 'Banking',
    },
    {
      id: '4',
      name: 'Nestle Nigeria',
      symbol: 'NESTLE',
      price: 850,
      change: 1.5,
      logo: '🍽️',
      description: 'Consumer Goods',
    },
    {
      id: '5',
      name: 'BUA Cement',
      symbol: 'BUACEMENT',
      price: 65.25,
      change: 4.2,
      logo: '🏗️',
      description: 'Building Materials',
    },
  ];

  const handleInvest = () => {
    if (selectedStock && amount) {
      navigate('/payment-gateway', {
        state: { amount, currency: 'NGN', method: 'Bank Transfer' },
      });
    }
  };

  if (selectedStock) {
    const stock = stocks.find((s) => s.id === selectedStock);

    return (
      <div className="flex min-h-screen flex-col bg-slate-900 px-4 py-6">
        <button
          onClick={() => setSelectedStock(null)}
          className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex-1 max-w-sm w-full mx-auto space-y-4">
          <Card className="border-0 bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 text-center">
            <div className="text-5xl mb-2">{stock?.logo}</div>
            <h1 className="text-2xl font-bold text-slate-900">{stock?.name}</h1>
            <p className="text-slate-800 text-sm">{stock?.symbol}</p>
          </Card>

          <Card className="border-0 bg-slate-800 p-4 space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Current Price</p>
              <h2 className="text-3xl font-bold text-white">
                ₦{stock?.price.toLocaleString()}
              </h2>
              <p className={`text-sm ${stock!.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stock!.change > 0 ? '+' : ''}{stock?.change}%
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">
                Amount to Invest (₦)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            {amount && (
              <div className="bg-slate-700 p-3 rounded-lg">
                <p className="text-xs text-slate-400">
                  You'll get approximately{' '}
                  {((parseInt(amount) || 0) / (stock?.price || 1)).toFixed(2)}{' '}
                  shares
                </p>
              </div>
            )}

            <Button
              onClick={handleInvest}
              disabled={!amount || parseInt(amount) <= 0}
              className="w-full bg-yellow-400 text-slate-900 hover:bg-yellow-500 disabled:opacity-50"
            >
              Invest Now
            </Button>
          </Card>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">Invest in NGN Stocks</h1>
          <p className="text-sm text-slate-400">Browse and invest in Nigerian stocks</p>
        </div>

        <div className="space-y-2">
          {stocks.map((stock) => (
            <Card
              key={stock.id}
              onClick={() => setSelectedStock(stock.id)}
              className="border-0 bg-slate-800 p-4 cursor-pointer hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{stock.logo}</div>
                  <div>
                    <h3 className="font-medium text-white">{stock.name}</h3>
                    <p className="text-xs text-slate-400">{stock.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">₦{stock.price.toLocaleString()}</p>
                  <p
                    className={`text-xs ${
                      stock.change > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stock.change > 0 ? '+' : ''}{stock.change}%
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
