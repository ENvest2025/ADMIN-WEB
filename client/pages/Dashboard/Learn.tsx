import { useEffect, useState } from 'react';
import {
    Search, Eye, Pencil, Trash2, Loader2, Info, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { learningService } from '@/lib/api/learningService';
import { LearningEntry } from '@shared/api';

const PAGE_SIZE = 9;

const statusStyle = (s: string) =>
    (s || '').toLowerCase() === 'posted'
        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
        : 'bg-amber-50 text-amber-600 border-amber-200';

const formatDate = (value: string) => {
    if (!value) return '—';
    const d = new Date(value.replace(' ', 'T'));
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

// ─── Create / Edit modal ──────────────────────────────────────────────────────
function LearnFormModal({ mode, entry, onClose, onSaved }: Readonly<{ mode: 'create' | 'edit'; entry?: LearningEntry | null; onClose: () => void; onSaved: () => void }>) {
    const [topic, setTopic] = useState(entry?.topic || '');
    const [details, setDetails] = useState(entry?.details || '');
    const [status, setStatus] = useState<'posted' | 'pending'>(entry?.status === 'posted' ? 'posted' : 'pending');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!topic.trim()) { toast.error('Topic is required'); return; }
        if (!details.trim()) { toast.error('Details are required'); return; }
        setSaving(true);
        try {
            const res = mode === 'edit' && entry
                ? await learningService.editLearning({ id: entry.id, topic: topic.trim(), details: details.trim(), status })
                : await learningService.createLearning({ topic: topic.trim(), details: details.trim(), status });
            if (res.status) {
                toast.success(res.message || (mode === 'edit' ? 'Learning updated' : 'Learning created'));
                onSaved();
            } else {
                toast.error(res.message || 'Failed to save');
            }
        } catch (err: any) {
            console.error('save learning error:', err);
            toast.error(err?.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
                    <h2 className="text-lg font-bold text-slate-900">{mode === 'edit' ? 'Edit learning entry' : 'Create learning entry'}</h2>
                    <button type="button" onClick={onClose} disabled={saving} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-50"><X size={18} /></button>
                </div>
                <div className="p-5 space-y-4 overflow-y-auto">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">Topic</label>
                        <input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={255}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">Details</label>
                        <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={6}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 resize-none" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as 'posted' | 'pending')}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400">
                            <option value="posted">Posted</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center justify-between p-5 border-t border-slate-100 shrink-0">
                    <button type="button" onClick={onClose} disabled={saving}
                        className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                    <button type="button" onClick={handleSave} disabled={saving}
                        className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] disabled:opacity-60 flex items-center gap-2">
                        {saving && <Loader2 size={15} className="animate-spin" />}
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── View modal ───────────────────────────────────────────────────────────────
function ViewModal({ entry, onClose }: Readonly<{ entry: LearningEntry; onClose: () => void }>) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-start justify-between p-5 border-b border-slate-100 shrink-0 gap-3">
                    <h2 className="text-lg font-bold text-slate-900">{entry.topic}</h2>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 shrink-0"><X size={18} /></button>
                </div>
                <div className="p-5 overflow-y-auto space-y-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className={cn('font-semibold px-2.5 py-1 rounded-full border capitalize', statusStyle(entry.status))}>{entry.status}</span>
                        <span>Created {formatDate(entry.created)}</span>
                        <span>Edited {formatDate(entry.edited)}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.details}</p>
                </div>
            </div>
        </div>
    );
}

