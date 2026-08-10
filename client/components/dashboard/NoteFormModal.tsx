import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { notesService } from '@/lib/api/notesService';
import { InvestmentNoteModel, UpdateNotePayload } from '@shared/api';

type Mode = 'create' | 'edit';

interface NoteFormModalProps {
    mode: Mode;
    initial?: InvestmentNoteModel | null;
    onClose: () => void;
    onSaved: () => void;
}

const RISK_LEVELS = ['Low Risk', 'Medium Risk', 'High Risk'];
const STATUSES = ['Active', 'Inactive'];

const field = (v?: string) => v ?? '';

export function NoteFormModal({ mode, initial, onClose, onSaved }: Readonly<NoteFormModalProps>) {
    const [form, setForm] = useState({
        product_code: field(initial?.product_code),
        product_name: field(initial?.product_name),
        category: field(initial?.category),
        target_audience: field(initial?.target_audience),
        investment_focus: field(initial?.investment_focus),
        benefits: field(initial?.benefits),
        risk_level: initial?.risk_level || 'Low Risk',
        maturity_period: field(initial?.maturity_period),
        min_investment: field(initial?.min_investment),
        currency_symbol: initial?.currency_symbol || '₦',
        description: field(initial?.description),
        status: initial?.status || 'Active',
        quarterly_roi: field(initial?.quarterly_roi),
        semi_roi: field(initial?.semi_roi),
        annual_roi: field(initial?.annual_roi),
        quarterly_roi_days: field(initial?.quarterly_roi_days),
        semi_roi_days: field(initial?.semi_roi_days),
        annual_roi_days: field(initial?.annual_roi_days),
        custody_fee: field(initial?.custody_fee),
        rollover: initial?.rollover ?? 0,
    });
    const [saving, setSaving] = useState(false);

    const set = (key: keyof typeof form, val: string | number) =>
        setForm((f) => ({ ...f, [key]: val }));

    const handleSave = async () => {
        if (!form.product_name.trim()) {
            toast.error('Product name is required');
            return;
        }
        if (mode === 'create' && !form.product_code.trim()) {
            toast.error('Product code is required');
            return;
        }

        setSaving(true);
        try {
            const base = {
                product_code: form.product_code.trim(),
                product_name: form.product_name.trim(),
                category: form.category.trim(),
                target_audience: form.target_audience.trim(),
                investment_focus: form.investment_focus.trim(),
                benefits: form.benefits.trim(),
                risk_level: form.risk_level,
                maturity_period: form.maturity_period.trim(),
                min_investment: form.min_investment.trim(),
                currency_symbol: form.currency_symbol.trim() || '₦',
                description: form.description.trim(),
                status: form.status,
                quarterly_roi: form.quarterly_roi.trim(),
                semi_roi: form.semi_roi.trim(),
                annual_roi: form.annual_roi.trim(),
                quarterly_roi_days: form.quarterly_roi_days.trim(),
                semi_roi_days: form.semi_roi_days.trim(),
                annual_roi_days: form.annual_roi_days.trim(),
                custody_fee: form.custody_fee.trim(),
            };

            const response =
                mode === 'edit' && initial
                    ? await notesService.updateNote({
                          ...base,
                          note_id: initial.id,
                          rollover: Number(form.rollover) || 0,
                      } as UpdateNotePayload)
                    : await notesService.createNote(base);

            if (response.status) {
                toast.success(response.message || (mode === 'edit' ? 'Note updated' : 'Note created'));
                onSaved();
            } else {
                toast.error(response.message || 'Failed to save note');
            }
        } catch (err: any) {
            console.error('Error saving note:', err);
            toast.error(err?.response?.data?.message || 'Failed to save note');
        } finally {
            setSaving(false);
        }
    };

    const inputCls =
        'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
                    <h2 className="text-lg font-bold text-slate-900">
                        {mode === 'edit' ? 'Edit Investment Note' : 'Create Investment Note'}
                    </h2>
                    <button onClick={onClose} disabled={saving}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-50">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Labeled label="Product name">
                            <input className={inputCls} placeholder="Goldenbridge Income Note"
                                value={form.product_name} onChange={(e) => set('product_name', e.target.value)} />
                        </Labeled>
                        <Labeled label="Product code">
                            <input className={inputCls} placeholder="GB-INOTE" disabled={mode === 'edit'}
                                value={form.product_code} onChange={(e) => set('product_code', e.target.value)} />
                        </Labeled>
                        <Labeled label="Category">
                            <input className={inputCls} placeholder="Income"
                                value={form.category} onChange={(e) => set('category', e.target.value)} />
                        </Labeled>
                        <Labeled label="Risk level">
                            <select className={inputCls} value={form.risk_level} onChange={(e) => set('risk_level', e.target.value)}>
                                {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </Labeled>
                        <Labeled label="Target audience">
                            <input className={inputCls} placeholder="Individuals seeking..."
                                value={form.target_audience} onChange={(e) => set('target_audience', e.target.value)} />
                        </Labeled>
                        <Labeled label="Investment focus">
                            <input className={inputCls} placeholder="Equities, Fixed Income"
                                value={form.investment_focus} onChange={(e) => set('investment_focus', e.target.value)} />
                        </Labeled>
                        <Labeled label="Maturity period">
                            <input className={inputCls} placeholder="Semi-annually and Annually"
                                value={form.maturity_period} onChange={(e) => set('maturity_period', e.target.value)} />
                        </Labeled>
                        <Labeled label="Status">
                            <select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
                                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </Labeled>
                        <Labeled label="Currency symbol">
                            <input className={inputCls} placeholder="₦"
                                value={form.currency_symbol} onChange={(e) => set('currency_symbol', e.target.value)} />
                        </Labeled>
                        <Labeled label="Minimum investment">
                            <input className={inputCls} placeholder="100,000.00"
                                value={form.min_investment} onChange={(e) => set('min_investment', e.target.value)} />
                        </Labeled>
                    </div>

                    <Labeled label="Benefits">
                        <input className={inputCls} placeholder="Capital growth, Regular income"
                            value={form.benefits} onChange={(e) => set('benefits', e.target.value)} />
                    </Labeled>
                    <Labeled label="Description">
                        <textarea rows={2} className={`${inputCls} resize-none`} placeholder="An income-focused note"
                            value={form.description} onChange={(e) => set('description', e.target.value)} />
                    </Labeled>

                    {/* ROI tiers */}
                    <div className="rounded-xl border border-slate-100 p-4 space-y-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Quarterly tier</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Labeled label="Quarterly ROI (%)">
                                <input className={inputCls} placeholder="0"
                                    value={form.quarterly_roi} onChange={(e) => set('quarterly_roi', e.target.value)} />
                            </Labeled>
                            <Labeled label="Quarterly ROI days">
                                <input className={inputCls} placeholder="90"
                                    value={form.quarterly_roi_days} onChange={(e) => set('quarterly_roi_days', e.target.value)} />
                            </Labeled>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Semi-annual tier</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Labeled label="Semi ROI (%)">
                                <input className={inputCls} placeholder="17"
                                    value={form.semi_roi} onChange={(e) => set('semi_roi', e.target.value)} />
                            </Labeled>
                            <Labeled label="Semi ROI days">
                                <input className={inputCls} placeholder="180"
                                    value={form.semi_roi_days} onChange={(e) => set('semi_roi_days', e.target.value)} />
                            </Labeled>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Annual tier</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Labeled label="Annual ROI (%)">
                                <input className={inputCls} placeholder="25"
                                    value={form.annual_roi} onChange={(e) => set('annual_roi', e.target.value)} />
                            </Labeled>
                            <Labeled label="Annual ROI days">
                                <input className={inputCls} placeholder="365"
                                    value={form.annual_roi_days} onChange={(e) => set('annual_roi_days', e.target.value)} />
                            </Labeled>
                        </div>
                    </div>

                    {mode === 'edit' && (
                        <Labeled label="Rollover">
                            <select className={inputCls} value={form.rollover} onChange={(e) => set('rollover', Number(e.target.value))}>
                                <option value={0}>Disabled</option>
                                <option value={1}>Enabled</option>
                            </select>
                        </Labeled>
                    )}
                </div>

                <div className="flex items-center justify-between p-5 border-t border-slate-100 shrink-0">
                    <button onClick={onClose} disabled={saving}
                        className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors disabled:opacity-60 flex items-center gap-2">
                        {saving && <Loader2 size={15} className="animate-spin" />}
                        {saving ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create note'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Labeled({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 block">{label}</label>
            {children}
        </div>
    );
}
