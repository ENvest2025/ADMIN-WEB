import { useEffect, useMemo, useState } from 'react';
import {
    Search,
    Loader2,
    Info,
    ChevronLeft,
    ChevronRight,
    Hash,
    Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { withdrawalsService } from '@/lib/api/withdrawalsService';
import { TransferOutRow } from '@shared/api';

const PAGE_SIZE = 20;

const STATUS_STYLES: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    otp: 'bg-blue-50 text-blue-600 border-blue-200',
    processing: 'bg-amber-50 text-amber-600 border-amber-200',
    failed: 'bg-red-50 text-red-600 border-red-200',
    reversed: 'bg-orange-50 text-orange-600 border-orange-200',
    abandoned: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statusStyle = (s: string) =>
    STATUS_STYLES[(s || '').toLowerCase()] || 'bg-slate-100 text-slate-600 border-slate-200';

const symbol = (c: string) => (c?.toUpperCase() === 'USD' ? '$' : c?.toUpperCase() === 'NGN' ? '₦' : `${c || ''} `);

const money = (currency: string, value: number | string, formatted?: string) => {
    if (formatted) return `${symbol(currency)}${formatted}`;
    const n = typeof value === 'number' ? value : parseFloat(String(value || '0')) || 0;
    return `${symbol(currency)}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value: string | null) => {
    if (!value) return '—';
    const d = new Date(value.replace(' ', 'T'));
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export function PayoutsReport() {
    const [rows, setRows] = useState<TransferOutRow[]>([]);
    const [total, setTotal] = useState(0);
    const [filtered, setFiltered] = useState(0);
    const [loading, setLoading] = useState(true);

    // Applied filters
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState('');
    const [currency, setCurrency] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(0);

    // Draft (input) values, applied on submit
    const [searchInput, setSearchInput] = useState('');

    const drawRef = useMemo(() => ({ n: 0 }), []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            drawRef.n += 1;
            const res = await withdrawalsService.transfersOutReport({
                draw: drawRef.n,
                start: page * PAGE_SIZE,
                length: PAGE_SIZE,
                order: [{ column: 7, dir: 'desc' }],
                search: { value: searchTerm, regex: false },
                status,
                currency,
                sender_email: '',
                date_from: dateFrom,
                date_to: dateTo,
            });
            if (res.status) {
                setRows(res.data?.rows ?? []);
                setTotal(res.data?.recordsTotal ?? 0);
                setFiltered(res.data?.recordsFiltered ?? 0);
            } else {
                toast.error(res.message || 'Failed to load payouts');
                setRows([]);
            }
        } catch (err) {
            console.error('Error fetching payouts:', err);
            toast.error('Failed to load payouts report');
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm, status, currency, dateFrom, dateTo]);

    const totalPages = Math.max(1, Math.ceil(filtered / PAGE_SIZE));

    const applySearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setSearchTerm(searchInput.trim());
    };

    const onFilter = (setter: (v: string) => void) => (v: string) => {
        setPage(0);
        setter(v);
    };

    const selectCls = 'border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400';

    return (
        <div className="space-y-4">
            {/* Filters */}
            <form onSubmit={applySearch} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4 flex flex-col lg:flex-row gap-3 lg:items-end">
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        placeholder="Search by recipient, reference, email…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-400"
                    />
                </div>
                <div className="grid grid-cols-2 lg:flex gap-3">
                    <select value={status} onChange={(e) => onFilter(setStatus)(e.target.value)} className={selectCls}>
                        <option value="">All statuses</option>
                        <option value="success">Success</option>
                        <option value="pending">Pending</option>
                        <option value="otp">OTP</option>
                        <option value="failed">Failed</option>
                        <option value="reversed">Reversed</option>
                    </select>
                    <select value={currency} onChange={(e) => onFilter(setCurrency)(e.target.value)} className={selectCls}>
                        <option value="">All currencies</option>
                        <option value="NGN">NGN</option>
                        <option value="USD">USD</option>
                    </select>
                    <input type="date" value={dateFrom} onChange={(e) => onFilter(setDateFrom)(e.target.value)} className={selectCls} aria-label="From date" />
                    <input type="date" value={dateTo} onChange={(e) => onFilter(setDateTo)(e.target.value)} className={selectCls} aria-label="To date" />
                </div>
                <button type="submit" className="bg-[#B8860B] hover:bg-[#966d09] text-white h-10 px-5 rounded-xl text-sm font-semibold w-full lg:w-auto">
                    Search
                </button>
            </form>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-800">Payouts (Transfers out)</h2>
                    <span className="text-sm text-slate-400">{filtered.toLocaleString()} of {total.toLocaleString()}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50">
                                {['Reference', 'Recipient', 'Amount', 'Fee', 'Reason', 'Status', 'Created', 'Transferred'].map((c) => (
                                    <th key={c} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{c}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                                    <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16} /> Loading payouts...</div>
                                </td></tr>
                            ) : rows.length === 0 ? (
                                <tr><td colSpan={8} className="px-4 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <div className="bg-slate-50 w-14 h-14 rounded-full flex items-center justify-center"><Info size={22} /></div>
                                        <p className="font-medium text-slate-600">No payouts found</p>
                                        <p className="text-sm">No transfers match the current filters.</p>
                                    </div>
                                </td></tr>
                            ) : rows.map((r) => (
                                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="font-mono text-xs text-slate-700 flex items-center gap-1">
                                            <Hash size={11} className="text-slate-400 shrink-0" />{r.reference}
                                        </div>
                                        <div className="text-[11px] text-slate-400 font-mono">{r.paystack_transfer_code}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="font-semibold text-slate-800 text-sm">{r.recipient_name}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <Building2 size={11} className="text-slate-400 shrink-0" />
                                            {r.recipient_bank_name} · {r.recipient_account_number}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-semibold text-slate-800">{money(r.currency, r.amount, r.amount_formatted)}</td>
                                    <td className="px-4 py-4 text-sm text-slate-500">{money(r.currency, r.fee_charged)}</td>
                                    <td className="px-4 py-4 text-sm text-slate-600 max-w-[200px] truncate" title={r.reason}>{r.reason || '—'}</td>
                                    <td className="px-4 py-4">
                                        <span className={cn('inline-block text-xs font-semibold px-2.5 py-1 rounded-full border capitalize', statusStyle(r.status))}>
                                            {r.status}{r.otp_required ? ' · OTP' : ''}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-slate-400">{formatDate(r.created_at)}</td>
                                    <td className="px-4 py-4 text-sm text-slate-400">{formatDate(r.transferred_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && filtered > 0 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                        <span className="text-sm text-slate-400">Page {page + 1} of {totalPages}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 text-sm font-medium text-slate-600">{page + 1}</span>
                            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page + 1 >= totalPages}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
