import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';

const CHART_DATA: Record<TimeRange, { date: string; value: number }[]> = {
    '1W': [
        { date: 'Mon', value: 190000 }, { date: 'Tue', value: 210000 }, { date: 'Wed', value: 195000 },
        { date: 'Thu', value: 230000 }, { date: 'Fri', value: 220000 }, { date: 'Sat', value: 245000 }, { date: 'Sun', value: 240000 },
    ],
    '1M': [
        { date: '1', value: 150000 }, { date: '5', value: 180000 }, { date: '10', value: 160000 },
        { date: '15', value: 200000 }, { date: '20', value: 190000 }, { date: '25', value: 220000 }, { date: '30', value: 210000 },
    ],
    '3M': [
        { date: 'Oct', value: 120000 }, { date: 'Nov', value: 170000 }, { date: 'Dec', value: 200000 },
        { date: 'Jan', value: 180000 }, { date: 'Feb', value: 210000 }, { date: 'Mar', value: 240000 },
    ],
    '6M': [
        { date: 'Jul', value: 100000 }, { date: 'Aug', value: 130000 }, { date: 'Sep', value: 120000 },
        { date: 'Oct', value: 150000 }, { date: 'Nov', value: 180000 }, { date: 'Dec', value: 200000 },
    ],
    '1Y': [
        { date: 'Jan', value: 80000 }, { date: 'Mar', value: 110000 }, { date: 'May', value: 130000 },
        { date: 'Jul', value: 160000 }, { date: 'Sep', value: 190000 }, { date: 'Nov', value: 200000 }, { date: 'Dec', value: 210000 },
    ],
    '5Y': [
        { date: '2020', value: 50000 }, { date: '2021', value: 80000 }, { date: '2022', value: 120000 },
        { date: '2023', value: 170000 }, { date: '2024', value: 200000 }, { date: '2025', value: 240000 },
    ],
};

const STOCKS = [
    {
        id: 'access',
        name: 'Access Holdings Plc',
        ticker: 'ACCESSCORP',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Access_Bank_Logo.svg/200px-Access_Bank_Logo.svg.png',
        details: {
            stockName: 'Access Holdings Plc',
            ticker: 'ACCESSCORP',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Access_Bank_Logo.svg/200px-Access_Bank_Logo.svg.png',
            amountInvested: '₦200,600.00',
            avgCost: '₦18.50',
            units: '4400',
            totalReturn: '₦0.0',
            currentValue: '₦200,600.00',
            dateInvested: '17 May 2025  12:00 PM',
        },
        tradeHistory: [
            { date: 'Yesterday', items: [
                { id: 't1', type: 'Deposit', datetime: '05 Feb 2025, 11:00 AM', amount: '-₦0.00', status: 'Successful', isCredit: true },
                { id: 't2', type: 'Cash withdrawal', datetime: '05 Feb 2025, 11:00 AM', amount: '-₦0.00', status: 'Failed', isCredit: false },
            ]},
            { date: '25-Jul-2025', items: [
                { id: 't3', type: 'Cash withdrawal', datetime: '05 Feb 2025, 11:00 AM', amount: '-₦0.00', status: 'Failed', isCredit: false },
            ]},
        ],
    },
    {
        id: 'access2',
        name: 'Access Holdings Plc',
        ticker: 'ACCESSCORP',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Access_Bank_Logo.svg/200px-Access_Bank_Logo.svg.png',
        details: null,
        tradeHistory: [],
    },
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
        return (
            <div className="bg-[#B8860B] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                ₦{payload[0].value.toLocaleString()}
            </div>
        );
    }
    return null;
};

