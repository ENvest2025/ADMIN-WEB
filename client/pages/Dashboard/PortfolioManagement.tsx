import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Eye, TrendingUp, Users, BarChart3, Clock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dashboardService, PortfolioStatsResponse, UserPortfolioItem } from '@/lib/api/dashboardService';
import { toast } from 'sonner';

function StatCard({ icon: Icon, label, value, accent, loading }: { icon: any; label: string; value: string; accent?: boolean; loading?: boolean }) {
    return (
        <div className={cn("bg-white rounded-2xl p-5 border flex-1 shadow-sm", accent ? "border-yellow-200" : "border-slate-100")}>
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-slate-500">{label}</p>
                <div className={cn("p-2 rounded-xl", accent ? "bg-yellow-50" : "bg-slate-50")}>
                    <Icon size={14} className={accent ? "text-yellow-600" : "text-slate-400"} />
                </div>
            </div>
            {loading ? (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-md" />
            ) : (
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            )}
        </div>
    );
}

export default function PortfolioManagement() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<PortfolioStatsResponse['data'] | null>(null);
    const [users, setUsers] = useState<UserPortfolioItem[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [status, setStatus] = useState<any>('active');
    const [currentPage, setCurrentPage] = useState(0); // Offset for API
    const [pageSize] = useState(10);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset page to 0 when search or status changes
    useEffect(() => {
        setCurrentPage(0);
    }, [debouncedSearch, status]);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            const response = await dashboardService.getPortfolioStats();
            if (response.status) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load portfolio statistics');
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await dashboardService.getAllUserPortfolios({
                search: debouncedSearch || undefined,
                status: status,
                start: currentPage * pageSize,
                length: pageSize,
                order_column: 'created',
                order_dir: 'DESC',
                currency: 'NGN' // Default to NGN as per API optional field
            });
            if (response.status) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load user portfolios');
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, debouncedSearch, status]);

    const formatCurrency = (amount: string | number, currency: string = 'NGN') => {
        const value = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(value);
    };

    const totalPortValueStr = stats?.total_port_value?.map(v => `${formatCurrency(v.total, v.currency)}`).join(' / ') || '₦0.00';

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-slate-900">Portfolio management</h1>

            {/* Stats */}
            <div className="flex gap-4">
                <StatCard icon={TrendingUp} label="Total portfolio value" value={totalPortValueStr} accent loading={loadingStats} />
                <StatCard icon={Users} label="Number of active portfolios" value={stats?.number_active_port.toString() || '0'} loading={loadingStats} />
                <StatCard icon={BarChart3} label="Total returns generated" value="N/A" loading={loadingStats} />
                <StatCard icon={Clock} label="Portfolios pending action" value={stats?.port_pending_actions.toString() || '0'} loading={loadingStats} />
            </div>

            {/* Two Tables Row */}
            <div className="grid grid-cols-2 gap-5">
                {/* By Volume */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-50">
                        <h2 className="text-sm font-bold text-slate-800">Investment products by Volume</h2>
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-white">
                                <tr className="border-b border-slate-50">
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Investment products</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">By Volume</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loadingStats ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i}>
                                            <td className="px-5 py-3.5"><div className="h-4 w-32 bg-slate-50 animate-pulse rounded" /></td>
                                            <td className="px-5 py-3.5"><div className="h-4 w-20 bg-slate-50 animate-pulse rounded ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    stats?.Investment_products_by_volume.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-3.5 text-sm text-slate-600">{row.product_name}</td>
                                            <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 text-right">{formatCurrency(row.volume, row.currency)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* By Performance */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-50">
                        <h2 className="text-sm font-bold text-slate-800">Investment products by Performance</h2>
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-white">
                                <tr className="border-b border-slate-50">
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Investment products</th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Average ROI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loadingStats ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i}>
                                            <td className="px-5 py-3.5"><div className="h-4 w-32 bg-slate-50 animate-pulse rounded" /></td>
                                            <td className="px-5 py-3.5"><div className="h-4 w-20 bg-slate-50 animate-pulse rounded ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    stats?.Investment_products_by_performance.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-3.5 text-sm text-slate-600">{row.product_name}</td>
                                            <td className="px-5 py-3.5 text-sm font-semibold text-slate-800 text-right">{row.average_roi}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* User Portfolio List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-800">User Portfolio List</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-1 focus:ring-yellow-400"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors focus:ring-1 focus:ring-yellow-400 outline-none"
                        >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="matured">Matured</option>
                            <option value="liquidated">Liquidated</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-50">
                            {['S/N', 'User ID', 'User Name', 'Total investments', 'Val (NGN)', 'Val (USD)', 'ROI Avg', 'Action'].map(col => (
                                <th key={col} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loadingUsers ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(j => (
                                        <td key={j} className="px-4 py-4"><div className="h-4 w-full bg-slate-50 animate-pulse rounded" /></td>
                                    ))}
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">No user portfolios found</td>
                            </tr>
                        ) : (
                            users.map((user, i) => (
                                <tr key={user.userID} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-4 py-4 text-sm text-slate-400">{currentPage * pageSize + i + 1}</td>
                                    <td className="px-4 py-4 text-sm font-mono text-slate-600">{user.userID}</td>
                                    <td className="px-4 py-4 text-sm font-semibold text-slate-800">{user.full_name}</td>
                                    <td className="px-4 py-4 text-sm text-slate-600">{user.total_investments}</td>
                                    <td className="px-4 py-4 text-sm font-semibold text-slate-800">{formatCurrency(user.total_value_ngn, 'NGN')}</td>
                                    <td className="px-4 py-4 text-sm font-semibold text-slate-800">{formatCurrency(user.total_value_usd, 'USD')}</td>
                                    <td className="px-4 py-4 text-sm text-slate-600">{user.avg_roi ? `${user.avg_roi}` : 'N/A'}</td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => navigate(`/dashboard/portfolio/${user.userID}`)}
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

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                    <span className="text-sm text-slate-400">Page {currentPage + 1}</span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={users.length < pageSize}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
