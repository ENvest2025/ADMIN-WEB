import { Fragment, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Loader2,
    Info,
    AlertTriangle,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    ArrowDownLeft,
    ArrowUpRight,
    Copy,
    Check,
    Lock,
    Terminal,
    FileText,
    Search,
    CandlestickChart,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ngxService } from '@/lib/api/ngxService';
import { FixMessage, FixTagField, NgxFixLogEntry } from '@shared/api';

const DEFAULT_LIMIT = 50;
const CREDENTIAL_TAGS = new Set(['553', '554', '925']);

const levelStyle = (lvl: string) => {
    const v = (lvl || '').toUpperCase();
    if (v === 'INFO') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (v === 'WARN' || v === 'WARNING') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (v === 'ERROR' || v === 'FATAL') return 'bg-red-50 text-red-700 border-red-200';
    if (v === 'DEBUG') return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
};

const formatTimestamp = (ts?: string) => {
    if (!ts) return '—';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
};

function CopyButton({ text, label = 'Copy' }: Readonly<{ text: string; label?: string }>) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success(`${label} copied to clipboard`);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
            title="Copy to clipboard"
        >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : label}</span>
        </button>
    );
}

// ─── Tag Table for FIX Message ───────────────────────────────────────────────
function FixTagTable({ fields }: Readonly<{ fields: FixTagField[] }>) {
    if (!fields || fields.length === 0) {
        return <p className="text-xs text-slate-400 italic">No tag fields decoded.</p>;
    }

    return (
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
            <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                        <th className="px-3.5 py-2.5 w-24">Tag</th>
                        <th className="px-3.5 py-2.5">Tag Name</th>
                        <th className="px-3.5 py-2.5">Value</th>
                        <th className="px-3.5 py-2.5">Meaning</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                    {fields.map((f, idx) => {
                        const isCredential = CREDENTIAL_TAGS.has(String(f.tag));
                        return (
                            <tr
                                key={`${f.tag}-${idx}`}
                                className={cn(
                                    'hover:bg-slate-50/70 transition-colors',
                                    isCredential && 'bg-amber-50/40'
                                )}
                            >
                                <td className="px-3.5 py-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                                        {f.tag}
                                        {isCredential && (
                                            <span title="Masked credential tag">
                                                <Lock size={10} className="text-amber-600" />
                                            </span>
                                        )}
                                    </span>
                                </td>
                                <td className="px-3.5 py-2 font-medium text-slate-700 whitespace-nowrap">
                                    {f.name || '—'}
                                </td>
                                <td className="px-3.5 py-2 font-mono break-all">
                                    {isCredential ? (
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100/70 border border-amber-300 text-amber-900 font-mono text-[11px] font-semibold">
                                            <Lock size={11} className="text-amber-700" />
                                            {f.value || '***'}
                                            <span className="text-[10px] text-amber-700 font-sans uppercase tracking-wider">(Masked)</span>
                                        </span>
                                    ) : (
                                        <span className="text-slate-900 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                            {f.value || '—'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-3.5 py-2">
                                    {f.meaning ? (
                                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {f.meaning}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">—</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Individual FIX Message Card ─────────────────────────────────────────────
function FixMessageCard({ message, index }: Readonly<{ message: FixMessage; index: number }>) {
    const isInbound = (message.direction || '').toLowerCase().includes('in');

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
            {/* Header: direction badge & copy action */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        FIX Message #{index + 1}
                    </span>
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border',
                            isInbound
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        )}
                    >
                        {isInbound ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                        {message.direction ? message.direction.toUpperCase() : 'EXCHANGE'}
                    </span>
                </div>
                {message.raw && <CopyButton text={message.raw} label="Copy FIX" />}
            </div>

            {/* Raw FIX string */}
            {message.raw && (
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Raw Protocol Message
                    </p>
                    <pre className="text-xs bg-slate-900 text-emerald-400 rounded-lg p-3 font-mono overflow-x-auto whitespace-pre-wrap break-all border border-slate-800">
                        {message.raw}
                    </pre>
                </div>
            )}

            {/* Decoded Tags Table */}
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Decoded Tag Table ({message.fields?.length ?? 0} fields)
                </p>
                <FixTagTable fields={message.fields} />
            </div>
        </div>
    );
}

// ─── Expanded Row Detail Drawer ──────────────────────────────────────────────
function LogDetailDrawer({ entry, colSpan }: Readonly<{ entry: NgxFixLogEntry; colSpan: number }>) {
    const fixMessages = Array.isArray(entry.fix_messages) ? entry.fix_messages : [];
    const fieldsEntries = entry.fields ? Object.entries(entry.fields) : [];

    return (
        <tr className="bg-slate-50/70 border-b border-slate-200">
            <td colSpan={colSpan} className="px-6 py-5">
                <div className="space-y-5 max-w-7xl">
                    {/* Log File & Metadata banner */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 text-slate-600">
                            <FileText size={15} className="text-[#B8860B]" />
                            <span className="font-semibold text-slate-800">Source File:</span>
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                {entry.file || '—'}
                            </span>
                        </div>
                        {entry.fields?.std && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <span className="font-semibold text-slate-700">Standard:</span>
                                <span className="font-mono text-slate-600">{entry.fields.std}</span>
                            </div>
                        )}
                        <div className="text-slate-400">
                            Masked tags: <span className="font-mono font-medium text-slate-600">553 (User), 554 (Pass), 925 (NewPass)</span>
                        </div>
                    </div>

                    {/* Parsed Fields Grid */}
                    {fieldsEntries.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                Structured Log Fields
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                {fieldsEntries.map(([k, v]) => (
                                    <div key={k} className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs">
                                        <p className="font-mono text-[11px] text-slate-400 uppercase truncate">{k}</p>
                                        <p className="font-mono font-semibold text-slate-800 truncate" title={String(v)}>
                                            {String(v)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Raw Log Line */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                Raw Log Line
                            </p>
                            {entry.raw && <CopyButton text={entry.raw} label="Copy Log Line" />}
                        </div>
                        <pre className="text-xs bg-slate-950 text-slate-200 rounded-xl p-3.5 font-mono overflow-x-auto whitespace-pre-wrap break-all border border-slate-800 max-h-48 leading-relaxed">
                            {entry.raw || '—'}
                        </pre>
                    </div>

                    {/* FIX Messages */}
                    <div className="space-y-3 pt-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal size={16} className="text-[#B8860B]" />
                                <h4 className="text-sm font-bold text-slate-900">
                                    FIX Exchange Messages ({fixMessages.length})
                                </h4>
                            </div>
                            <span className="text-xs text-slate-400">
                                Inspect raw protocol frames and decoded tag dictionaries
                            </span>
                        </div>

                        {fixMessages.length === 0 ? (
                            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
                                No raw FIX protocol frames attached to this log entry.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {fixMessages.map((msg, i) => (
                                    <FixMessageCard key={i} message={msg} index={i} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function NgxFixLogs() {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<NgxFixLogEntry[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [limit, setLimit] = useState<number>(DEFAULT_LIMIT);
    const [offset, setOffset] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Filters
    const [levelFilter, setLevelFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Expanded row: track index or unique timestamp
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await ngxService.getFixLogs({
                limit,
                offset,
                level: levelFilter || undefined,
                search: searchQuery.trim() || undefined,
                date: dateFilter || undefined,
            });

            // Normalize in case response is wrapped in an array
            const normalized = Array.isArray(res) ? res[0] : res;
            if (normalized?.status !== false) {
                const data = normalized?.data;
                setEntries(Array.isArray(data?.entries) ? data.entries : []);
                setTotal(typeof data?.total === 'number' ? data.total : (data?.entries?.length ?? 0));
                if (typeof data?.limit === 'number') setLimit(data.limit);
                if (typeof data?.offset === 'number') setOffset(data.offset);
            } else {
                toast.error(normalized?.message || 'Failed to fetch NGX FIX logs');
                setEntries([]);
                setError(true);
            }
        } catch (err) {
            console.error('Error fetching NGX FIX logs:', err);
            setError(true);
            setEntries([]);
            toast.error('Unable to reach NGX FIX log service');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit, offset, levelFilter, dateFilter]);

    // Handle search submission
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setOffset(0);
        fetchLogs();
    };

    // Pagination calculations
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const hasPrev = offset > 0;
    const hasNext = offset + limit < total;

    const handlePrev = () => {
        if (!hasPrev) return;
        setOffset((prev) => Math.max(0, prev - limit));
        setExpandedRow(null);
    };

    const handleNext = () => {
        if (!hasNext) return;
        setOffset((prev) => prev + limit);
        setExpandedRow(null);
    };

    // Client-side quick filter fallback if search was typed without submitting
    const displayedEntries = useMemo(() => {
        return entries;
    }, [entries]);

    return (
        <div className="space-y-6">
            {/* Header with Navigation Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">NGX Exchange Operations</h1>
                    <p className="text-sm text-slate-500">
                        Monitor execution reports and low-level FIX session message protocol logs
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/ngx-reports')}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <CandlestickChart size={14} /> Execution Reports
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 shadow-xs border border-slate-200/60"
                    >
                        <Terminal size={14} className="text-[#B8860B]" /> FIX Protocol Logs
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] max-w-md relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search event, summary, tag..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#B8860B] bg-white"
                    />
                </form>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Level Filter */}
                    <select
                        value={levelFilter}
                        onChange={(e) => {
                            setOffset(0);
                            setLevelFilter(e.target.value);
                        }}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                    >
                        <option value="">All Levels</option>
                        <option value="INFO">INFO</option>
                        <option value="WARN">WARN</option>
                        <option value="ERROR">ERROR</option>
                        <option value="DEBUG">DEBUG</option>
                    </select>

                    {/* Date Filter */}
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => {
                            setOffset(0);
                            setDateFilter(e.target.value);
                        }}
                        className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                    />

                    {/* Refresh */}
                    <button
                        type="button"
                        onClick={() => fetchLogs()}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
                    <Loader2 className="animate-spin text-[#B8860B]" size={36} />
                    <p className="text-slate-500 font-medium text-sm">Fetching NGX FIX protocol logs...</p>
                </div>
            ) : error ? (
                <div className="bg-white rounded-2xl border border-dashed border-red-200 py-16 text-center shadow-xs">
                    <div className="bg-red-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-red-500" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Couldn't Load FIX Logs</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
                        The FIX protocol log service returned an unexpected response or is unreachable.
                    </p>
                    <button
                        type="button"
                        onClick={() => fetchLogs()}
                        className="px-5 py-2 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : displayedEntries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center shadow-xs">
                    <div className="bg-slate-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Info className="text-slate-400" size={24} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">No FIX Logs Found</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        No log entries matched the given filters or offset criteria.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="w-10 px-3 py-3.5 text-center" />
                                    <th className="px-4 py-3.5 whitespace-nowrap">Timestamp</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">Level</th>
                                    <th className="px-4 py-3.5 whitespace-nowrap">Event</th>
                                    <th className="px-4 py-3.5">Summary</th>
                                    <th className="px-4 py-3.5 text-right whitespace-nowrap">FIX Messages</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayedEntries.map((entry, idx) => {
                                    const isOpen = expandedRow === idx;
                                    const fixCount = entry.fix_messages?.length ?? 0;

                                    return (
                                        <Fragment key={`${entry.timestamp}-${idx}`}>
                                            <tr
                                                onClick={() => setExpandedRow(isOpen ? null : idx)}
                                                className={cn(
                                                    'hover:bg-slate-50/70 transition-colors cursor-pointer select-none',
                                                    isOpen && 'bg-slate-50/40'
                                                )}
                                            >
                                                {/* Toggle Chevron */}
                                                <td className="px-3 py-4 text-center">
                                                    <button
                                                        type="button"
                                                        aria-label="Toggle details"
                                                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                                                    >
                                                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                    </button>
                                                </td>

                                                {/* Timestamp */}
                                                <td className="px-4 py-4 text-sm font-mono text-slate-700 whitespace-nowrap">
                                                    {formatTimestamp(entry.timestamp)}
                                                </td>

                                                {/* Level */}
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span
                                                        className={cn(
                                                            'inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border',
                                                            levelStyle(entry.level)
                                                        )}
                                                    >
                                                        {entry.level || 'INFO'}
                                                    </span>
                                                </td>

                                                {/* Event */}
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                                                        {entry.event || '—'}
                                                    </span>
                                                </td>

                                                {/* Summary */}
                                                <td className="px-4 py-4 text-sm text-slate-700 min-w-[280px]">
                                                    <p className="line-clamp-2">{entry.summary || '—'}</p>
                                                </td>

                                                {/* FIX Message Count Pill */}
                                                <td className="px-4 py-4 text-right whitespace-nowrap">
                                                    <span
                                                        className={cn(
                                                            'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border',
                                                            fixCount > 0
                                                                ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
                                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                                        )}
                                                    >
                                                        <Terminal size={12} />
                                                        {fixCount} {fixCount === 1 ? 'msg' : 'msgs'}
                                                    </span>
                                                </td>
                                            </tr>

                                            {/* Details Drawer */}
                                            {isOpen && <LogDetailDrawer entry={entry} colSpan={6} />}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 bg-slate-50/50">
                        <div className="text-xs text-slate-500">
                            Showing <span className="font-semibold text-slate-700">{total > 0 ? offset + 1 : 0}</span> to{' '}
                            <span className="font-semibold text-slate-700">{Math.min(offset + limit, total)}</span> of{' '}
                            <span className="font-semibold text-slate-700">{total.toLocaleString()}</span> entries (newest first)
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Page size selector */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <span>Rows:</span>
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setOffset(0);
                                        setExpandedRow(null);
                                    }}
                                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none"
                                >
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>

                            {/* Page navigation */}
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={handlePrev}
                                    disabled={!hasPrev}
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                    title="Previous page"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="px-3 text-xs font-semibold text-slate-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!hasNext}
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                    title="Next page"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
