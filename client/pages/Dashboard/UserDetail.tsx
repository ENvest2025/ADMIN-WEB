import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dashboardService, FetchSingleClientResponse } from '@/lib/api/dashboardService';
import { toast } from 'sonner';


type ModalType = 'suspend' | 'unsuspend' | 'delete' | null;
type TabType = 'applicant' | 'transactions' | 'investments';



const MOCK_TRANSACTIONS = [
    {
        date: 'Yesterday', items: [
            { type: 'withdrawal', label: 'Cash withdrawal', sub: 'Withdrawal made', amount: '-₦0.00' },
            { type: 'credit', label: 'Transfer received', sub: 'Transfer from Chia Ngue...', amount: '+₦0.00' },
        ]
    },
    {
        date: '25-Jul-2025', items: [
            { type: 'credit', label: 'Interest earned', sub: 'Dangote stock', amount: '+₦0.00' },
        ]
    },
    {
        date: '11-Jul-2025', items: [
            { type: 'withdrawal', label: 'Cash withdrawal', sub: 'Withdrawal made', amount: '-₦0.00' },
        ]
    },
    {
        date: '16-May-2025', items: [
            { type: 'credit', label: 'Interest earned', sub: 'Dangote stock', amount: '+₦0.00' },
            { type: 'credit', label: 'Interest earned', sub: 'Dangote stock', amount: '+₦0.00' },
            { type: 'credit', label: 'Interest earned', sub: 'Dangote stock', amount: '+₦0.00' },
        ]
    },
];

const MOCK_INVESTMENTS = {
    totalPortfolio: '₦1.2M',
    activeInvestments: 5,
    totalReturns: '₦1.2M',
    pendingMaturities: 2,
    breakdown: [
        { sn: 1, product: 'GoldenBridge Income Notes (GIN)', invested: '₦200,000', current: '₦210,000', status: 'Active', maturity: '12 May 2025' },
        { sn: 2, product: 'NGN Stocks', invested: '₦500,000', current: '₦600,000', status: 'Active', maturity: 'Ongoing' },
        { sn: 3, product: 'US Stocks', invested: '₦300,000', current: '₦330,000', status: 'Active', maturity: 'Ongoing' },
        { sn: 4, product: 'GoldenBridge Ethical Notes (GEN)', invested: '₦100,000', current: '₦120,000', status: 'Active', maturity: '12 May 2025' },
        { sn: 5, product: 'GoldenBridge Treasury Notes (GTN)', invested: '₦100,000', current: '₦140,000', status: 'Active', maturity: '12 May 2025' },
    ],
};

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-slate-100 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
                <span className="text-sm font-semibold text-slate-800">{title}</span>
                {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {open && <div className="px-5 pb-5 pt-1 border-t border-slate-100">{children}</div>}
        </div>
    );
}

function InfoGrid({ items }: { items: { label: string; value: string }[] }) {
    return (
        <div className="grid grid-cols-2 gap-4 pt-2">
            {items.map(({ label, value }) => (
                <div key={label}>
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <p className="text-sm font-semibold text-slate-900">{value}</p>
                </div>
            ))}
        </div>
    );
}

