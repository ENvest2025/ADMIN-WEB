import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_TX = {
    type: 'Deposit',
    datetime: '05 Feb 2025, 11:00 AM',
    amount: '-₦0.00',
    status: 'Successful',
    isCredit: true,
    details: {
        youSent: '₦0.00',
        ourFee: '₦0.00',
        weConverted: '₦0.00',
        exchangeRate: '0.000',
        date: '05 Feb 2025',
        time: '11:00 AM',
        transactionId: '000000001',
    },
    receiver: {
        recipientName: 'Chia Cynthia Nguevese',
        bankName: 'First bank',
        accountNumber: '3108961020',
    },
};

function DetailRow({ label, value, bold, green }: { label: string; value: string; bold?: boolean; green?: boolean }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-dashed border-slate-100 last:border-0">
            <span className="text-sm text-slate-500">{label}</span>
            <span className={cn("text-sm", bold ? "font-bold text-slate-900" : "text-slate-700", green && "text-emerald-500 font-semibold")}>
                {value}
            </span>
        </div>
    );
}

export default function PortfolioTransactionDetail() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={() => navigate('/dashboard/portfolio')} className="text-slate-400 hover:text-slate-600">
                    Portfolio management
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">Transaction detail</span>
            </div>

            <h1 className="text-xl font-bold text-slate-900">Transaction detail</h1>

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Transaction Header Row */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                            MOCK_TX.isCredit ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                        )}>
                            {MOCK_TX.isCredit ? '+' : '-'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{MOCK_TX.type}</p>
                            <p className="text-xs text-slate-400">{MOCK_TX.datetime}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{MOCK_TX.amount}</p>
                        <p className={cn("text-xs font-medium",
                            MOCK_TX.status === 'Successful' ? "text-emerald-500" : "text-red-500"
                        )}>
                            {MOCK_TX.status}
                        </p>
                    </div>
                </div>

                {/* Two-column detail */}
                <div className="grid grid-cols-2 divide-x divide-slate-100 p-6 gap-6">
                    {/* Transaction Details */}
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 mb-4">Transaction details</h2>
                        <div>
                            <DetailRow label="You sent" value={MOCK_TX.details.youSent} />
                            <DetailRow label="Our fee" value={MOCK_TX.details.ourFee} />
                            <DetailRow label="We converted" value={MOCK_TX.details.weConverted} />
                            <DetailRow label="Exchange rate" value={MOCK_TX.details.exchangeRate} />
                            <div className="my-2" />
                            <DetailRow label="Date" value={MOCK_TX.details.date} />
                            <DetailRow label="Time" value={MOCK_TX.details.time} />
                            <div className="my-2" />
                            <DetailRow label="Transaction Number/ID" value={MOCK_TX.details.transactionId} />
                        </div>
                    </div>

                    {/* Receiver's Details */}
                    <div className="pl-6">
                        <h2 className="text-sm font-bold text-slate-800 mb-4">Receiver's bank account details</h2>
                        <div>
                            <DetailRow label="Recipient name" value={MOCK_TX.receiver.recipientName} bold />
                            <DetailRow label="Bank name" value={MOCK_TX.receiver.bankName} bold />
                            <DetailRow label="Account number" value={MOCK_TX.receiver.accountNumber} bold />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}