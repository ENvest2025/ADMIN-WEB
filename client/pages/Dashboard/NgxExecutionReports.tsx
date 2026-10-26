import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Loader2, Info, AlertTriangle, RefreshCw, Ban, ChevronDown, ChevronRight,
    ChevronLeft, Terminal, CandlestickChart,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ngxService } from '@/lib/api/ngxService';
import { NgxOrder } from '@shared/api';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = ['', 'pending', 'open', 'partially_filled', 'filled', 'cancelled', 'rejected'];

const statusStyle = (s: string) => {
    const v = (s || '').toLowerCase();
    if (v.includes('fill') && !v.includes('partial')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (v.includes('partial')) return 'bg-blue-50 text-blue-600 border-blue-200';
    if (v.includes('pending') || v.includes('open') || v.includes('new')) return 'bg-amber-50 text-amber-600 border-amber-200';
    if (v.includes('cancel')) return 'bg-orange-50 text-orange-600 border-orange-200';
    if (v.includes('reject') || v.includes('fail')) return 'bg-red-50 text-red-600 border-red-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
};

const sideStyle = (s: string) =>
    (s || '').toLowerCase().startsWith('b') ? 'text-emerald-600' : 'text-red-500';

const num = (v: unknown) => {
    if (v == null || v === '') return '—';
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return isNaN(n) ? String(v) : n.toLocaleString();
};

const money = (v: unknown) => {
    if (v == null || v === '') return '—';
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return isNaN(n) ? String(v) : `₦${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (v?: string) => {
    if (!v) return '—';
    const d = new Date(String(v).replace(' ', 'T'));
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// ─── Cancel confirm ───────────────────────────────────────────────────────────
function CancelModal({ order, submitting, onConfirm, onCancel }: Readonly<{ order: NgxOrder; submitting: boolean; onConfirm: () => void; onCancel: () => void }>) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
                <div className="w-12 h-12 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center mx-auto mb-4"><Ban className="text-orange-500" size={20} /></div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Cancel order?</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Request cancellation of order <span className="font-mono font-semibold text-slate-700">{order.transaction_id}</span> on the exchange?
                </p>
                <div className="flex gap-3">
                    <button type="button" onClick={onCancel} disabled={submitting} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Keep order</button>
                    <button type="button" onClick={onConfirm} disabled={submitting} className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 disabled:opacity-60 flex items-center justify-center gap-2">
                        {submitting && <Loader2 size={14} className="animate-spin" />}
                        {submitting ? 'Cancelling...' : 'Yes, cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Details drawer ───────────────────────────────────────────────────────────
function JsonBlock({ label, value }: Readonly<{ label: string; value: unknown }>) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">{label}</p>
            <pre className="text-xs bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto max-h-64 whitespace-pre-wrap break-words">
                {value == null ? '—' : JSON.stringify(value, null, 2)}
            </pre>
        </div>
    );
}

function DetailsRow({ order, colSpan }: Readonly<{ order: NgxOrder; colSpan: number }>) {
    const events = Array.isArray(order.events) ? order.events : [];
    return (
        <tr className="bg-slate-50/60">
            <td colSpan={colSpan} className="px-5 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <JsonBlock label="Saved request" value={order.request} />
                    <JsonBlock label="Latest response" value={order.response} />
                </div>
                <div className="mt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Event history ({events.length})</p>
                    {events.length === 0 ? (
                        <p className="text-sm text-slate-400">No events recorded.</p>
                    ) : (
                        <ol className="space-y-2">
                            {events.map((ev, i) => (
                                <li key={i} className="text-xs bg-white border border-slate-100 rounded-lg p-3 overflow-x-auto">
                                    <pre className="whitespace-pre-wrap break-words">{JSON.stringify(ev, null, 2)}</pre>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </td>
        </tr>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const COLUMNS = ['Transaction ID', 'Client Email', 'Product', 'Side', 'Order Qty', 'Price', 'Filled Qty', 'Executed Total', 'Status', 'Exchange Order ID', 'Created', 'Updated', 'Actions'];

export default function NgxExecutionReports() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<NgxOrder[]>([]);
    const [total, setTotal] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [checkingId, setCheckingId] = useState<string | null>(null);
    const [cancelTarget, setCancelTarget] = useState<NgxOrder | null>(null);
    const [cancelling, setCancelling] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await ngxService.list({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, status: status || undefined });
            if (res.status) {
                setOrders(res.data?.orders ?? []);
                setTotal(typeof res.data?.total === 'number' ? res.data.total : null);
            } else {
                toast.error(res.message || 'Failed to load execution reports');
                setOrders([]);
                setError(true);
            }
        } catch (err) {
            console.error('Error fetching NGX reports:', err);
            setError(true);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, status]);

    const runAction = async (action: 'check' | 'cancel', order: NgxOrder) => {
        try {
            const res = await ngxService.action({ action, transaction_id: order.transaction_id });
            if (res.status) {
                toast.success(res.message || (action === 'check' ? 'Status refreshed' : 'Cancellation requested'));
            } else {
                toast.error(res.message || `Failed to ${action} order`);
            }
            fetchOrders();
        } catch (err: any) {
            console.error(`NGX ${action} error:`, err);
            toast.error(err?.response?.data?.message || err?.response?.data?.[0]?.message || `Failed to ${action} order`);
        }
    };

    const handleCheck = async (order: NgxOrder) => {
        setCheckingId(order.transaction_id);
        await runAction('check', order);
        setCheckingId(null);
    };

    const confirmCancel = async () => {
        if (!cancelTarget) return;
        setCancelling(true);
        await runAction('cancel', cancelTarget);
        setCancelling(false);
        setCancelTarget(null);
    };

    const hasNext = total != null ? (page + 1) * PAGE_SIZE < total : orders.length === PAGE_SIZE;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">NGX Execution Reports</h1>
                    <p className="text-sm text-slate-500">Review, refresh and cancel exchange orders</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Tab Switcher */}
                    <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-xs border border-slate-200/60"
                        >
                            <CandlestickChart size={14} className="text-[#B8860B]" /> Execution Reports
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/ngx-fix-logs')}
                            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            <Terminal size={14} /> FIX Protocol Logs
                        </button>
                    </div>

                    <select
                        value={status}
                        onChange={(e) => { setPage(0); setStatus(e.target.value); }}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                    >
                        {STATUS_OPTIONS.map((s) => <option key={s || 'all'} value={s}>{s ? s.replace(/_/g, ' ') : 'All statuses'}</option>)}
                    </select>
                    <button type="button" onClick={fetchOrders} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60">
                        <RefreshCw size={15} className={cn(loading && 'animate-spin')} /> Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#B8860B]" size={40} />
                    <p className="text-slate-500 font-medium">Loading execution reports...</p>
                </div>
            ) : error ? (
                <div className="bg-white rounded-2xl border border-dashed border-red-200 py-16 text-center">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="text-red-500" size={24} /></div>
                    <h3 className="text-lg font-semibold text-slate-900">Couldn't load reports</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-5">The execution reports service returned an error. Please try again.</p>
                    <button type="button" onClick={fetchOrders} className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009]">Retry</button>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Info className="text-slate-400" size={24} /></div>
                    <h3 className="text-lg font-semibold text-slate-900">No execution reports</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">No orders match the current filter.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1300px] [&_th]:whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="w-8 px-2 py-3.5" />
                                    {COLUMNS.map((c) => (
                                        <th key={c} className={cn('px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider', c === 'Actions' && 'text-right')}>{c}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {orders.map((o) => {
                                    const isOpen = expanded === o.transaction_id;
                                    const checking = checkingId === o.transaction_id;
                                    return (
                                        <Fragment key={o.transaction_id}>
                                            <tr className="hover:bg-slate-50/60 transition-colors [&_td]:whitespace-nowrap">
                                                <td className="px-2 py-4 text-center">
                                                    <button type="button" onClick={() => setExpanded(isOpen ? null : o.transaction_id)}
                                                        className="p-1 rounded hover:bg-slate-100 text-slate-400" title="View details">
                                                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-4 text-sm font-mono text-slate-700">{o.transaction_id}</td>
                                                <td className="px-4 py-4 text-sm text-slate-600">{o.client_email || '—'}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-slate-700">{o.product_code || '—'}</td>
                                                <td className={cn('px-4 py-4 text-sm font-semibold uppercase', sideStyle(String(o.side || '')))}>{o.side || '—'}</td>
                                                <td className="px-4 py-4 text-sm text-slate-700">{num(o.order_quantity)}</td>
                                                <td className="px-4 py-4 text-sm text-slate-700">{money(o.price)}</td>
                                                <td className="px-4 py-4 text-sm text-slate-700">{num(o.filled_quantity)}</td>
                                                <td className="px-4 py-4 text-sm font-semibold text-slate-800">{money(o.executed_total)}</td>
                                                <td className="px-4 py-4">
                                                    <span className={cn('inline-block text-xs font-semibold px-2.5 py-1 rounded-full border capitalize', statusStyle(String(o.status || '')))}>
                                                        {String(o.status || 'unknown').replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm font-mono text-slate-500">{o.exchange_order_id || '—'}</td>
                                                <td className="px-4 py-4 text-sm text-slate-400">{formatDate(o.created_at)}</td>
                                                <td className="px-4 py-4 text-sm text-slate-400">{formatDate(o.updated_at)}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button type="button" onClick={() => handleCheck(o)} disabled={checking}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60">
                                                            {checking ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Check
                                                        </button>
                                                        {o.can_cancel && (
                                                            <button type="button" onClick={() => setCancelTarget(o)}
                                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-colors">
                                                                <Ban size={12} /> Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                            {isOpen && <DetailsRow order={o} colSpan={COLUMNS.length + 1} />}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                        <span className="text-sm text-slate-400">
                            Page {page + 1}{total != null ? ` · ${total.toLocaleString()} total` : ''}
                        </span>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button>
                            <span className="px-3 text-sm font-medium text-slate-600">{page + 1}</span>
                            <button type="button" onClick={() => setPage((p) => p + 1)} disabled={!hasNext}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            )}

            {cancelTarget && (
                <CancelModal order={cancelTarget} submitting={cancelling} onConfirm={confirmCancel} onCancel={() => !cancelling && setCancelTarget(null)} />
            )}
        </div>
    );
}
