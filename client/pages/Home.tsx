import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useInvestmentStore } from '@/stores/investmentStore';
import { useAuthStore } from '@/stores/authStore';
import { LogOut } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { portfolio } = useInvestmentStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const investments = [
    {
      id: '1',
      name: 'SEPLAT Energy',
      symbol: 'SEPLAT',
      price: '₦750.00',
      change: '+5.2%',
      logo: '📈',
      amount: '₦50,000',
    },
    {
      id: '2',
      name: 'MTN Nigeria',
      symbol: 'MTNN',
      price: '₦288.50',
      change: '+2.1%',
      logo: '📱',
      amount: '₦75,000',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome, {user?.firstName}</h1>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-slate-800 rounded-lg"
        >
          <LogOut className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Portfolio Value */}
      <Card className="border-0 bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 mb-6">
        <p className="text-sm font-medium text-slate-900">Total Portfolio Value</p>
        <h2 className="text-3xl font-bold text-slate-900 mt-2">
          ₦{(portfolio.totalValue || 0).toLocaleString()}
        </h2>
        <p className="text-sm text-slate-800 mt-2">
          +{portfolio.percentageGain || 0}% this month
        </p>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button
          onClick={() => navigate('/fund-ngn-wallet')}
          className="bg-slate-800 text-white hover:bg-slate-700"
        >
          Fund NGN
        </Button>
        <Button
          onClick={() => navigate('/deposit-usd-wallet')}
          className="bg-slate-800 text-white hover:bg-slate-700"
        >
          Deposit USD
        </Button>
      </div>

      {/* Wallet Balance */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="border-0 bg-slate-800 p-4">
          <p className="text-xs text-slate-400">NGN Balance</p>
          <h3 className="text-xl font-bold text-white mt-2">
            ₦{(portfolio.ngnWalletBalance || 0).toLocaleString()}
          </h3>
        </Card>
        <Card className="border-0 bg-slate-800 p-4">
          <p className="text-xs text-slate-400">USD Balance</p>
          <h3 className="text-xl font-bold text-white mt-2">
            ${(portfolio.usdWalletBalance || 0).toFixed(2)}
          </h3>
        </Card>
      </div>

      {/* Investments Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">My Investments</h3>
          <button
            onClick={() => navigate('/invest-stocks')}
            className="text-yellow-400 text-sm hover:underline"
          >
            View all
          </button>
        </div>

        <div className="space-y-2">
          {investments.map((investment) => (
            <Card
              key={investment.id}
              className="border-0 bg-slate-800 p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{investment.logo}</div>
                <div>
                  <h4 className="font-medium text-white">{investment.name}</h4>
                  <p className="text-xs text-slate-400">{investment.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">{investment.amount}</p>
                <p className="text-xs text-green-400">{investment.change}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3">Transaction History</h3>
        <Card className="border-0 bg-slate-800 p-4 text-center">
          <p className="text-slate-400">No transactions yet</p>
          <Button
            onClick={() => navigate('/fund-ngn-wallet')}
            className="mt-4 bg-yellow-400 text-slate-900 hover:bg-yellow-500"
            size="sm"
          >
            Make a transaction
          </Button>
        </Card>
      </div>
    </div>
  );
}
