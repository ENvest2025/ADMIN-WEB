import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Eye, TrendingUp, TrendingDown, ArrowLeftRight, BarChart3, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { dashboardService, Transaction as ApiTransaction } from '@/lib/api/dashboardService';
import { toast } from 'sonner';



const TYPE_STYLES: Record<string, string> = {
    'Deposit': 'text-emerald-500',
    'Withdrawal': 'text-red-500',
    'Refund': 'text-blue-500',
    'Charge back': 'text-yellow-600',
};

const STATUS_STYLES: Record<string, string> = {
    '0': 'bg-slate-100 text-slate-600 border border-slate-200', // Pending
    '1': 'text-emerald-500', // Approved/Success
    '2': 'text-red-500', // Failed
    '3': 'text-orange-500', // Reversed
};

const STATUS_LABELS: Record<string, string> = {
    '0': 'Pending',
    '1': 'Approved',
    '2': 'Failed',
    '3': 'Reversed'
};

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
    return (
        <div className={cn(
            "bg-white rounded-2xl p-5 border flex-1",
            accent ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-white" : "border-slate-100"
        )}>
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <div className={cn("p-2 rounded-xl", accent ? "bg-yellow-100" : "bg-slate-100")}>
                    <Icon size={14} className={accent ? "text-yellow-600" : "text-slate-500"} />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                ₦{payload[0].value.toLocaleString()}
            </div>
        );
    }
    return null;
};

export default function Transactions() {
    const navigate = useNavigate();
    const [timePeriod, setTimePeriod] = useState<'Monthly' | 'Yearly'>('Monthly');
    const [currentPage, setCurrentPage] = useState(1);
    const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);

    const fetchTransactions = async (page: number) => {
        setLoading(true);
        try {
            const response = await dashboardService.getTransactionHistory({ page, limit: 10 });
            if (response.status) {
                setTransactions(response.data.transactions);
                setTotalPages(response.data.pagination.last_page);
                setTotalTransactions(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(currentPage);
    }, [currentPage]);

    // Graph Data Mapping
    const chartData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dataMap = months.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {} as Record<string, number>);

        transactions.forEach(tx => {
            const date = new Date(tx.created);
            const monthName = months[date.getMonth()];
            const amount = parseFloat(tx.amount.replace(/[^0-9.]/g, '')) || 0;
            if (dataMap[monthName] !== undefined) {
                dataMap[monthName] += amount;
            }
        });

        return months.map(month => ({
            month,
            value: dataMap[month]
        }));
    }, [transactions]);

    const stats = useMemo(() => {
        let inflow = 0;
        let outflow = 0;
        transactions.forEach(tx => {
            const amount = parseFloat(tx.amount.replace(/[^0-9.]/g, '')) || 0;
            if (tx.tnx_type.toLowerCase() === 'deposit') {
                inflow += amount;
            } else if (tx.tnx_type.toLowerCase() === 'withdrawal') {
                outflow += amount;
            }
        });
        return {
            inflow,
            outflow,
            balance: inflow - outflow,
            volume: totalTransactions
        };
    }, [transactions, totalTransactions]);

    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i <= 3 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="flex gap-4">
                <StatCard icon={TrendingUp} label="Inflow" value={`₦${stats.inflow.toLocaleString()}`} accent />
                <StatCard icon={TrendingDown} label="Outflow" value={`₦${stats.outflow.toLocaleString()}`} />
                <StatCard icon={ArrowLeftRight} label="Net Balance (Inflow – Outflow)" value={`₦${stats.balance.toLocaleString()}`} />
                <StatCard icon={BarChart3} label="Transactions Volume" value={stats.volume.toLocaleString()} />
            </div>

            {/* Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold text-slate-800">Transaction Analytics</h2>
                    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                        {(['Monthly', 'Yearly'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setTimePeriod(p)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                                    timePeriod === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <p className="text-3xl font-bold text-slate-900 mb-6">₦{stats.inflow.toLocaleString()}</p>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => v >= 1000 ? `${v / 1000}k` : v} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#B8860B', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#B8860B"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 6, fill: '#B8860B', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-800">Transactions</h2>
                    <button
                        onClick={() => navigate('/dashboard/transactions/filter')}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <Filter size={15} />
                        Filter
                    </button>
                </div>

                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-50">
                            {['S/N', 'Transaction ID', 'User Name', 'Channel', 'Transaction type', 'Amount', 'Status', 'Date request', 'Action'].map(col => (
                                <th key={col} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" size={16} />
                                        Loading transactions...
                                    </div>
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                                    No transactions found
                                </td>
                            </tr>
                        ) : transactions.map((tx, idx) => (
                            <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="px-4 py-4 text-sm text-slate-400">{(currentPage - 1) * 10 + idx + 1}</td>
                                <td className="px-4 py-4 text-sm font-mono text-slate-600">{tx.tnx_id}</td>
                                <td className="px-4 py-4 text-sm font-semibold text-slate-800">{tx.full_name}</td>
                                <td className="px-4 py-4 text-sm text-slate-500">{tx.method || 'Unknown'}</td>
                                <td className="px-4 py-4">
                                    <span className={cn("text-sm font-semibold", TYPE_STYLES[tx.tnx_type] || "text-slate-500")}>{tx.tnx_type}</span>
                                </td>
                                <td className="px-4 py-4 text-sm font-semibold text-slate-800">₦{parseFloat(tx.amount).toLocaleString()}</td>
                                <td className="px-4 py-4">
                                    {tx.status === 0 ? (
                                        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", STATUS_STYLES[tx.status])}>
                                            {STATUS_LABELS[tx.status]}
                                        </span>
                                    ) : (
                                        <span className={cn("text-sm font-semibold", STATUS_STYLES[tx.status])}>{STATUS_LABELS[tx.status]}</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-400">{new Date(tx.created).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                <td className="px-4 py-4">
                                    <button
                                        onClick={() => navigate(`/dashboard/transactions/${tx.tnx_id}`)}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                    <span className="text-sm text-slate-400">Page {currentPage} of {totalPages}</span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        {getPageNumbers().map((p, i) => (
                            <button key={i} onClick={() => typeof p === 'number' && setCurrentPage(p)}
                                className={cn("w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                                    p === currentPage ? "bg-[#B8860B] text-white"
                                        : p === '...' ? "text-slate-300 cursor-default"
                                            : "text-slate-500 hover:bg-slate-100"
                                )}>
                                {p}
                            </button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        Go to page
                        <input type="number" min={1} max={totalPages} defaultValue={currentPage}
                            onBlur={(e) => setCurrentPage(Math.min(totalPages, Math.max(1, Number(e.target.value))))}
                            className="w-14 text-center border border-slate-200 rounded-lg py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}