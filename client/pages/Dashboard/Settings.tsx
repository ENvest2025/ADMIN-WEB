import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

type SettingsTab = 'General' | 'Investment Product' | 'Transactions & Wallet' | 'Security' | 'Notification';

// ─── Reusable Components ──────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0",
                checked ? "bg-[#B8860B]" : "bg-slate-200"
            )}
        >
            <span className={cn(
                "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                checked ? "translate-x-5" : "translate-x-0"
            )} />
        </button>
    );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
            <span className="text-sm text-slate-700">{label}</span>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
}

function FormInput({ label, placeholder, value, onChange }: {
    label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600">{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300 bg-white"
            />
        </div>
    );
}

function SaveButton({ onClick }: { onClick: () => void }) {
    return (
        <button onClick={onClick}
            className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors">
            Save changes
        </button>
    );
}

// ─── General Settings ─────────────────────────────────────────────────────────
function GeneralSettings() {
    const [timezone, setTimezone] = useState('GMT');
    const [dateFormat, setDateFormat] = useState<'dd/mm/yyyy' | 'mm/dd/yyyy'>('mm/dd/yyyy');
    const [sessionTimeout, setSessionTimeout] = useState('5:00 Mins');
    const [showTerms, setShowTerms] = useState(true);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-slate-800">General settings</h2>
                <SaveButton onClick={() => {}} />
            </div>

            {/* Logo */}
            <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                <div className="w-16 h-16 bg-[#B8860B]/20 rounded-xl flex items-center justify-center overflow-hidden">
                    {logoPreview
                        ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        : <span className="text-[#B8860B] font-bold text-lg">EnVest</span>
                    }
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setLogoPreview(null)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                        Remove
                    </button>
                    <button onClick={() => logoInputRef.current?.click()}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                        Upload
                    </button>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) setLogoPreview(URL.createObjectURL(f)); }} />
                </div>
            </div>

            {/* Time zone & Date format */}
            <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Time zone</label>
                    <div className="relative">
                        <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                            className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white pr-10">
                            {['GMT', 'GMT+1', 'GMT+2', 'GMT+3', 'WAT', 'CAT', 'EAT', 'UTC'].map(tz => (
                                <option key={tz}>{tz}</option>
                            ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Date format</label>
                    <div className="flex gap-4 pt-2">
                        {(['dd/mm/yyyy', 'mm/dd/yyyy'] as const).map((fmt) => (
                            <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="dateFormat" value={fmt} checked={dateFormat === fmt}
                                    onChange={() => setDateFormat(fmt)} className="w-4 h-4 accent-yellow-500" />
                                <span className="text-sm text-slate-600">{fmt}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Session timeout & Terms toggle */}
            <div className="grid grid-cols-2 gap-5 items-start">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Session timeout</label>
                    <div className="relative">
                        <select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}
                            className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white pr-10">
                            {['5:00 Mins', '10:00 Mins', '15:00 Mins', '30:00 Mins', '60:00 Mins'].map(t => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-7">
                    <span className="text-sm text-slate-700">Show Terms & Policy on signup</span>
                    <Toggle checked={showTerms} onChange={setShowTerms} />
                </div>
            </div>
        </div>
    );
}

// ─── Investment Product Settings ──────────────────────────────────────────────
function InvestmentProductSettings() {
    const [fractional, setFractional] = useState(true);
    const [manualApproval, setManualApproval] = useState(true);
    const [amounts, setAmounts] = useState<Record<string, string>>({});
    const update = (k: string, v: string) => setAmounts(prev => ({ ...prev, [k]: v }));

    const fields = [
        { key: 'wallet', label: 'Minimum amount to deposit to wallet' },
        { key: 'ngn', label: 'Minimum investment amount NGN Stocks' },
        { key: 'us', label: 'Minimum investment amount US Stocks' },
        { key: 'gin', label: 'GoldenBridge Income Notes (GIN)' },
        { key: 'gen', label: 'GoldenBridge Ethical Notes (GEN)' },
        { key: 'edu', label: 'GoldenBridge Educational Notes (GEN)' },
        { key: 'gdn', label: 'GoldenBridge Dollar Notes (GDN)' },
        { key: 'gtn', label: 'GoldenBridge Treasury Notes (GTN)' },
    ];

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-slate-800">Investment Product settings</h2>
                <SaveButton onClick={() => {}} />
            </div>
            <ToggleRow label="Enable fractional investing" checked={fractional} onChange={setFractional} />
            <ToggleRow label="Allow manual product approvals" checked={manualApproval} onChange={setManualApproval} />
            <div className="grid grid-cols-2 gap-4 pt-2">
                {fields.map(({ key, label }) => (
                    <FormInput key={key} label={label} placeholder="Enter amount"
                        value={amounts[key] || ''} onChange={(v) => update(key, v)} />
                ))}
            </div>
        </div>
    );
}

// ─── Transactions & Wallet Settings ──────────────────────────────────────────
function TransactionsWalletSettings() {
    const [deposits, setDeposits] = useState(true);
    const [withdrawals, setWithdrawals] = useState(true);
    const [withdrawalVerify, setWithdrawalVerify] = useState(true);
    const [manualApproval, setManualApproval] = useState(true);
    const [depositMethods, setDepositMethods] = useState({ transfer: false, card: false, walletCrypto: false });
    const [withdrawalFee, setWithdrawalFee] = useState('');
    const [fxSpread, setFxSpread] = useState('');

    const toggleMethod = (key: keyof typeof depositMethods) => {
        setDepositMethods(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-slate-800">Transactions & Wallet settings</h2>
                <SaveButton onClick={() => {}} />
            </div>
            <ToggleRow label="Enable deposits" checked={deposits} onChange={setDeposits} />
            <ToggleRow label="Enable withdrawals" checked={withdrawals} onChange={setWithdrawals} />
            <ToggleRow label="Withdrawal verification required" checked={withdrawalVerify} onChange={setWithdrawalVerify} />
            <ToggleRow label="Manual approval on high-value transactions" checked={manualApproval} onChange={setManualApproval} />

            <div className="pt-2 space-y-2">
                <p className="text-sm font-medium text-slate-600 mb-3">Deposit methods</p>
                {[
                    { key: 'transfer' as const, label: 'Transfer' },
                    { key: 'card' as const, label: 'Card' },
                    { key: 'walletCrypto' as const, label: 'Wallet/Crypto' },
                ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer py-1">
                        <input type="checkbox" checked={depositMethods[key]}
                            onChange={() => toggleMethod(key)}
                            className="w-4 h-4 rounded accent-yellow-500" />
                        <span className="text-sm text-slate-600">{label}</span>
                    </label>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
                <FormInput label="Withdrawal fee" placeholder="Enter amount" value={withdrawalFee} onChange={setWithdrawalFee} />
                <FormInput label="FX conversion spread" placeholder="Enter amount" value={fxSpread} onChange={setFxSpread} />
            </div>
        </div>
    );
}

// ─── Security Settings ────────────────────────────────────────────────────────
function SecuritySettings() {
    const [force2fa, setForce2fa] = useState(true);
    const [loginAlerts, setLoginAlerts] = useState(true);
    const [sessionTimeout, setSessionTimeout] = useState('15 mins');
    const [lockAfter, setLockAfter] = useState('0 attempt');

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-slate-800">Security settings</h2>
                <SaveButton onClick={() => {}} />
            </div>
            <ToggleRow label="Force 2FA" checked={force2fa} onChange={setForce2fa} />
            <ToggleRow label="Receive Login Alerts (Get notified when a login happens from new device)" checked={loginAlerts} onChange={setLoginAlerts} />
            <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Session Timeout</label>
                    <input type="text" placeholder="15 mins" value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white placeholder:text-slate-300" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-600">Lock After Failed Logins</label>
                    <div className="relative">
                        <select value={lockAfter} onChange={(e) => setLockAfter(e.target.value)}
                            className="w-full appearance-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white pr-10">
                            {['0 attempt', '3 attempts', '5 attempts', '10 attempts'].map(a => (
                                <option key={a}>{a}</option>
                            ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Notification Settings ────────────────────────────────────────────────────
function NotificationSettings() {
    const [systemEmails, setSystemEmails] = useState(true);
    const [smsAlerts, setSmsAlerts] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [alerts, setAlerts] = useState({ deposit: false, withdrawal: false, kyc: false });

    const toggleAlert = (key: keyof typeof alerts) => setAlerts(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-slate-800">Notification settings</h2>
                <SaveButton onClick={() => {}} />
            </div>
            <ToggleRow label="Send system emails" checked={systemEmails} onChange={setSystemEmails} />
            <ToggleRow label="Send SMS alerts" checked={smsAlerts} onChange={setSmsAlerts} />
            <ToggleRow label="Send push notifications" checked={pushNotifs} onChange={setPushNotifs} />

            <div className="pt-2 space-y-2">
                <p className="text-sm font-medium text-slate-600 mb-3">Select which alerts to send</p>
                {[
                    { key: 'deposit' as const, label: 'Deposit' },
                    { key: 'withdrawal' as const, label: 'Withdrawal' },
                    { key: 'kyc' as const, label: 'KYC' },
                ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer py-1">
                        <input type="checkbox" checked={alerts[key]} onChange={() => toggleAlert(key)}
                            className="w-4 h-4 rounded accent-yellow-500" />
                        <span className="text-sm text-slate-600">{label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
const TABS: SettingsTab[] = ['General', 'Investment Product', 'Transactions & Wallet', 'Security', 'Notification'];

export default function Settings() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('General');

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold text-slate-900">Settings</h1>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex min-h-[500px]">
                    {/* Sidebar */}
                    <div className="w-56 shrink-0 border-r border-slate-100 py-4 px-3 space-y-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                    activeTab === tab
                                        ? "bg-yellow-50 text-[#B8860B] font-semibold"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {activeTab === 'General' && <GeneralSettings />}
                        {activeTab === 'Investment Product' && <InvestmentProductSettings />}
                        {activeTab === 'Transactions & Wallet' && <TransactionsWalletSettings />}
                        {activeTab === 'Security' && <SecuritySettings />}
                        {activeTab === 'Notification' && <NotificationSettings />}
                    </div>
                </div>
            </div>
        </div>
    );
}