function ConfirmModal({ type, onConfirm, onCancel }: { type: ModalType; onConfirm: () => void; onCancel: () => void }) {
    if (!type) return null;
    const config = {
        suspend: { title: 'Suspend user?', message: 'Are you sure you want to suspend this user?', confirmText: 'Yes, suspend' },
        unsuspend: { title: 'Un-suspend user', message: 'Are you sure you want to un-suspend this user?', confirmText: 'Yes, un-suspend' },
        delete: { title: 'Delete account', message: 'Are you sure you want to delete this user?', confirmText: 'Yes, delete' },
    };
    const { title, message, confirmText } = config[type];
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
                <div className="w-12 h-12 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">⚠️</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
                <p className="text-sm text-slate-500 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-medium hover:bg-[#9a7009] transition-colors">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Tab: Applicant Details ───────────────────────────────────────────────────
interface ApplicantDetailsProps {
    data: FetchSingleClientResponse['data'];
}

function ApplicantDetails({ data }: ApplicantDetailsProps) {
    return (
        <div className="space-y-3">
            {/* Onboarding Info */}
            <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-sm font-semibold text-slate-800">Onboarding information</span>
                    <ChevronUp size={16} className="text-slate-400" />
                </div>
                <div className="px-5 pb-5 border-t border-slate-100">
                    <InfoGrid items={[
                        { label: 'First name', value: data.basic_info.first_name },
                        { label: 'Last name', value: data.basic_info.last_name },
                        { label: 'Phone Number', value: data.basic_info.phone },
                        { label: 'Email Address', value: data.basic_info.email },
                    ]} />
                </div>
            </div>
            <AccordionSection title="Identity Verification">
                <InfoGrid items={[
                    { label: 'NIN', value: data.identity_verification.nin },
                    { label: 'BVN', value: data.identity_verification.bvn },
                    { label: 'BVN Verified', value: data.identity_verification.bvn_verified ? 'Yes' : 'No' },
                    { label: 'NIN Verified', value: data.identity_verification.nin_verified ? 'Yes' : 'No' },
                ]} />
            </AccordionSection>
            <AccordionSection title="Bank details">
                {data.identity_verification.banks.map((bank, i) => (
                    <div key={i} className={i > 0 ? "mt-4 pt-4 border-t border-slate-50" : ""}>
                        <InfoGrid items={[
                            { label: 'Bank Name', value: bank.bankName },
                            { label: 'Account Number', value: bank.accountNumber },
                            { label: 'Account Name', value: bank.accountName },
                        ]} />
                    </div>
                ))}
            </AccordionSection>
            <AccordionSection title="Personal Details">
                <InfoGrid items={[
                    { label: 'Mother\'s Maiden Name', value: data.personal_details.mom_maiden },
                    { label: 'Next of Kin Name', value: `${data.personal_details.nok_fname} ${data.personal_details.nok_lname}` },
                    { label: 'Next of Kin Phone', value: data.personal_details.nok_phone },
                    { label: 'Address', value: data.personal_details.address },
                    { label: 'State of Residence', value: data.personal_details.state_residence },
                    { label: 'State of Origin', value: data.personal_details.state_origin },
                    { label: 'LGA of Origin', value: data.personal_details.lga_origin },
                ]} />
            </AccordionSection>
            <AccordionSection title="Investment Profile">
                <InfoGrid items={[
                    { label: 'Investment Goals', value: data.investment_profile.investment_goals },
                    { label: 'Experience', value: data.investment_profile.experience },
                    { label: 'Risk Tolerance', value: data.investment_profile.risk_tolerance },
                    { label: 'Source of Wealth', value: data.investment_profile.source_of_wealth },
                    { label: 'Liquid Assets', value: data.investment_profile.liquid },
                    { label: 'Yearly Income', value: data.investment_profile.yearly_income },
                    { label: 'Net Worth', value: data.investment_profile.net_worth },
                    { label: 'Job', value: data.investment_profile.job },
                ]} />
            </AccordionSection>
        </div>
    );
}

// ─── Tab: Transaction History ─────────────────────────────────────────────────
interface TransactionHistoryProps {
    transactions: {
        id: number;
        tnx_id: string;
        date: string;
        type: string;
        amount: string;
        currency: string;
    }[];
}

function TransactionHistory({ transactions }: TransactionHistoryProps) {
    // Group transactions by date
    const groups: { [key: string]: typeof transactions } = {};
    transactions.forEach(tx => {
        if (!groups[tx.date]) groups[tx.date] = [];
        groups[tx.date].push(tx);
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">All transaction history</h3>
                <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                    <Calendar size={16} />
                </button>
            </div>
            {Object.entries(groups).length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">No transaction history found</div>
            ) : (
                Object.entries(groups).map(([date, items]) => (
                    <div key={date} className="space-y-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{date}</p>
                        {items.map((tx, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center",
                                        tx.type?.toLowerCase() === 'credit' ? "bg-emerald-50" : "bg-red-50"
                                    )}>
                                        {tx.type?.toLowerCase() === 'credit'
                                            ? <TrendingDown size={14} className="text-emerald-500" />
                                            : <TrendingUp size={14} className="text-red-400" />
                                        }
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{tx.tnx_id}</p>
                                        <p className="text-xs text-slate-400">{tx.type}</p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "text-sm font-bold",
                                    tx.type?.toLowerCase() === 'credit' ? "text-emerald-500" : "text-red-400"
                                )}>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: tx.currency || 'NGN' }).format(parseFloat(tx.amount))}</span>
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}

// ─── Tab: Investments ─────────────────────────────────────────────────────────
interface InvestmentsProps {
    breakdown: {
        investment_id: number;
        product_name: string;
        amount_paid: number;
        current_value: number;
        roi_percentage: string;
        maturity_date: string;
        status: string;
        currency: string;
    }[];
}

function Investments({ breakdown }: InvestmentsProps) {
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency || 'NGN',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const totalInvested = breakdown.reduce((acc, curr) => acc + curr.amount_paid, 0);
    const totalCurrentValue = breakdown.reduce((acc, curr) => acc + curr.current_value, 0);
    const totalReturns = totalCurrentValue - totalInvested;

    return (
        <div className="space-y-5">
            {/* Overview stats */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Overview</h3>
                <div className="grid grid-cols-4 divide-x divide-slate-100">
                    {[
                        { label: 'Total Portfolio Value', value: formatCurrency(totalCurrentValue, breakdown[0]?.currency) },
                        { label: 'Active investments', value: breakdown.filter(i => i.status === 'active').length },
                        { label: 'Total Returns Earned', value: formatCurrency(totalReturns, breakdown[0]?.currency) },
                        { label: 'Pending Maturities', value: breakdown.filter(i => i.status === 'pending').length },
                    ].map(({ label, value }) => (
                        <div key={label} className="px-4 first:pl-0 last:pr-0">
                            <p className="text-xs text-slate-400 mb-1">{label}</p>
                            <p className="text-xl font-bold text-slate-900">{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Breakdown table */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-700">Investment Breakdown</h3>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-50">
                            {['S/N', 'Investment product', 'Amount Invested', 'Current Value', 'ROI', 'Maturity date'].map(col => (
                                <th key={col} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {breakdown.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">No investment data found</td>
                            </tr>
                        ) : (
                            breakdown.map((row, i) => (
                                <tr key={row.investment_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3.5 text-sm text-slate-400">{i + 1}</td>
                                    <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{row.product_name}</td>
                                    <td className="px-5 py-3.5 text-sm text-slate-600">{formatCurrency(row.amount_paid, row.currency)}</td>
                                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{formatCurrency(row.current_value, row.currency)}</td>
                                    <td className="px-5 py-3.5 text-sm text-slate-600">{row.roi_percentage}</td>
                                    <td className="px-5 py-3.5 text-sm text-slate-500 whitespace-nowrap">{row.maturity_date}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserDetail() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const [activeTab, setActiveTab] = useState<TabType>('applicant');
    const [userData, setUserData] = useState<FetchSingleClientResponse['data'] | null>(null);
    const [portfolioData, setPortfolioData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingPortfolio, setLoadingPortfolio] = useState(false);
    const [modal, setModal] = useState<ModalType>(null);
    const [actionsOpen, setActionsOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                const response = await dashboardService.fetchSingleClient({ id: userId });
                if (response.status) {
                    setUserData(response.data);
                }
            } catch (error) {
                console.error('Error fetching user detail:', error);
                toast.error('Failed to load user details');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    useEffect(() => {
        const fetchPortfolio = async () => {
            if (!userId || activeTab === 'applicant') return;
            setLoadingPortfolio(true);
            try {
                const response = await dashboardService.getSingleUserPortfolio({ userID: userId });
                if (response.status) {
                    setPortfolioData(response.data);
                }
            } catch (error) {
                console.error('Error fetching portfolio data:', error);
                toast.error('Failed to load portfolio details');
            } finally {
                setLoadingPortfolio(false);
            }
        };
        fetchPortfolio();
    }, [userId, activeTab]);

    const handleAction = (action: 'suspend' | 'unsuspend' | 'delete') => {
        setActionsOpen(false);
        setModal(action);
    };

    const handleConfirm = () => {
        toast.info(`Action ${modal} triggered`);
        setModal(null);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]">Loading...</div>;
    }

    if (!userData) {
        return <div className="text-center py-10">User not found</div>;
    }

    const tabs: { key: TabType; label: string }[] = [
        { key: 'applicant', label: 'Applicant details' },
        { key: 'transactions', label: 'Transaction history' },
        { key: 'investments', label: 'Investments' },
    ];

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button
                    onClick={() => navigate('/dashboard/users')}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={() => navigate('/dashboard/users')} className="text-slate-400 hover:text-slate-600 transition-colors">
                    User Management
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">{userData.basic_info.full_name}</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-100">
                {tabs.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={cn(
                            "px-4 pb-3 text-sm font-medium transition-all border-b-2 -mb-px",
                            activeTab === key
                                ? "border-[#B8860B] text-[#B8860B]"
                                : "border-transparent text-slate-400 hover:text-slate-700"
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Body */}
            <div className="flex gap-6">
                {/* Left: User Card */}
                <div className="w-64 shrink-0 space-y-4">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 ring-4 ring-slate-50 text-slate-400 text-2xl font-bold">
                            {userData.basic_info.full_name.charAt(0)}
                        </div>
                        <h2 className="text-sm font-bold text-slate-900">{userData.basic_info.full_name}</h2>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{userData.basic_info.clientID}</p>

                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-left">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Status</span>
                                <span className={cn(
                                    "text-xs font-bold flex items-center gap-1",
                                    userData.basic_info.account_status === 'Active' && "text-emerald-500",
                                    userData.basic_info.account_status === 'Suspended' && "text-yellow-600",
                                    userData.basic_info.account_status === 'Deactivated' && "text-red-500",
                                )}>
                                    <span className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        userData.basic_info.account_status === 'Active' && "bg-emerald-500",
                                        userData.basic_info.account_status === 'Suspended' && "bg-yellow-500",
                                        userData.basic_info.account_status === 'Deactivated' && "bg-red-500",
                                    )} />
                                    {userData.basic_info.account_status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Date joined</span>
                                <span className="text-xs font-semibold text-slate-700">{userData.basic_info.date_joined}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Last login</span>
                                <span className="text-xs font-semibold text-slate-700">{userData.basic_info.last_login}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions button */}
                    <div className="relative">
                        <button
                            onClick={() => setActionsOpen(!actionsOpen)}
                            className="w-full py-3 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors"
                        >
                            Actions
                        </button>
                        {actionsOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setActionsOpen(false)} />
                                <div className="absolute left-0 right-0 top-14 z-20 bg-white border border-slate-100 rounded-xl shadow-xl py-1 overflow-hidden">
                                    {[
                                        { label: 'Suspend user', action: 'suspend' as const },
                                        { label: 'Un-suspend user', action: 'unsuspend' as const },
                                        { label: 'Delete account', action: 'delete' as const, danger: true },
                                    ].map(({ label, action, danger }) => (
                                        <button
                                            key={action}
                                            onClick={() => handleAction(action)}
                                            className={cn(
                                                "w-full text-left px-4 py-2.5 text-sm transition-colors",
                                                danger ? "text-red-500 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"
                                            )}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Tab Content */}
                <div className="flex-1 min-w-0 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    {activeTab === 'applicant' && <ApplicantDetails data={userData} />}
                    {activeTab === 'transactions' && (
                        loadingPortfolio ? <div>Loading transactions...</div> : <TransactionHistory transactions={portfolioData?.transaction_history || []} />
                    )}
                    {activeTab === 'investments' && (
                        loadingPortfolio ? <div>Loading investments...</div> : <Investments breakdown={portfolioData?.investment_breakdown || []} />
                    )}
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <ConfirmModal
                    type={modal}
                    onConfirm={handleConfirm}
                    onCancel={() => setModal(null)}
                />
            )}
        </div>
    );
}
