import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Filter, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type StockStatus = 'Active' | 'Inactive' | 'Suspended';

interface Stock {
    id: string;
    sn: number;
    logo: string;
    companyName: string;
    ticker: string;
    sector: string;
    currentPrice: string;
    dailyChange: string;
    status: StockStatus;
}

const MOCK_STOCKS: Stock[] = Array.from({ length: 25 }, (_, i) => ({
    id: `stock-${i + 1}`,
    sn: i + 1,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Access_Bank_Logo.svg/200px-Access_Bank_Logo.svg.png',
    companyName: i === 1 ? 'BUA cement' : i === 2 ? 'Betaglass' : 'Access Holdings',
    ticker: i === 1 ? 'BUACEMENT' : i === 2 ? 'BETAGLASS' : 'ACCESSCORP',
    sector: i === 1 ? 'Industrials' : i === 2 ? 'Manufacturing' : 'Banking',
    currentPrice: i === 1 ? '₦124.00' : i === 2 ? '₦52.30' : '₦99.20',
    dailyChange: i === 1 ? '-0.3%' : i === 2 ? '+0.0%' : '+0.8%',
    status: i === 2 ? 'Inactive' : 'Active',
}));

const PAGE_SIZE = 10;

const statusColor: Record<StockStatus, string> = {
    Active: 'text-emerald-500',
    Inactive: 'text-red-400',
    Suspended: 'text-orange-400',
};

// Map product id to display label
const PRODUCT_LABELS: Record<string, { title: string; addLabel: string }> = {
    'ngn-stocks': { title: 'NGN Stocks', addLabel: 'Add NGN Stocks' },
    'us-stocks': { title: 'US Stocks', addLabel: 'Add US Stocks' },
};

export default function NGNStocksOverview() {
    const navigate = useNavigate();
    const { productId } = useParams();

    const key = productId ?? 'ngn-stocks';
    const { title, addLabel } = PRODUCT_LABELS[key] ?? { title: 'NGN Stocks', addLabel: 'Add NGN Stocks' };

    const [stocks, setStocks] = useState<Stock[]>(MOCK_STOCKS);
    const [page, setPage] = useState(1);
    const [loaded, setLoaded] = useState(true); // toggle to show empty state

    const totalPages = Math.ceil(stocks.length / PAGE_SIZE);
    const pageStocks = stocks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const activeCount = stocks.filter(s => s.status === 'Active').length;
    const suspendedCount = stocks.filter(s => s.status === 'Suspended' || s.status === 'Inactive').length;

    const handleDelete = (id: string) => setStocks(prev => prev.filter(s => s.id !== id));

    const stats = [
        { icon: '🟡', label: 'Total stocks listed', value: loaded ? stocks.length : 0 },
        { icon: '🟢', label: 'Active stocks', value: loaded ? activeCount : 0 },
        { icon: '🔴', label: 'Suspended/Delisted', value: loaded ? suspendedCount : 0 },
        { icon: '🔵', label: 'Last updated', value: loaded ? '4 Oct 2025' : 'Nil', isText: true },
    ];

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button
                    onClick={() => navigate('/dashboard/investments')}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-slate-300">|</span>
                <button
                    onClick={() => navigate('/dashboard/investments')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Investment Products
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">{title}</span>
            </div>

            {/* Overview Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900">Overview</h1>
                <button
                    onClick={() => navigate(`/dashboard/investments/${key}/add`)}
                    className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors"
                >
                    {addLabel}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                {stats.map(({ icon, label, value, isText }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{icon}</span>
                            <p className="text-xs text-slate-500 font-medium">{label}</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{isText ? value : value}</p>
                    </div>
                ))}
            </div>

            {/* Table or Empty */}
            {!loaded || stocks.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-24 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                    </div>
                    <p className="text-base font-semibold text-slate-700">No stock added</p>
                    <p className="text-sm text-slate-400">{title} added will appear here</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h2 className="text-base font-bold text-slate-900">Stocks</h2>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                            <Filter size={12} />
                            Filter
                        </button>
                    </div>

                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                {['S/N', 'Company Name', 'Sector', 'Current price', 'Daily change', 'Status', 'Action'].map((col) => (
                                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pageStocks.map((stock) => (
                                <tr key={stock.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-slate-500">{stock.sn}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg border border-slate-100 bg-white flex items-center justify-center p-1 shrink-0">
                                                <img src={stock.logo} alt={stock.companyName} className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">{stock.companyName}</p>
                                                <p className="text-xs text-slate-400">{stock.ticker}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{stock.sector}</td>
                                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{stock.currentPrice}</td>
                                    <td className={cn("px-4 py-3 text-sm font-semibold",
                                        stock.dailyChange.startsWith('+') ? 'text-emerald-500' : 'text-red-500'
                                    )}>
                                        {stock.dailyChange}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={cn("text-sm font-semibold", statusColor[stock.status])}>
                                            {stock.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => navigate(`/dashboard/investments/${key}/stock/${stock.id}`)}
                                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/dashboard/investments/${key}/stock/${stock.id}/edit`)}
                                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-yellow-600 transition-colors"
                                            >
                                                <Pencil size={15} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(stock.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={cn(
                                            "w-8 h-8 rounded-lg text-xs font-semibold transition-colors",
                                            page === p
                                                ? "bg-[#B8860B] text-white"
                                                : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                                        )}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Go to page</span>
                            <input
                                type="number"
                                min={1}
                                max={totalPages}
                                value={page}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value);
                                    if (v >= 1 && v <= totalPages) setPage(v);
                                }}
                                className="w-14 border border-slate-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-yellow-400"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}