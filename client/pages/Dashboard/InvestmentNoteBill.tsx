import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const MOCK_BILL = {
    title: 'GoldenBridge Treasury Notes (GTN) bill',
    transactionDetails: {
        amountInvested: '₦9,983.07',
        discountedRate: '14.00%',
        tenor: '80 days',
        settlementDate: '04 Aug 2025',
        maturityDate: '23 Oct 2025',
        effectiveYield: '14.44%',
        interest: '+316.02',
        faceValue: '₦10,299.10',
    },
    rollover: {
        dateRollover: '04 Aug 2025',
        amountRollover: '₦9,983.07',
        type: 'Invested capital and interest',
        maturityDate: '05 Sep 2025',
        tenor: '80 days',
    },
};

function DetailRow({ label, value, highlight, bold, dashed }: {
    label: string; value: string; highlight?: boolean; bold?: boolean; dashed?: boolean;
}) {
    return (
        <div className={`flex items-center justify-between py-3.5 ${dashed ? 'border-b border-dashed border-slate-100' : 'border-b border-slate-100'} last:border-0`}>
            <span className="text-sm text-slate-500">{label}</span>
            <span className={`text-sm ${bold ? 'font-bold text-slate-900 text-base' : 'text-slate-700'} ${highlight ? 'text-emerald-500 font-semibold' : ''}`}>
                {highlight ? `+${value.replace('+', '')}` : value}
            </span>
        </div>
    );
}

export default function InvestmentNoteBill() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 max-w-3xl">
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
                <span className="text-slate-900 font-semibold">{MOCK_BILL.title}</span>
            </div>

            <h1 className="text-xl font-bold text-slate-900">{MOCK_BILL.title}</h1>

            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Transaction Details */}
                <div className="p-6">
                    <h2 className="text-sm font-bold text-slate-800 mb-2">Transaction details</h2>
                    <div>
                        <DetailRow label="Amount Invested" value={MOCK_BILL.transactionDetails.amountInvested} dashed />
                        <DetailRow label="Discounted rate" value={MOCK_BILL.transactionDetails.discountedRate} dashed />
                        <DetailRow label="Tenor" value={MOCK_BILL.transactionDetails.tenor} dashed />
                        <DetailRow label="Settlement date" value={MOCK_BILL.transactionDetails.settlementDate} dashed />
                        <DetailRow label="Maturity date" value={MOCK_BILL.transactionDetails.maturityDate} dashed />
                        <DetailRow label="Effective yield" value={MOCK_BILL.transactionDetails.effectiveYield} dashed />
                        <DetailRow label="Interest" value={MOCK_BILL.transactionDetails.interest} highlight dashed />

                        {/* Face value separator */}
                        <div className="border-t-2 border-slate-100 mt-2 pt-2">
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-slate-500">Face value</span>
                                <span className="text-base font-bold text-slate-900">{MOCK_BILL.transactionDetails.faceValue}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rollover Section */}
                <div className="border-t border-slate-100 p-6">
                    <h2 className="text-sm font-bold text-slate-800 mb-2">Rollover</h2>
                    <div>
                        <DetailRow label="Date rollover" value={MOCK_BILL.rollover.dateRollover} dashed />
                        <DetailRow label="Amount rollover" value={MOCK_BILL.rollover.amountRollover} dashed />
                        <DetailRow label="Type" value={MOCK_BILL.rollover.type} dashed />
                        <DetailRow label="Maturity date" value={MOCK_BILL.rollover.maturityDate} dashed />
                        <DetailRow label="Tenor" value={MOCK_BILL.rollover.tenor} />
                    </div>
                </div>
            </div>
        </div>
    );
}