import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type TransactionType = 'Deposit' | 'Withdrawal' | 'Refund' | 'Charge back';
type TransactionStatus = 'Pending' | 'Approved' | 'Failed' | 'Reversed';

const MOCK_DETAIL = {
    transactionId: '0000000001',
    amount: '₦25,000,000',
    type: 'Deposit' as TransactionType,
    status: 'Pending' as TransactionStatus,
    channel: 'Transfer',
    dateCreated: '17 May 2025  12:00 PM',
    referenceNumber: '00001',
    initiatedBy: 'Cynthia',
    approvedBy: { name: 'John Micheal', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
    approvedDate: '17 May 2025  12:00 PM',
    userId: '00000001',
    accountNumber: '3108961020',
    linkedBank: 'First bank',
    kycStatus: 'Completed',
};

const TYPE_STYLES: Record<TransactionType, string> = {
    'Deposit': 'text-emerald-500',
    'Withdrawal': 'text-red-500',
    'Refund': 'text-blue-500',
    'Charge back': 'text-yellow-600',
};

const STATUS_STYLES: Record<TransactionStatus, string> = {
    'Pending': 'bg-slate-100 text-slate-600 border border-slate-200',
    'Approved': 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    'Failed': 'bg-red-50 text-red-600 border border-red-200',
    'Reversed': 'bg-orange-50 text-orange-600 border border-orange-200',
};

function ConfirmModal({ action, onConfirm, onCancel }: { action: 'approve' | 'decline'; onConfirm: () => void; onCancel: () => void }) {
    const isApprove = action === 'approve';
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4",
                    isApprove ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200")}>
                    <span className="text-xl">{isApprove ? '✅' : '⚠️'}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                    {isApprove ? 'Approve transaction?' : 'Decline transaction?'}
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                    {isApprove
                        ? 'Are you sure you want to approve this transaction?'
                        : 'Are you sure you want to decline this transaction?'}
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors",
                            isApprove ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600")}>
                        {isApprove ? 'Yes, approve' : 'Yes, decline'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function TransactionDetail() {
    const navigate = useNavigate();
    const { transactionId } = useParams();
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState<TransactionStatus>(MOCK_DETAIL.status);
    const [modal, setModal] = useState<'approve' | 'decline' | null>(null);

    const tx = { ...MOCK_DETAIL, transactionId: transactionId || MOCK_DETAIL.transactionId, status };

    const handleCopy = () => {
        navigator.clipboard.writeText(tx.transactionId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleConfirm = () => {
        if (modal === 'approve') setStatus('Approved');
        if (modal === 'decline') setStatus('Failed');
        setModal(null);
    };

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

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Transaction ID</p>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-900 font-mono">{tx.transactionId}</h1>
                        <button onClick={handleCopy}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                        </button>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                        <div>
                            <p className="text-xs text-slate-400 mb-0.5">Transaction amount</p>
                            <p className="text-base font-bold text-slate-900">{tx.amount}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div>
                            <p className="text-xs text-slate-400 mb-0.5">Transaction type</p>
                            <p className={cn("text-base font-bold", TYPE_STYLES[tx.type])}>{tx.type}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div>
                            <p className="text-xs text-slate-400 mb-0.5">Status</p>
                            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", STATUS_STYLES[tx.status])}>
                                {tx.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {tx.status === 'Pending' && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setModal('decline')}
                            className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
                            Decline
                        </button>
                        <button
                            onClick={() => setModal('approve')}
                            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors">
                            Approve
                        </button>
                    </div>
                )}
                {tx.status !== 'Pending' && (
                    <span className={cn("px-4 py-2 rounded-xl text-sm font-semibold border",
                        tx.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200")}>
                        {tx.status}
                    </span>
                )}
            </div>

            {/* Transaction Details Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-800">Transaction details</h2>
                </div>
                <div className="p-6 grid grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Transaction type</p>
                        <p className={cn("text-sm font-semibold", TYPE_STYLES[tx.type])}>{tx.type}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Date created/time</p>
                        <p className="text-sm font-semibold text-slate-800">{tx.dateCreated}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Channel</p>
                        <p className="text-sm font-semibold text-slate-800">{tx.channel}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Transaction reference number</p>
                        <p className="text-sm font-semibold text-slate-800">{tx.referenceNumber}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Initiated by</p>
                        <p className="text-sm font-semibold text-slate-800">{tx.initiatedBy}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-2">Approved by</p>
                        <div className="flex items-center gap-2">
                            <img src={tx.approvedBy.avatar} alt={tx.approvedBy.name}
                                className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-100" />
                            <p className="text-sm font-semibold text-slate-800">{tx.approvedBy.name}</p>
                        </div>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">Approved date and time</p>
                        <p className="text-sm font-semibold text-slate-800">{tx.approvedDate}</p>
                    </div>
                </div>
            </div>

            {/* Account Details Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-800">Account details</h2>
                </div>
                <div className="p-6 grid grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                        <p className="text-xs text-slate-400 mb-1">User ID</p>
                        <p className="text-sm font-semibold text-slate-800 font-mono">{tx.userId}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Account number</p>
                        <p className="text-sm font-semibold text-slate-800 font-mono">{tx.accountNumber}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Linked bank</p>
                        <p className="text-sm font-semibold text-slate-800">{tx.linkedBank}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">KYC status</p>
                        <span className="text-sm font-semibold text-emerald-500">{tx.kycStatus}</span>
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {modal && (
                <ConfirmModal
                    action={modal}
                    onConfirm={handleConfirm}
                    onCancel={() => setModal(null)}
                />
            )}
        </div>
    );
}