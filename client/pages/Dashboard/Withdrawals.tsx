import { useState, useEffect, useMemo } from 'react';
import {
    Eye,
    Wallet,
    Clock,
    CheckCircle2,
    BarChart3,
    Check,
    X,
    Ban,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { withdrawalsService } from '@/lib/api/withdrawalsService';
import { WithdrawalRequest } from '@shared/api';

const PAGE_SIZE = 10;

// status: 0 = pending, 1 = approved, 2 = failed, 4 = cancelled
const STATUS_PILL: Record<number, string> = {
    0: 'bg-slate-100 text-slate-600 border border-slate-200',
    1: 'text-emerald-500',
    2: 'text-red-500',
    4: 'text-orange-500',
};

const STATUS_LABELS: Record<number, string> = {
    0: 'Pending',
    1: 'Approved',
    2: 'Failed',
    4: 'Cancelled',
};

type ActionKind = 'approve' | 'fail' | 'cancel';

const ACTION_STATUS: Record<ActionKind, number> = {
    approve: 1,
    fail: 2,
    cancel: 4,
};

const ACTION_COPY: Record<ActionKind, { title: string; body: string; confirm: string; btn: string }> = {
    approve: {
        title: 'Approve withdrawal?',
        body: 'This will mark the request as approved and send the money to the user’s bank account. This action cannot be undone.',
        confirm: 'Yes, approve & pay',
        btn: 'bg-emerald-600 hover:bg-emerald-700',
    },
    fail: {
        title: 'Mark withdrawal as failed?',
        body: 'This flags the withdrawal as failed. No money will be sent to the user.',
        confirm: 'Yes, mark failed',
        btn: 'bg-red-600 hover:bg-red-700',
    },
    cancel: {
        title: 'Cancel withdrawal?',
        body: 'This cancels the withdrawal request. No money will be sent to the user.',
        confirm: 'Yes, cancel',
        btn: 'bg-orange-600 hover:bg-orange-700',
    },
};

const formatAmount = (currency: string, value: string | number) => {
    const num = typeof value === 'number' ? value : parseFloat(value || '0');
    const symbol = currency === 'USD' ? '$' : '₦';
    return `${symbol}${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

const formatDate = (value: string) => {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

function StatCard({ icon: Icon, label, value, accent }: Readonly<{ icon: any; label: string; value: string; accent?: boolean }>) {
    return (
        <div className={cn(
            'bg-white rounded-2xl p-5 border flex-1',
            accent ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-white' : 'border-slate-100'
        )}>
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <div className={cn('p-2 rounded-xl', accent ? 'bg-yellow-100' : 'bg-slate-100')}>
                    <Icon size={14} className={accent ? 'text-yellow-600' : 'text-slate-500'} />
                </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

// ─── Bank Details Modal ───────────────────────────────────────────────────────
function DetailsModal({ item, onClose }: Readonly<{ item: WithdrawalRequest; onClose: () => void }>) {
    const d = item.withdrawal_details || ({} as WithdrawalRequest['withdrawal_details']);
    const rows: [string, string][] = [
        ['Transaction ID', item.tnxId],
        ['Account name', d.accountName || d.names || '—'],
        ['Bank', d.bankName || '—'],
        ['Account number', d.accountNumber || '—'],
        ['Amount', formatAmount(item.currency, d.amount ?? item.amount)],
        ['Transaction fee', formatAmount(item.currency, d.transactionFee ?? 0)],
        ['Total amount', formatAmount(item.currency, d.totalAmount ?? item.amount)],
        ['Duration', d.duration || '—'],
        ['Requested', formatDate(item.created)],
    ];
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Withdrawal details</h2>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                        <X size={18} />
                    </button>
                </div>
                <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                    {rows.map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3">
                            <span className="text-slate-500 shrink-0">{label}</span>
                            <span className="font-medium text-slate-800 text-right break-all">{value}</span>
                        </div>
                    ))}
                    <div className="flex justify-between gap-3 pt-2 border-t border-slate-200">
                        <span className="text-slate-500 shrink-0">Status</span>
                        <span className={cn('font-semibold', STATUS_PILL[item.status] || 'text-slate-600')}>
                            {item.status_message || STATUS_LABELS[item.status] || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Action Confirm Modal ─────────────────────────────────────────────────────
function ConfirmModal({
    item,
    action,
    submitting,
    onConfirm,
    onCancel,
}: Readonly<{
    item: WithdrawalRequest;
    action: ActionKind;
    submitting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}>) {
    const copy = ACTION_COPY[action];
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <h2 className="text-lg font-bold text-slate-900 mb-1">{copy.title}</h2>
                <p className="text-sm text-slate-500 mb-4">{copy.body}</p>
                <div className="rounded-xl bg-slate-50 p-3 text-sm mb-5 space-y-1.5">
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500">User</span>
                        <span className="font-medium text-slate-800 text-right truncate">{item.withdrawal_details?.names || item.email}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Amount</span>
                        <span className="font-semibold text-slate-800">{formatAmount(item.currency, item.amount)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Transaction</span>
                        <span className="font-mono text-slate-700 text-right truncate">{item.tnxId}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={submitting}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
                        Go back
                    </button>
                    <button onClick={onConfirm} disabled={submitting}
                        className={cn('flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2', copy.btn)}>
                        {submitting && <Loader2 size={14} className="animate-spin" />}
                        {submitting ? 'Processing...' : copy.confirm}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Withdrawals() {
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const [details, setDetails] = useState<WithdrawalRequest | null>(null);
    const [confirm, setConfirm] = useState<{ item: WithdrawalRequest; action: ActionKind } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const response = await withdrawalsService.fetchAllWithdrawalRequests();
            if (response.status) {
                setWithdrawals(response.data ?? []);
            } else {
                toast.error(response.message || 'Failed to load withdrawals');
                setWithdrawals([]);
            }
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
            toast.error('Failed to load withdrawals');
            setWithdrawals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const stats = useMemo(() => {
        let pending = 0;
        let approved = 0;
        let totalAmount = 0;
        withdrawals.forEach((w) => {
            if (w.status === 0) pending += 1;
            if (w.status === 1) approved += 1;
            totalAmount += parseFloat(w.amount || '0') || 0;
        });
        return { total: withdrawals.length, pending, approved, totalAmount };
    }, [withdrawals]);

    const totalPages = Math.max(1, Math.ceil(withdrawals.length / PAGE_SIZE));
    const pageItems = useMemo(
        () => withdrawals.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        [withdrawals, page]
    );

    const submitAction = async () => {
        if (!confirm) return;
        setSubmitting(true);
        try {
            const response = await withdrawalsService.updateWithdrawalStatus({
                tnxId: confirm.item.tnxId,
                status: ACTION_STATUS[confirm.action],
            });
            if (response.status) {
                toast.success(response.message || 'Withdrawal updated');
                setConfirm(null);
                fetchWithdrawals();
            } else {
                toast.error(response.message || 'Action failed');
            }
        } catch (err: any) {
            console.error('updateWithdrawalStatus error:', err);
            toast.error(err?.response?.data?.message || 'Action failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="flex flex-col sm:flex-row gap-4">
                <StatCard icon={Wallet} label="Total Requests" value={stats.total.toLocaleString()} accent />
                <StatCard icon={Clock} label="Pending" value={stats.pending.toLocaleString()} />
                <StatCard icon={CheckCircle2} label="Approved" value={stats.approved.toLocaleString()} />
                <StatCard icon={BarChart3} label="Total Amount" value={`₦${stats.totalAmount.toLocaleString()}`} />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-800">Withdrawal Requests</h2>
                    <span className="text-sm text-slate-400">{stats.total} total</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-slate-50">
                                {['S/N', 'Transaction ID', 'User Name', 'Bank', 'Amount', 'Status', 'Date request', 'Action'].map((col) => (
                                    <th key={col} className="px-4 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin" size={16} />
                                            Loading withdrawals...
                                        </div>
                                    </td>
                                </tr>
                            ) : pageItems.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                                        No withdrawal requests found
                                    </td>
                                </tr>
                            ) : pageItems.map((w, idx) => {
                                const isPending = w.status === 0;
                                return (
                                    <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-4 py-4 text-sm text-slate-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                        <td className="px-4 py-4 text-sm font-mono text-slate-600 whitespace-nowrap">{w.tnxId}</td>
                                        <td className="px-4 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
                                            {w.withdrawal_details?.names || w.email}
                                            <div className="text-xs font-normal text-slate-400">{w.email}</div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                                            {w.withdrawal_details?.bankName || '—'}
                                            <div className="text-xs text-slate-400">{w.withdrawal_details?.accountNumber}</div>
                                        </td>
                                        <td className="px-4 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">{formatAmount(w.currency, w.amount)}</td>
                                        <td className="px-4 py-4">
                                            {w.status === 0 ? (
                                                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', STATUS_PILL[w.status])}>
                                                    {w.status_message || STATUS_LABELS[w.status]}
                                                </span>
                                            ) : (
                                                <span className={cn('text-sm font-semibold', STATUS_PILL[w.status] || 'text-slate-500')}>
                                                    {w.status_message || STATUS_LABELS[w.status] || 'Unknown'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-slate-400 whitespace-nowrap">{formatDate(w.created)}</td>
                                        <td className="px-4 py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        title="Actions"
                                                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem onClick={() => setDetails(w)}>
                                                        <Eye size={15} className="mr-2 text-slate-500" />
                                                        View details
                                                    </DropdownMenuItem>
                                                    {isPending && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => setConfirm({ item: w, action: 'approve' })}
                                                                className="text-emerald-600 focus:text-emerald-700">
                                                                <Check size={15} className="mr-2" />
                                                                Approve &amp; pay
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => setConfirm({ item: w, action: 'fail' })}
                                                                className="text-red-600 focus:text-red-700">
                                                                <X size={15} className="mr-2" />
                                                                Mark failed
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => setConfirm({ item: w, action: 'cancel' })}
                                                                className="text-orange-600 focus:text-orange-700">
                                                                <Ban size={15} className="mr-2" />
                                                                Cancel
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && withdrawals.length > 0 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                        <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 text-sm font-medium text-slate-600">{page}</span>
                            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {details && <DetailsModal item={details} onClose={() => setDetails(null)} />}
            {confirm && (
                <ConfirmModal
                    item={confirm.item}
                    action={confirm.action}
                    submitting={submitting}
                    onConfirm={submitAction}
                    onCancel={() => !submitting && setConfirm(null)}
                />
            )}
        </div>
    );
}
