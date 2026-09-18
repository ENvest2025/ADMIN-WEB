import { useEffect, useMemo, useState } from 'react';
import { Loader2, Info, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { dashboardService, DeletionRequest } from '@/lib/api/dashboardService';

const PAGE_SIZE = 20;

const formatDate = (value: string | null) => {
    if (!value) return '—';
    const d = new Date(value.replace(' ', 'T'));
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export function DeletionRequests() {
    const [reqs, setReqs] = useState<DeletionRequest[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'pending' | 'completed'>('pending');
    const [page, setPage] = useState(1);
    const [target, setTarget] = useState<DeletionRequest | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchReqs = async () => {
        setLoading(true);
        try {
            const res = await dashboardService.accountDeletionRequests({ status, page, limit: PAGE_SIZE });
            if (res.status) {
                setReqs(res.data?.requests ?? []);
                setTotal(res.data?.total ?? 0);
            } else {
                toast.error(res.message || 'Failed to load deletion requests');
                setReqs([]);
                setTotal(0);
            }
        } catch (err) {
            console.error('Error fetching deletion requests:', err);
            toast.error('Failed to load deletion requests');
            setReqs([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReqs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, page]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

    const confirmDelete = async () => {
        if (!target) return;
        setSubmitting(true);
        try {
            const res = await dashboardService.deleteUser({
                id: target.clientID,
                reason: 'Approved account deletion request',
            });
            if (res.status) {
                toast.success(res.message || 'User archived and deleted');
                setTarget(null);
                fetchReqs();
            } else {
                toast.error(res.message || 'Failed to delete user');
            }
        } catch (err: any) {
            console.error('deleteUser error:', err);
            toast.error(err?.response?.data?.message || 'Failed to delete user');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Status filter */}
            <div className="flex items-center gap-3">
                <label className="text-sm text-slate-500 font-medium" htmlFor="del-status">Status</label>
                <select
                    id="del-status"
                    value={status}
                    onChange={(e) => { setPage(1); setStatus(e.target.value as 'pending' | 'completed'); }}
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-800">Account deletion requests</h2>
                    <span className="text-sm text-slate-400">{total.toLocaleString()} total</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                {['S/N', 'Client ID', 'Email', 'Reason', 'Requested', status === 'completed' ? 'Completed' : 'Status', 'Action'].map((c) => (
                                    <th key={c} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{c}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                                    <div className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16} /> Loading requests...</div>
                                </td></tr>
                            ) : reqs.length === 0 ? (
                                <tr><td colSpan={7} className="px-5 py-16 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <div className="bg-slate-50 w-14 h-14 rounded-full flex items-center justify-center"><Info size={22} /></div>
                                        <p className="font-medium text-slate-600">No {status} deletion requests</p>
                                    </div>
                                </td></tr>
                            ) : reqs.map((r, idx) => (
                                <tr key={r.request_id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="px-5 py-4 text-sm text-slate-400">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                    <td className="px-5 py-4 text-sm font-mono text-slate-600">{r.clientID}</td>
                                    <td className="px-5 py-4 text-sm text-slate-700">{r.email}</td>
                                    <td className="px-5 py-4 text-sm text-slate-600 max-w-[240px] truncate" title={r.reason}>{r.reason || '—'}</td>
                                    <td className="px-5 py-4 text-sm text-slate-400">{formatDate(r.requested_at)}</td>
                                    <td className="px-5 py-4 text-sm">
                                        {r.status === 'completed' ? (
                                            <div className="text-slate-500">
                                                <div>{formatDate(r.completed_at)}</div>
                                                <div className="text-xs text-slate-400">{r.completed_by || ''}</div>
                                            </div>
                                        ) : (
                                            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 capitalize">
                                                {r.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        {r.status === 'completed' ? (
                                            <span className="text-xs text-slate-400">Deleted</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setTarget(r)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                Delete user
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && total > 0 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                        <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 text-sm font-medium text-slate-600">{page}</span>
                            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete confirmation */}
            {target && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="text-red-500" size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1 text-center">Delete user?</h2>
                        <p className="text-sm text-slate-500 mb-5 text-center">
                            This permanently archives and deletes{' '}
                            <span className="font-semibold text-slate-700">{target.email}</span>{' '}
                            (<span className="font-mono">{target.clientID}</span>). This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => !submitting && setTarget(null)}
                                disabled={submitting}
                                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={submitting}
                                className={cn(
                                    'flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700'
                                )}
                            >
                                {submitting && <Loader2 size={14} className="animate-spin" />}
                                {submitting ? 'Deleting...' : 'Yes, delete user'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
