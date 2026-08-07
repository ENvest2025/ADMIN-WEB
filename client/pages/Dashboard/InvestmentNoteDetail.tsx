import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { notesService } from '@/lib/api/notesService';
import { NoteFormModal } from '@/components/dashboard/NoteFormModal';
import { InvestmentNoteModel } from '@shared/api';

export default function InvestmentNoteDetail() {
    const navigate = useNavigate();
    const { noteId } = useParams();

    const [note, setNote] = useState<InvestmentNoteModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [showEdit, setShowEdit] = useState(false);

    const fetchNote = async () => {
        setLoading(true);
        try {
            const response = await notesService.getSingleNote(noteId ?? '');
            if (response.status) {
                const raw = response.data as InvestmentNoteModel | InvestmentNoteModel[];
                const match = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
                setNote(match);
                if (!match) toast.error('Note not found');
            } else {
                toast.error(response.message || 'Failed to load note');
                setNote(null);
            }
        } catch (err) {
            console.error('Error fetching note:', err);
            toast.error('Failed to load note');
            setNote(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNote();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [noteId]);

    const tiers = note
        ? [
              { tenor: 'Semi-annually', days: note.semi_roi_days, percentage: note.semi_roi },
              { tenor: 'Annually', days: note.annual_roi_days, percentage: note.annual_roi },
          ]
        : [];

    const minInvestment = note
        ? `${note.currency_symbol || ''}${note.min_investment || '0'}`
        : '';

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button
                    onClick={() => navigate('/dashboard/investments')}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-slate-300">|</span>
                <button
                    onClick={() => navigate('/dashboard/investments')}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    Investment Products
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold truncate">
                    {note?.product_name || 'Investment Note'}
                </span>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-[#B8860B]" size={40} />
                    <p className="text-slate-500 font-medium">Loading note...</p>
                </div>
            ) : !note ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="text-slate-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Note not found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        We couldn't find an investment note for this product.
                    </p>
                </div>
            ) : (
                <>
                    {/* Note Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-slate-900">{note.product_name}</h1>
                            {note.description && (
                                <p className="text-sm text-slate-500 mt-1">{note.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                {note.category && <Chip>{note.category}</Chip>}
                                {note.risk_level && <Chip>{note.risk_level}</Chip>}
                                {note.maturity_period && <Chip>{note.maturity_period}</Chip>}
                                {note.status && (
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        note.status.toLowerCase() === 'active'
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}>
                                        {note.status}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowEdit(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors shrink-0"
                        >
                            <Pencil size={16} />
                            Edit note
                        </button>
                    </div>

                    {/* Info strip */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <InfoCard label="Minimum investment" value={minInvestment} />
                        <InfoCard label="Investment focus" value={note.investment_focus || '—'} />
                        <InfoCard label="Target audience" value={note.target_audience || '—'} />
                        <InfoCard label="Benefits" value={note.benefits || '—'} />
                    </div>

                    {/* ROI Tiers */}
                    <div>
                        <h2 className="text-base font-bold text-slate-900 mb-3">Investment Tenure Options</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {tiers.map((tier) => (
                                <div key={tier.tenor} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-bold text-slate-900">{tier.tenor}</h3>
                                        <button
                                            onClick={() => setShowEdit(true)}
                                            className="px-4 py-2 bg-[#1a237e] text-white rounded-xl text-sm font-semibold hover:bg-[#151c64] transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium mb-1">Matures in</p>
                                            <p className="text-sm font-semibold text-slate-800">{tier.days || '—'} days</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium mb-1">Percentage</p>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {tier.percentage ? `${String(tier.percentage).replace('%', '')}%` : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {showEdit && note && (
                <NoteFormModal
                    mode="edit"
                    initial={note}
                    onClose={() => setShowEdit(false)}
                    onSaved={() => { setShowEdit(false); fetchNote(); }}
                />
            )}
        </div>
    );
}

function Chip({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {children}
        </span>
    );
}

function InfoCard({ label, value }: Readonly<{ label: string; value: string }>) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
            <p className="text-sm font-semibold text-slate-800 break-words">{value}</p>
        </div>
    );
}