// ─── Delete modal ─────────────────────────────────────────────────────────────
function DeleteModal({ entry, deleting, onConfirm, onCancel }: Readonly<{ entry: LearningEntry; deleting: boolean; onConfirm: () => void; onCancel: () => void }>) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
                <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center mx-auto mb-4"><Trash2 className="text-red-500" size={20} /></div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Delete entry?</h2>
                <p className="text-sm text-slate-500 mb-6">Permanently delete <span className="font-semibold text-slate-700">{entry.topic}</span>? This cannot be undone.</p>
                <div className="flex gap-3">
                    <button type="button" onClick={onCancel} disabled={deleting} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                    <button type="button" onClick={onConfirm} disabled={deleting} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
                        {deleting && <Loader2 size={14} className="animate-spin" />}
                        {deleting ? 'Deleting...' : 'Yes, delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Learn() {
    const [entries, setEntries] = useState<LearningEntry[]>([]);
    const [filtered, setFiltered] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [status, setStatus] = useState<'' | 'posted' | 'pending'>('');

    const [showCreate, setShowCreate] = useState(false);
    const [viewing, setViewing] = useState<LearningEntry | null>(null);
    const [editing, setEditing] = useState<LearningEntry | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<LearningEntry | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const res = await learningService.fetchLearning({
                draw: 1,
                start: page * PAGE_SIZE,
                length: PAGE_SIZE,
                search: { value: searchTerm, regex: false },
                status,
                order: [{ column: 0, dir: 'desc' }],
            });
            if (res.status) {
                setEntries(res.data ?? []);
                setFiltered(res.recordsFiltered ?? 0);
            } else {
                toast.error(res.message || res.error || 'Failed to load learning');
                setEntries([]);
                setFiltered(0);
            }
        } catch (err) {
            console.error('Error fetching learning:', err);
            toast.error('Failed to load learning entries');
            setEntries([]);
            setFiltered(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, searchTerm, status]);

    const totalPages = Math.max(1, Math.ceil(filtered / PAGE_SIZE));

    const applySearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setSearchTerm(searchInput.trim());
    };

    const toggleStatus = async (entry: LearningEntry) => {
        setTogglingId(entry.id);
        try {
            const next = entry.status === 'posted' ? 'pending' : 'posted';
            const res = await learningService.editLearning({ id: entry.id, status: next });
            if (res.status) {
                toast.success(next === 'posted' ? 'Published' : 'Unpublished');
                fetchEntries();
            } else {
                toast.error(res.message || 'Failed to update status');
            }
        } catch (err: any) {
            console.error('toggle status error:', err);
            toast.error(err?.response?.data?.message || 'Failed to update status');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await learningService.deleteLearning(deleteTarget.id);
            if (res.status) {
                toast.success(res.message || 'Entry deleted');
                setDeleteTarget(null);
                fetchEntries();
            } else {
                toast.error(res.message || 'Failed to delete');
            }
        } catch (err: any) {
            console.error('deleteLearning error:', err);
            toast.error(err?.response?.data?.message || 'Failed to delete');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-xl font-bold text-slate-900">Learn</h1>
                <div className="flex items-center gap-3">
                <form onSubmit={applySearch} className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search topics..."
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 w-48 sm:w-64" />
                    </div>
                    <select value={status} onChange={(e) => { setPage(0); setStatus(e.target.value as '' | 'posted' | 'pending'); }}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400">
                        <option value="">All</option>
                        <option value="posted">Posted</option>
                        <option value="pending">Pending</option>
                    </select>
                </form>
                <button type="button" onClick={() => setShowCreate(true)}
                    className="px-5 py-2 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors whitespace-nowrap">
                    Add
                </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#B8860B]" size={40} />
                    <p className="text-slate-500 font-medium">Loading learn entries...</p>
                </div>
            ) : entries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Info className="text-slate-400" size={24} /></div>
                    <h3 className="text-lg font-semibold text-slate-900">No learn entries found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Nothing matches the current filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {entries.map((entry) => (
                        <div key={entry.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{entry.topic}</h3>
                                <span className={cn('shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize', statusStyle(entry.status))}>{entry.status}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3 flex-1">{entry.details}</p>
                            <p className="text-[11px] text-slate-400 mb-3">Created {formatDate(entry.created)}</p>
                            <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                                <button type="button" onClick={() => toggleStatus(entry)} disabled={togglingId === entry.id}
                                    className="flex-1 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                                    {togglingId === entry.id && <Loader2 size={12} className="animate-spin" />}
                                    {entry.status === 'posted' ? 'Unpublish' : 'Publish'}
                                </button>
                                <button type="button" onClick={() => setViewing(entry)} title="View" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"><Eye size={15} /></button>
                                <button type="button" onClick={() => setEditing(entry)} title="Edit" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-yellow-600 transition-colors"><Pencil size={15} /></button>
                                <button type="button" onClick={() => setDeleteTarget(entry)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filtered > 0 && (
                <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-slate-400">Page {page + 1} of {totalPages} · {filtered} total</span>
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button>
                        <span className="px-3 text-sm font-medium text-slate-600">{page + 1}</span>
                        <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page + 1 >= totalPages}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}

            {showCreate && <LearnFormModal mode="create" onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); setPage(0); fetchEntries(); }} />}
            {viewing && <ViewModal entry={viewing} onClose={() => setViewing(null)} />}
            {editing && <LearnFormModal mode="edit" entry={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); fetchEntries(); }} />}
            {deleteTarget && <DeleteModal entry={deleteTarget} deleting={deleting} onConfirm={handleDelete} onCancel={() => !deleting && setDeleteTarget(null)} />}
        </div>
    );
}