function StockAccordion({ stock, defaultOpen = false, onViewTx }: {
    stock: typeof STOCKS[0]; defaultOpen?: boolean; onViewTx: (id: string) => void;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const [timeRange, setTimeRange] = useState<TimeRange>('1M');

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center p-1">
                        <img src={stock.logo} alt={stock.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-900">{stock.name}</p>
                        <p className="text-xs text-slate-400">{stock.ticker}</p>
                    </div>
                </div>
                {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            {open && stock.details && (
                <div className="border-t border-slate-100 px-5 py-5">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Left: Stock Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 mb-3">Stock details</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <img src={stock.details.logo} alt={stock.details.stockName} className="w-8 h-8 object-contain" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{stock.details.stockName}</p>
                                        <p className="text-xs text-slate-400">{stock.details.ticker}</p>
                                    </div>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-xs text-slate-400">Amount invested</p>
                                    <p className="text-sm font-bold text-slate-900">{stock.details.amountInvested}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Average cost', value: stock.details.avgCost },
                                    { label: 'Units', value: stock.details.units },
                                    { label: 'Total return', value: stock.details.totalReturn, green: true },
                                    { label: 'Current value', value: stock.details.currentValue },
                                ].map(({ label, value, green }) => (
                                    <div key={label}>
                                        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                                        <p className={cn("text-sm font-semibold", green ? "text-emerald-500" : "text-slate-800")}>{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Date invested</p>
                                <p className="text-sm font-semibold text-slate-800">{stock.details.dateInvested}</p>
                            </div>
                        </div>

                        {/* Right: Trend Chart */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3">Trend</h3>
                            <ResponsiveContainer width="100%" height={160}>
                                <AreaChart data={CHART_DATA[timeRange]} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#B8860B" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#B8860B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" hide />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="value" stroke="#B8860B" strokeWidth={2}
                                        fill="url(#goldGrad)" dot={false}
                                        activeDot={{ r: 4, fill: '#B8860B', stroke: '#fff', strokeWidth: 2 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                            {/* Time toggles */}
                            <div className="flex gap-1 mt-2">
                                {(['1W', '1M', '3M', '6M', '1Y', '5Y'] as TimeRange[]).map((t) => (
                                    <button key={t} onClick={() => setTimeRange(t)}
                                        className={cn("flex-1 py-1 rounded-lg text-xs font-medium transition-all",
                                            timeRange === t ? "bg-[#B8860B] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        )}>
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Trade History */}
                            <div className="mt-4">
                                <h4 className="text-xs font-bold text-slate-700 mb-2">All trade history</h4>
                                {stock.tradeHistory.map((group) => (
                                    <div key={group.date} className="mb-2">
                                        <p className="text-xs text-slate-400 mb-1">{group.date}</p>
                                        {group.items.map((tx) => (
                                            <button key={tx.id} onClick={() => onViewTx(tx.id)}
                                                className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left">
                                                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                                    tx.isCredit ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                                                )}>
                                                    {tx.isCredit ? '+' : '-'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-semibold text-slate-800">{tx.type}</p>
                                                    <p className="text-xs text-slate-400">{tx.datetime}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-semibold text-slate-800">{tx.amount}</p>
                                                    <p className={cn("text-xs", tx.status === 'Successful' ? "text-emerald-500" : "text-red-500")}>
                                                        {tx.status}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function InvestmentBreakdown() {
    const navigate = useNavigate();
    const { userId, investmentId } = useParams();

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button onClick={() => navigate(`/dashboard/portfolio/${userId}`)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={() => navigate('/dashboard/portfolio')} className="text-slate-400 hover:text-slate-600">
                    Portfolio management
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">Investment breakdown</span>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { icon: '🟡', label: 'NGN Stock', value: '₦281,780.00' },
                    { icon: '🟢', label: 'Total Stocks', value: '2' },
                    { icon: '🔴', label: 'Total return (All time)', value: '₦7,780.00' },
                    { icon: '🔵', label: "Today's date", value: '22 Oct, 2025' },
                ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{icon}</span>
                            <p className="text-xs text-slate-500 font-medium">{label}</p>
                        </div>
                        <p className="text-xl font-bold text-slate-900">{value}</p>
                    </div>
                ))}
            </div>

            {/* Stock Accordions */}
            <div className="space-y-3">
                {STOCKS.map((stock, i) => (
                    <StockAccordion
                        key={stock.id + i}
                        stock={stock}
                        defaultOpen={i === 0}
                        onViewTx={(txId) => navigate(`/dashboard/portfolio/transaction/${txId}`)}
                    />
                ))}
            </div>
        </div>
    );
}