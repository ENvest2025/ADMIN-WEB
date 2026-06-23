import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransactionHistory } from '@/hooks/useDashboard';
import { Transaction } from '@/lib/api/dashboardService';

export function TransactionHistory() {
    const { data: response, isLoading, isError } = useTransactionHistory({
        limit: 5,
        page: 1,
        start_date: "2025-01-01",
        end_date: "2026-12-31"
    });

    const transactions = response?.data?.transactions || [];

    // Group transactions by date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatAmount = (amount: string, tnxType: string) => {
        const numAmount = parseFloat(amount);
        const isDebit = tnxType === 'debit';
        return `${isDebit ? '-' : '+'}₦${numAmount.toLocaleString()}`;
    };

    return (
        <Card className="p-8 border-slate-100 shadow-sm rounded-3xl bg-white flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">Transaction History</h3>
                <button className="text-[#B8860B] text-sm font-bold flex items-center gap-1 hover:underline">
                    View all <ChevronRight size={16} />
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
            ) : isError ? (
                <div className="text-center py-8 text-slate-500">Failed to load transactions</div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No transactions found</div>
            ) : (
                <div className="space-y-6">
                    {transactions.map((tx: Transaction, index: number) => {
                        const isDebit = tx.tnx_type === 'debit';
                        const showDateHeader = index === 0 ||
                            formatDate(tx.created) !== formatDate(transactions[index - 1]?.created);

                        return (
                            <div key={tx.id}>
                                {showDateHeader && (
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                        {formatDate(tx.created)}
                                    </div>
                                )}
                                <div className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                            isDebit ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
                                        )}>
                                            {isDebit ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 text-sm">
                                                {tx.full_name || 'Unknown'}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {tx.tnx_descript || tx.payment_type || 'Transaction'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={cn(
                                            "font-bold text-sm",
                                            isDebit ? "text-red-500" : "text-green-500"
                                        )}>
                                            {formatAmount(tx.amount, tx.tnx_type)}
                                        </span>
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full",
                                            tx.status === 1 ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                                        )}>
                                            {tx.status === 1 ? 'Success' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

