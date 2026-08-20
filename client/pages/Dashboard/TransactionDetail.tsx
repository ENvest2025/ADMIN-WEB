import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Loader2, Info, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { dashboardService, TransactionDetailData } from '@/lib/api/dashboardService';

const currencySymbol = (currency: string) => {
    switch ((currency || '').toUpperCase()) {
        case 'USD': return '$';
        case 'NGN': return '₦';
        default: return `${currency} `;
    }
};

const formatAmount = (currency: string, amount: number | string) => {
    const num = typeof amount === 'number' ? amount : parseFloat(String(amount || '0')) || 0;
    return `${currencySymbol(currency)}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value: string) => {
    if (!value) return '—';
    const d = new Date(value.replace(' ', 'T'));
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
};

const statusStyle = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('success')) return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
    if (s.includes('fail')) return 'bg-red-50 text-red-600 border border-red-200';
    if (s.includes('pending') || s.includes('process')) return 'bg-amber-50 text-amber-600 border border-amber-200';
    if (s.includes('revers')) return 'bg-orange-50 text-orange-600 border border-orange-200';
    return 'bg-slate-100 text-slate-600 border border-slate-200';
};

function Field({ label, value, className }: Readonly<{ label: string; value: React.ReactNode; className?: string }>) {
    return (
        <div className={className}>
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="text-sm font-semibold text-slate-800 break-words">{value || '—'}</p>
        </div>
    );
}

export default function TransactionDetail() {
    const navigate = useNavigate();
    const { transactionId } = useParams();
    const [copied, setCopied] = useState(false);
    const [tx, setTx] = useState<TransactionDetailData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!transactionId) return;
            setLoading(true);
            try {
                const res = await dashboardService.fetchTransactionDetail(transactionId);
                if (res.status) {
                    setTx(res.data);
                } else {
                    toast.error(res.message || 'Failed to load transaction');
                    setTx(null);
                }
            } catch (err) {
                console.error('Error fetching transaction:', err);
                toast.error('Failed to load transaction');
                setTx(null);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [transactionId]);

    const txId = tx?.['transaction ID'] || transactionId || '';

    const handleCopy = () => {
        navigator.clipboard.writeText(txId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isReceived = (tx?.direction || '').toLowerCase() === 'received' || tx?.sent === false;

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button onClick={() => navigate('/dashboard/transactions')}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={() => navigate('/dashboard/transactions')}
                    className="text-slate-400 hover:text-slate-600 transition-colors">
                    Transactions
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">Transaction detail</span>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-[#B8860B]" size={40} />
                    <p className="text-slate-500 font-medium">Loading transaction...</p>
                </div>
            ) : !tx ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="text-slate-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Transaction not found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        We couldn't find details for this transaction.
                    </p>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Transaction ID</p>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-mono break-all">{txId}</h1>
                                <button onClick={handleCopy}
                                    className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">Amount</p>
                                    <p className="text-base font-bold text-slate-900">{formatAmount(tx.currency, tx.amount)}</p>
                                </div>
                                <div className="w-px h-8 bg-slate-200" />
                                <div>
                                    <p className="text-xs text-slate-400 mb-0.5">Direction</p>
                                    <p className={cn("text-base font-bold flex items-center gap-1 capitalize",
                                        isReceived ? "text-emerald-500" : "text-red-500")}>
                                        {isReceived ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                        {tx.direction || (isReceived ? 'Received' : 'Sent')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <span className={cn("px-3 py-1.5 rounded-full text-xs font-semibold capitalize shrink-0", statusStyle(tx.status))}>
                            {tx.status || 'Unknown'}
                        </span>
                    </div>

                    {/* Transaction Details Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-800">Transaction details</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                            <Field label="Amount" value={formatAmount(tx.currency, tx.amount)} />
                            <Field label="Currency" value={tx.currency} />
                            <Field label="Date / time" value={formatDate(tx.date)} />
                            <Field label="Method" value={<span className="capitalize">{tx.method}</span>} />
                            <Field label="Fees" value={formatAmount(tx.currency, tx.fees)} />
                            <Field label="Status" value={<span className="capitalize">{tx.status}</span>} />
                        </div>
                    </div>

                    {/* Parties Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-800">Sender & receiver</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                            <Field label="Sender" value={tx.sender} />
                            <Field label="Receiver" value={tx.receiver} />
                            <Field label="User email" value={tx.user_email} />
                            <Field label="Description" value={tx.description} className="sm:col-span-2" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
