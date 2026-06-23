import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dashboardService, SingleUserPortfolioResponse } from '@/lib/api/dashboardService';
import { toast } from 'sonner';

export default function PortfolioOverview() {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const [data, setData] = useState<SingleUserPortfolioResponse['data'] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const response = await dashboardService.getSingleUserPortfolio({ userID: userId });
                if (response.status) {
                    setData(response.data);
                }
            } catch (error) {
                console.error('Error fetching portfolio details:', error);
                toast.error('Failed to load portfolio details');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const formatCurrency = (amount: number | string, currency: string = 'NGN') => {
        const val = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(val)) return '-';

        const validCurrency = currency && currency.trim() !== '' ? currency : 'NGN';

        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: validCurrency,
            minimumFractionDigits: 2
        }).format(val);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading portfolio data...</div>;
    }

    if (!data) {
        return <div className="text-center py-10">User portfolio not found</div>;
    }

    const { profile, transaction_history: transactions, investment_breakdown: investments } = data;

    // Calculate stats from investments
    const totalInvested = investments.reduce((acc, curr) => acc + curr.amount_paid, 0);
    const currentPortfolioValue = investments.reduce((acc, curr) => acc + curr.current_value, 0);
    const totalRoiEarned = currentPortfolioValue - totalInvested;
    const activeInvestmentsCount = investments.filter(inv => inv.status.toLowerCase() === 'active').length;

    // Common currency (Fallback to NGN if empty)
    const baseCurrency = investments[0]?.currency || 'NGN';

    // Group transactions by date
    const groupedTransactions: { [key: string]: typeof transactions } = {};
    transactions.forEach(tx => {
        if (!groupedTransactions[tx.date]) groupedTransactions[tx.date] = [];
        groupedTransactions[tx.date].push(tx);
    });

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button onClick={() => navigate('/dashboard/portfolio')}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={() => navigate('/dashboard/portfolio')} className="text-slate-400 hover:text-slate-600">
                    Portfolio management
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">{profile.fname} {profile.lname}</span>
            </div>

            {/* Header Row */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900">Portfolio Overview</h1>
                <button className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors">
                    Actions
                </button>
            </div>

            {/* Dark Stats Banner */}
            <div className="bg-[#0A0E1A] rounded-2xl px-6 py-5 grid grid-cols-4 gap-4">
                {[
                    { label: 'Portfolio value', value: formatCurrency(currentPortfolioValue, baseCurrency) },
                    { label: 'Total invested amount', value: formatCurrency(totalInvested, baseCurrency) },
                    { label: 'Total ROI earned', value: formatCurrency(totalRoiEarned, baseCurrency) },
                    { label: 'Active investments', value: String(activeInvestmentsCount) },
                ].map(({ label, value }) => (
                    <div key={label}>
                        <p className="text-xs text-slate-400 mb-1">{label}</p>
                        <p className="text-xl font-bold text-white">{value}</p>
                    </div>
                ))}
            </div>

            {/* User Card + Transactions Row */}
            <div className="grid grid-cols-2 gap-5">
                {/* User Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center ring-2 ring-slate-100 text-slate-400 text-xl font-bold">
                            {profile.fname.charAt(0)}{profile.lname.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">{profile.fname} {profile.lname}</h2>
                            <p className="text-sm text-slate-400 font-mono">{profile.clientID}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                            <span className="text-sm text-slate-500">ID</span>
                            <span className="text-sm font-medium text-slate-700">{profile.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-50">
                            <span className="text-sm text-slate-500">Phone Number</span>
                            <span className="text-sm font-medium text-slate-700">{profile.phone}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-slate-500">KYC status</span>
                            <span className="text-sm font-semibold text-emerald-500">{profile.kyc_level}</span>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-h-[400px] overflow-auto">
                    <h2 className="text-sm font-bold text-slate-800 mb-4">All transaction history</h2>
                    <div className="space-y-4">
                        {Object.keys(groupedTransactions).length === 0 ? (
                            <div className="text-sm text-slate-400 text-center py-4">No transactions found</div>
                        ) : (
                            Object.entries(groupedTransactions).map(([date, txItems]) => (
                                <div key={date}>
                                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">{date}</p>
                                    <div className="space-y-2">
                                        {txItems.map((tx) => {
                                            const isCredit = tx.type?.toLowerCase() === 'credit';
                                            return (
                                                <div key={tx.id} className="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left border border-transparent hover:border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                                            isCredit ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-400"
                                                        )}>
                                                            {isCredit ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">{tx.tnx_id}</p>
                                                            <p className="text-xs text-slate-400">{tx.type}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={cn("text-sm font-bold", isCredit ? "text-emerald-500" : "text-slate-800")}>
                                                            {isCredit ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Investment Breakdown Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-800">Investment Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-50">
                                {['S/N', 'Product name', 'Amount invested', 'Current value', 'ROI', 'Maturity date', 'Status', 'Action'].map(col => (
                                    <th key={col} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {investments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">No investment data found</td>
                                </tr>
                            ) : (
                                investments.map((inv, i) => (
                                    <tr key={inv.investment_id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 py-4 text-sm text-slate-400">{i + 1}</td>
                                        <td className="px-4 py-4 text-sm font-medium text-slate-800">{inv.product_name}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{formatCurrency(inv.amount_paid, inv.currency)}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{formatCurrency(inv.current_value, inv.currency)}</td>
                                        <td className="px-4 py-4 text-sm text-slate-600">{inv.roi_percentage}</td>
                                        <td className="px-4 py-4 text-sm text-slate-400 whitespace-nowrap">{inv.maturity_date}</td>
                                        <td className="px-4 py-4">
                                            <span className={cn("text-sm font-semibold capitalize",
                                                inv.status.toLowerCase() === 'active' ? "text-emerald-500" :
                                                    inv.status.toLowerCase() === 'matured' ? "text-[#B8860B]" : "text-slate-500"
                                            )}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => navigate(`/dashboard/portfolio/${userId}/investment/${inv.investment_id}`)}
                                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
