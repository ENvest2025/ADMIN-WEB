import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterStep = 1 | 2;

// ─── Flow Based Analysis ──────────────────────────────────────────────────────
function FlowBasedAnalysis({ filters, setFilters }: { filters: any; setFilters: any }) {
    return (
        <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900">Flow based analysis</h2>

            {/* Flow */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Flow</p>
                {['Only inflows', 'Only outflows'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                            type="radio"
                            name="flow"
                            value={opt}
                            checked={filters.flow === opt}
                            onChange={() => setFilters({ ...filters, flow: opt })}
                            className="w-4 h-4 accent-yellow-500"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{opt}</span>
                    </label>
                ))}
            </div>

            {/* Both Flow */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Both Flow</p>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                        type="radio"
                        name="flow"
                        value="Inflow and outflows"
                        checked={filters.flow === 'Inflow and outflows'}
                        onChange={() => setFilters({ ...filters, flow: 'Inflow and outflows' })}
                        className="w-4 h-4 accent-yellow-500"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Inflow and outflows</span>
                </label>
            </div>

            {/* Flow vs flow */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">Flow vs flow</p>
                {['Inflow vs Inflow', 'Inflow vs outflow', 'Outflow vs Outflow'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                            type="radio"
                            name="flow"
                            value={opt}
                            checked={filters.flow === opt}
                            onChange={() => setFilters({ ...filters, flow: opt })}
                            className="w-4 h-4 accent-yellow-500"
                        />
                        <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{opt}</span>
                    </label>
                ))}
            </div>

            {/* By time period */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">By time period</p>
                <div className="flex gap-2">
                    {(['Monthly', 'Yearly'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setFilters({ ...filters, timePeriod: p })}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all border",
                                filters.timePeriod === p
                                    ? "bg-[#B8860B] text-white border-[#B8860B]"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* By date range */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">By date range</p>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="01 Jan 2025 - 10 Mar 2025"
                        value={filters.dateRange}
                        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-2.5 px-4 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-400"
                    />
                    <Calendar size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
            </div>

            {/* By Comparison */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">By Comparison</p>
                <div className="grid grid-cols-2 gap-3">
                    {['Month', 'Month', 'Year', 'Year'].map((label, i) => (
                        <div key={i} className="relative">
                            <select className="w-full appearance-none border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white">
                                <option>{label}</option>
                                {label === 'Month'
                                    ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m}>{m}</option>)
                                    : ['2023', '2024', '2025'].map(y => <option key={y}>{y}</option>)
                                }
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Transaction Attributes ───────────────────────────────────────────────────
function TransactionAttributes({ filters, setFilters }: { filters: any; setFilters: any }) {
    const toggleCheck = (key: string, value: string) => {
        const current: string[] = filters[key] || [];
        const updated = current.includes(value)
            ? current.filter((v: string) => v !== value)
            : [...current, value];
        setFilters({ ...filters, [key]: updated });
    };

    const CheckGroup = ({ label, field, options }: { label: string; field: string; options: string[] }) => (
        <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">{label}</p>
            {options.map((opt) => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={(filters[field] || []).includes(opt)}
                        onChange={() => toggleCheck(field, opt)}
                        className="w-4 h-4 rounded accent-yellow-500"
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{opt}</span>
                </label>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-900">Transaction attributes</h2>

            <CheckGroup label="By transaction type" field="txTypes"
                options={['All', 'Deposit', 'Withdrawal', 'Transfer', 'Fee', 'Interest']} />

            <CheckGroup label="By status" field="statuses"
                options={['All', 'Pending', 'Completed', 'Failed', 'Reversed']} />

            <CheckGroup label="By channel" field="channels"
                options={['All', 'Bank transfer', 'Card payment', 'Mobile money', 'Wallet']} />

            {/* Amount range */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">By amount range</p>
                <input
                    type="text"
                    placeholder="₦25,000,000 - ₦25,000,000"
                    value={filters.amountRange || ''}
                    onChange={(e) => setFilters({ ...filters, amountRange: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-400"
                />
            </div>

            {/* By time period */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">By time period</p>
                <div className="flex gap-2">
                    {(['Monthly', 'Yearly'] as const).map((p) => (
                        <button key={p}
                            onClick={() => setFilters({ ...filters, attrTimePeriod: p })}
                            className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all border",
                                filters.attrTimePeriod === p
                                    ? "bg-[#B8860B] text-white border-[#B8860B]"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                            )}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* By date range */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">By date range</p>
                <div className="relative">
                    <input type="text" placeholder="01 Jan 2025 - 10 Mar 2025"
                        value={filters.attrDateRange || ''}
                        onChange={(e) => setFilters({ ...filters, attrDateRange: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl py-2.5 px-4 pr-10 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-400" />
                    <Calendar size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
            </div>

            {/* By Comparison */}
            <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">By Comparison</p>
                <div className="grid grid-cols-2 gap-3">
                    {['Month', 'Month', 'Year', 'Year'].map((label, i) => (
                        <div key={i} className="relative">
                            <select className="w-full appearance-none border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white">
                                <option>{label}</option>
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▾</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TransactionFilter() {
    const navigate = useNavigate();
    const [step, setStep] = useState<FilterStep>(1);
    const [filters, setFilters] = useState({
        flow: 'Only inflows',
        timePeriod: 'Monthly',
        dateRange: '01 Jan 2025 - 10 Mar 2025',
        txTypes: [] as string[],
        statuses: [] as string[],
        channels: [] as string[],
        amountRange: '',
        attrTimePeriod: 'Monthly',
        attrDateRange: '01 Jan 2025 - 10 Mar 2025',
    });

    const handleClear = () => {
        setFilters({
            flow: '',
            timePeriod: 'Monthly',
            dateRange: '',
            txTypes: [],
            statuses: [],
            channels: [],
            amountRange: '',
            attrTimePeriod: 'Monthly',
            attrDateRange: '',
        });
    };

    const handleApply = () => {
        navigate('/dashboard/transactions');
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
                <button onClick={() => navigate('/dashboard/transactions')} className="text-slate-400 hover:text-slate-600 transition-colors">
                    Transactions
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">Filter</span>
            </div>

            <h1 className="text-xl font-bold text-slate-900">Filter</h1>

            {/* Filter Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex">
                    {/* Sidebar Steps */}
                    <div className="w-56 shrink-0 bg-slate-50 border-r border-slate-100 p-5 space-y-3">
                        {[
                            { step: 1 as FilterStep, label: 'Flow based analysis' },
                            { step: 2 as FilterStep, label: 'Transaction attributes' },
                        ].map(({ step: s, label }) => (
                            <button
                                key={s}
                                onClick={() => setStep(s)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                                    step === s ? "bg-white shadow-sm" : "hover:bg-slate-100"
                                )}
                            >
                                <span className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                    step === s ? "bg-[#B8860B] text-white" : "bg-slate-200 text-slate-500"
                                )}>
                                    {s}
                                </span>
                                <span className={cn(
                                    "text-sm font-medium",
                                    step === s ? "text-slate-900" : "text-slate-400"
                                )}>
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                        {step === 1
                            ? <FlowBasedAnalysis filters={filters} setFilters={setFilters} />
                            : <TransactionAttributes filters={filters} setFilters={setFilters} />
                        }

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                            <button onClick={handleClear}
                                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                Clear filter
                            </button>
                            <div className="flex gap-3">
                                {step === 2 && (
                                    <button onClick={() => setStep(1)}
                                        className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                        Back
                                    </button>
                                )}
                                {step === 1 ? (
                                    <button onClick={() => setStep(2)}
                                        className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors">
                                        Next
                                    </button>
                                ) : (
                                    <button onClick={handleApply}
                                        className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors">
                                        Apply filter
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}