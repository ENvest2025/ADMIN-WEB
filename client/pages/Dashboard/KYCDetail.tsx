import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dashboardService, FetchSingleClientResponse } from '@/lib/api/dashboardService';
import { toast } from 'sonner';

type KycTab = 'identity' | 'personal' | 'investment';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-400">{label}</span>
            <div className="h-12 px-4 flex items-center bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-800">
                {value || '—'}
            </div>
        </div>
    );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-base font-bold text-slate-900 mb-4">{children}</h3>
    );
}

// ─── Decline Modal ────────────────────────────────────────────────────────────

interface DeclineModalProps {
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    loading: boolean;
}

function DeclineModal({ onConfirm, onCancel, loading }: DeclineModalProps) {
    const [reason, setReason] = useState('');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
                <div className="w-12 h-12 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">⚠️</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Decline request ?</h2>
                <p className="text-sm text-slate-500 mb-5">
                    Are you sure you want to decline this request?
                </p>

                <div className="text-left mb-5">
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                        Reason for declining
                    </label>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder="type here"
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#B8860B] text-slate-800 placeholder:text-slate-300"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(reason)}
                        disabled={loading || !reason.trim()}
                        className="flex-1 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-medium hover:bg-[#9a7009] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Declining...' : 'Yes, decline'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Approve Modal ────────────────────────────────────────────────────────────

interface ApproveModalProps {
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}

function ApproveModal({ onConfirm, onCancel, loading }: ApproveModalProps) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
                <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">✅</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Approve request?</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Are you sure you want to approve this KYC request?
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Approving...' : 'Yes, approve'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Tab: Identity Verification ───────────────────────────────────────────────

function IdentityVerificationTab({ data }: { data: FetchSingleClientResponse['data'] }) {
    const { identity_verification: iv } = data;
    return (
        <div className="space-y-8">
            <div>
                <SectionTitle>Identity verification</SectionTitle>
                <FieldGrid>
                    <Field label="NIN" value={iv.nin} />
                    <Field label="BVN" value={iv.bvn} />
                </FieldGrid>
            </div>

            {iv.banks.length > 0 && (
                <div>
                    <SectionTitle>Bank details</SectionTitle>
                    <div className="space-y-4">
                        {iv.banks.map((bank, i) => (
                            <FieldGrid key={i}>
                                <Field label="Bank name" value={bank.bankName} />
                                <Field label="Account number" value={bank.accountNumber} />
                                <Field label="Account name" value={bank.accountName} />
                            </FieldGrid>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Tab: Personal Details ────────────────────────────────────────────────────

function PersonalDetailsTab({ data }: { data: FetchSingleClientResponse['data'] }) {
    const { personal_details: pd } = data;
    return (
        <div className="space-y-8">
            <div>
                <SectionTitle>Next of Kin</SectionTitle>
                <FieldGrid>
                    <Field label="Name of Next of kin" value={pd.nok_fname} />
                    <Field label="Next of kin last name" value={pd.nok_lname} />
                    <Field label="Next of kin phone number" value={pd.nok_phone} />
                    <Field label="Mothers maiden name" value={pd.mom_maiden} />
                </FieldGrid>
            </div>

            <div>
                <SectionTitle>Address</SectionTitle>
                <FieldGrid>
                    <div className="col-span-2">
                        <Field label="Residential address" value={pd.address} />
                    </div>
                    <Field label="State of residence" value={pd.state_residence} />
                    <Field label="State of origin" value={pd.state_origin} />
                    <Field label="Local government" value={pd.lga_origin} />
                </FieldGrid>
            </div>
        </div>
    );
}

// ─── Tab: Investment Profile ──────────────────────────────────────────────────

function InvestmentProfileTab({ data }: { data: FetchSingleClientResponse['data'] }) {
    const { investment_profile: ip } = data;
    return (
        <div className="space-y-8">
            <div>
                <SectionTitle>Step 1</SectionTitle>
                <FieldGrid>
                    <Field label="Investment Goals" value={ip.investment_goals} />
                    <Field label="Long term buy and hold investing" value={ip.long_term_holding} />
                    <Field label="Risk Tolerance" value={ip.risk_tolerance} />
                    <Field label="Experience" value={ip.experience} />
                </FieldGrid>
            </div>

            <div>
                <SectionTitle>Step 2</SectionTitle>
                <FieldGrid>
                    <Field label="Source of wealth" value={ip.source_of_wealth} />
                    <Field label="Liquid" value={ip.liquid} />
                    <Field label="Yearly income" value={ip.yearly_income} />
                    <Field label="Net worth" value={ip.net_worth} />
                </FieldGrid>
            </div>

            <div>
                <SectionTitle>Step 3</SectionTitle>
                <FieldGrid>
                    <Field
                        label="Are you affiliated with or employed by a U.S. broker-dealer or FINRA"
                        value={ip.affiliate}
                    />
                    <Field label="Job" value={ip.job} />
                </FieldGrid>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function KYCDetail() {
    const navigate = useNavigate();
    const { kycId } = useParams<{ kycId: string }>();

    const [activeTab, setActiveTab] = useState<KycTab>('identity');
    const [userData, setUserData] = useState<FetchSingleClientResponse['data'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDecline, setShowDecline] = useState(false);
    const [showApprove, setShowApprove] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!kycId) return;
            setLoading(true);
            try {
                const res = await dashboardService.fetchSingleClient({ id: kycId });
                if (res.status) setUserData(res.data);
            } catch {
                toast.error('Failed to load KYC details');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [kycId]);

    const handleDecline = async (reason: string) => {
        setActionLoading(true);
        try {
            await dashboardService.declineKyc({ id: kycId!, reason });
            toast.success('KYC request declined');
            setShowDecline(false);
            navigate('/dashboard/kyc');
        } catch {
            toast.error('Failed to decline KYC request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await dashboardService.approveKyc({ id: kycId! });
            toast.success('KYC request approved');
            setShowApprove(false);
            navigate('/dashboard/kyc');
        } catch {
            toast.error('Failed to approve KYC request');
        } finally {
            setActionLoading(false);
        }
    };

    const tabs: { key: KycTab; label: string }[] = [
        { key: 'identity', label: 'Identity verification' },
        { key: 'personal', label: 'Personal details' },
        { key: 'investment', label: 'Investment profile' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="text-center py-16 text-slate-500">KYC record not found</div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button
                    onClick={() => navigate('/dashboard/kyc')}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-slate-300">|</span>
                <button
                    onClick={() => navigate('/dashboard/kyc')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    KYC Management
                </button>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-slate-900 font-semibold">
                    {userData.basic_info.full_name}
                </span>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Card header: tabs + action buttons */}
                <div className="flex items-center justify-between px-8 pt-6 border-b border-slate-100">
                    <div className="flex gap-8">
                        {tabs.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={cn(
                                    'pb-4 text-sm font-medium relative transition-colors',
                                    activeTab === key
                                        ? 'text-[#B8860B]'
                                        : 'text-slate-500 hover:text-slate-900'
                                )}
                            >
                                {label}
                                {activeTab === key && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#B8860B]" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 pb-4">
                        <button
                            onClick={() => setShowDecline(true)}
                            className="px-6 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            onClick={() => setShowApprove(true)}
                            className="px-6 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors"
                        >
                            Approve
                        </button>
                    </div>
                </div>

                {/* Tab content */}
                <div className="p-8">
                    {activeTab === 'identity' && (
                        <IdentityVerificationTab data={userData} />
                    )}
                    {activeTab === 'personal' && (
                        <PersonalDetailsTab data={userData} />
                    )}
                    {activeTab === 'investment' && (
                        <InvestmentProfileTab data={userData} />
                    )}

                    {/* Next button (matches Figma) */}
                    <div className="flex justify-end mt-8">
                        <button
                            onClick={() => {
                                const idx = tabs.findIndex(t => t.key === activeTab);
                                if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].key);
                            }}
                            disabled={activeTab === 'investment'}
                            className="px-8 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-0"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showDecline && (
                <DeclineModal
                    onConfirm={handleDecline}
                    onCancel={() => setShowDecline(false)}
                    loading={actionLoading}
                />
            )}
            {showApprove && (
                <ApproveModal
                    onConfirm={handleApprove}
                    onCancel={() => setShowApprove(false)}
                    loading={actionLoading}
                />
            )}
        </div>
    );
}