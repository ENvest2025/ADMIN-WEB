import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;

function FormInput({ label, placeholder, value, onChange, type = 'text' }: {
    label: string; placeholder: string; value: string;
    onChange: (v: string) => void; type?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300 bg-white"
            />
        </div>
    );
}

function FormTextarea({ label, placeholder, value, onChange }: {
    label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <textarea
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300 bg-white resize-none"
            />
        </div>
    );
}

function UploadBox({ label, hint = 'SVG, PNG, JPG or GIF (max. 800x400px)' }: { label: string; hint?: string }) {
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        const url = URL.createObjectURL(file);
        setPreview(url);
    };

    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/30 transition-all"
            >
                {preview ? (
                    <img src={preview} alt="Preview" className="max-h-24 object-contain rounded-lg" />
                ) : (
                    <>
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            <Upload size={18} className="text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500">
                            <span className="text-[#B8860B] font-semibold cursor-pointer hover:underline">Click to upload</span>
                            {' '}or drag and drop
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{hint}</p>
                    </>
                )}
                <input ref={inputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
        </div>
    );
}

// ─── Step 1: Basic Information ─────────────────────────────────────────────
function BasicInformationStep({ data, setData }: { data: any; setData: (d: any) => void }) {
    const update = (key: string, val: string) => setData({ ...data, [key]: val });
    return (
        <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Company name" placeholder="eg: Access Holdings" value={data.companyName} onChange={(v) => update('companyName', v)} />
                <FormInput label="Symbol" placeholder="enter symbol eg : ACCESSCORP" value={data.symbol} onChange={(v) => update('symbol', v)} />
            </div>
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Market type</label>
                <div className="flex gap-3 p-3 border border-slate-200 rounded-xl bg-white">
                    {['NGN', 'US'].map((mt) => (
                        <label key={mt} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="marketType" value={mt} checked={data.marketType === mt}
                                onChange={() => update('marketType', mt)} className="w-4 h-4 accent-yellow-500" />
                            <span className="text-sm font-medium text-slate-700">{mt}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Open Price" placeholder="enter open price" value={data.openPrice} onChange={(v) => update('openPrice', v)} />
                <div />
                <FormInput label="Today's high" placeholder="enter today's high" value={data.todayHigh} onChange={(v) => update('todayHigh', v)} />
                <FormInput label="Today's low" placeholder="enter today's low" value={data.todayLow} onChange={(v) => update('todayLow', v)} />
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Sector/ Industry</label>
                    <select value={data.sector} onChange={(e) => update('sector', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white">
                        <option value="">Select sector</option>
                        {['Banking', 'Finance', 'Manufacturing', 'Industrials', 'Technology', 'Healthcare'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
                <FormInput label="CEO" placeholder="enter CEO's name" value={data.ceo} onChange={(v) => update('ceo', v)} />
                <FormInput label="Date source" placeholder="enter data source" value={data.dateSource} onChange={(v) => update('dateSource', v)} />
                <FormInput label="Price updated" placeholder="eg: 4 Oct 2025" value={data.priceUpdated} onChange={(v) => update('priceUpdated', v)} />
            </div>
         <FormTextarea
  label="About"
  placeholder="Type here e.g. Access Bank Plc is one of Africa's leading financial institutions"
  value={data.about}
  onChange={(v) => update('about', v)}
/>
            <UploadBox label="Upload company logo" />
        </div>
    );
}

// ─── Step 2: Financials ────────────────────────────────────────────────────
function FinancialsStep({ data, setData }: { data: any; setData: (d: any) => void }) {
    const update = (key: string, val: string) => setData({ ...data, [key]: val });
    return (
        <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Financials</h2>
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Open Price" placeholder="enter open price" value={data.openPrice} onChange={(v) => update('openPrice', v)} />
                <FormInput label="Today's Price" placeholder="enter today's  price" value={data.todayPrice} onChange={(v) => update('todayPrice', v)} />
                <FormInput label="Today's high price" placeholder="enter high price" value={data.todayHighPrice} onChange={(v) => update('todayHighPrice', v)} />
                <FormInput label="Today's low price" placeholder="enter low price" value={data.todayLowPrice} onChange={(v) => update('todayLowPrice', v)} />
                <FormInput label="52-week high" placeholder="enter high price" value={data.week52High} onChange={(v) => update('week52High', v)} />
                <FormInput label="52-week low" placeholder="enter low price" value={data.week52Low} onChange={(v) => update('week52Low', v)} />
                <FormInput label="Div/yield" placeholder="enter high price" value={data.divYield} onChange={(v) => update('divYield', v)} />
                <FormInput label="Volume" placeholder="enter low price" value={data.volume} onChange={(v) => update('volume', v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Average Volume" placeholder="enter high price" value={data.avgVolume} onChange={(v) => update('avgVolume', v)} />
            </div>
        </div>
    );
}

// ─── Step 3: News ─────────────────────────────────────────────────────────
function NewsStep({ data, setData }: { data: any; setData: (d: any) => void }) {
    const update = (key: string, val: string) => setData({ ...data, [key]: val });
    return (
        <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900">News</h2>
            <FormInput label="Heading/ Title" placeholder="enter heading" value={data.title} onChange={(v) => update('title', v)} />
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Category</label>
                <select value={data.category} onChange={(e) => update('category', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white">
                    <option value="">Select Category</option>
                    {['Finance', 'Academic', 'Technology', 'Business', 'Market'].map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormInput label="Date" placeholder="Enter date" type="date" value={data.date} onChange={(v) => update('date', v)} />
                <FormInput label="Time" placeholder="00:00 AM" value={data.time} onChange={(v) => update('time', v)} />
            </div>
            <UploadBox label="Upload Image" />
            <FormTextarea label="Description" placeholder="type here" value={data.description} onChange={(v) => update('description', v)} />
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function AddStock() {
    const navigate = useNavigate();
    const { stockId } = useParams();
    const [step, setStep] = useState<Step>(1);

    const isNGN = stockId?.includes('ngn') || stockId === 'ngn-stocks';
    const title = isNGN ? 'Add NGN Stocks' : stockId?.includes('us') ? 'Add US Stocks' : 'Add Stock';

    const [basicData, setBasicData] = useState({
        companyName: '', symbol: '', marketType: 'NGN', openPrice: '',
        todayHigh: '', todayLow: '', sector: '', ceo: '',
        dateSource: '', priceUpdated: '', about: '',
    });
    const [financialData, setFinancialData] = useState({
        openPrice: '', todayPrice: '', todayHighPrice: '', todayLowPrice: '',
        week52High: '', week52Low: '', divYield: '', volume: '', avgVolume: '',
    });
    const [newsData, setNewsData] = useState({
        title: '', category: '', date: '', time: '', description: '',
    });

    const steps = [
        { num: 1 as Step, label: 'Basic Information' },
        { num: 2 as Step, label: 'Financials' },
        { num: 3 as Step, label: 'News' },
    ];

    const handleFinish = () => {
        navigate(`/dashboard/investments/${stockId}`);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button onClick={() => navigate(`/dashboard/investments/${stockId}`)}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={() => navigate('/dashboard/investments')} className="text-slate-400 hover:text-slate-600 transition-colors">
                    Investment Products
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">{isNGN ? 'NGN Stocks' : 'US Stocks'}</span>
            </div>

            {/* Dark Header */}
            <div className="bg-[#0A0E1A] rounded-2xl px-8 py-5">
                <h1 className="text-lg font-bold text-white">{title}</h1>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex">
                    {/* Steps Sidebar */}
                    <div className="w-52 shrink-0 bg-slate-50 border-r border-slate-100 p-5 space-y-2">
                        {steps.map(({ num, label }, i) => (
                            <div key={num}>
                                <button
                                    onClick={() => num < step && setStep(num)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                                        step === num ? "bg-white shadow-sm" : "hover:bg-slate-100 cursor-default"
                                    )}
                                >
                                    <span className={cn(
                                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                        step === num ? "bg-[#B8860B] text-white"
                                            : num < step ? "bg-emerald-500 text-white"
                                                : "bg-slate-200 text-slate-400"
                                    )}>
                                        {num}
                                    </span>
                                    <span className={cn(
                                        "text-sm font-medium",
                                        step === num ? "text-slate-900"
                                            : num < step ? "text-slate-600"
                                                : "text-slate-400"
                                    )}>
                                        {label}
                                    </span>
                                </button>
                                {i < steps.length - 1 && (
                                    <div className="ml-6 w-px h-4 bg-slate-200 mt-1 mb-1" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-8">
                        {step === 1 && <BasicInformationStep data={basicData} setData={setBasicData} />}
                        {step === 2 && <FinancialsStep data={financialData} setData={setFinancialData} />}
                        {step === 3 && <NewsStep data={newsData} setData={setNewsData} />}

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                            <button
                                onClick={() => navigate(`/dashboard/investments/${stockId}`)}
                                className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (step < 3) setStep((s) => (s + 1) as Step);
                                    else handleFinish();
                                }}
                                className="px-6 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors"
                            >
                                {step === 3 ? 'Save' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}