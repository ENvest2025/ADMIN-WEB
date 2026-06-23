import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TenureOption {
    id: string;
    name: string;
    maturesDays: number;
    percentage: number;
    minimumInvestment: string;
    tenor: string;
}

const MOCK_NOTES: Record<string, { name: string; description: string; tenures: TenureOption[] }> = {
    'golden-bridge-ethical': {
        name: 'GoldenBridge Ethical Notes (GEN)',
        description: 'Retailers, individuals wishing to accumulate funds towards a future project',
        tenures: [
            { id: 't1', name: 'GoldenBridge Ethical Notes (GEN)', maturesDays: 182, percentage: 17, minimumInvestment: '₦5,000,000.00', tenor: 'Semi-annually' },
            { id: 't2', name: 'GoldenBridge Ethical Notes (GEN)', maturesDays: 365, percentage: 20, minimumInvestment: '₦5,000,000.00', tenor: 'Annually' },
        ],
    },
    'golden-bridge-income': {
        name: 'GoldenBridge Income Notes (GIN)',
        description: 'Retailers, individuals wishing to accumulate funds towards a future project',
        tenures: [],
    },
    'golden-bridge-dollar': {
        name: 'GoldenBridge Dollar Notes (GDN)',
        description: 'Retailers, individuals wishing to accumulate funds towards a future project',
        tenures: [],
    },
    'golden-bridge-treasury': {
        name: 'GoldenBridge Treasury Notes (GTN)',
        description: 'Retailers, individuals wishing to accumulate funds towards a future project',
        tenures: [],
    },
};

interface AddTenureModalProps {
    onClose: () => void;
    onSave: (t: TenureOption) => void;
    initial?: TenureOption | null;
}

function AddTenureModal({ onClose, onSave, initial }: AddTenureModalProps) {
    const [form, setForm] = useState({
        name: initial?.name ?? '',
        minimumInvestment: initial?.minimumInvestment ?? '₦5,000,000.00',
        tenor: initial?.tenor ?? 'Semi-annually',
        maturesDays: initial?.maturesDays?.toString() ?? '182',
        percentage: initial?.percentage?.toString() ?? '17',
    });

    const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

    const handleSave = () => {
        if (!form.name.trim()) return;
        onSave({
            id: initial?.id ?? Date.now().toString(),
            name: form.name,
            minimumInvestment: form.minimumInvestment,
            tenor: form.tenor,
            maturesDays: parseInt(form.maturesDays) || 0,
            percentage: parseFloat(form.percentage) || 0,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">
                        {initial ? 'Edit Investment Tenure Options' : 'Add Investment Tenure Options'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Name of investment</label>
                        <input
                            type="text"
                            placeholder="Name of investment"
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Minimum investment</label>
                        <input
                            type="text"
                            placeholder="₦5,000,000.00"
                            value={form.minimumInvestment}
                            onChange={(e) => update('minimumInvestment', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Tenor</label>
                        <input
                            type="text"
                            placeholder="Semi-annually"
                            value={form.tenor}
                            onChange={(e) => update('tenor', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Maturity days</label>
                        <input
                            type="number"
                            placeholder="182"
                            value={form.maturesDays}
                            onChange={(e) => update('maturesDays', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Percentage</label>
                        <input
                            type="text"
                            placeholder="17%"
                            value={form.percentage}
                            onChange={(e) => update('percentage', e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between p-6 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function InvestmentNoteDetail() {
    const navigate = useNavigate();
    const { noteId } = useParams();

    const noteKey = noteId ?? '';
    const noteData = MOCK_NOTES[noteKey] ?? {
        name: 'Investment Note',
        description: 'Investment note details',
        tenures: [],
    };

    const [tenures, setTenures] = useState<TenureOption[]>(noteData.tenures);
    const [showModal, setShowModal] = useState(false);
    const [editingTenure, setEditingTenure] = useState<TenureOption | null>(null);

    const handleSave = (tenure: TenureOption) => {
        if (editingTenure) {
            setTenures(prev => prev.map(t => t.id === tenure.id ? tenure : t));
        } else {
            setTenures(prev => [...prev, tenure]);
        }
        setEditingTenure(null);
    };

    const handleDelete = (id: string) => setTenures(prev => prev.filter(t => t.id !== id));

    const openEdit = (tenure: TenureOption) => {
        setEditingTenure(tenure);
        setShowModal(true);
    };

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
                <span className="text-slate-900 font-semibold">{noteData.name}</span>
            </div>

            {/* Note Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">{noteData.name}</h1>
                    <p className="text-sm text-slate-500 mt-1">{noteData.description}</p>
                </div>
                <button
                    onClick={() => { setEditingTenure(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors shrink-0"
                >
                    <Plus size={16} />
                    Investment Tenure Options
                </button>
            </div>

            {/* Tenure Cards */}
            <div className="space-y-4">
                {tenures.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-base font-medium text-slate-400">No tenure options added yet</p>
                        <p className="text-sm text-slate-400 mt-1">Click "Investment Tenure Options" to add one</p>
                    </div>
                ) : (
                    tenures.map((tenure) => (
                        <div
                            key={tenure.id}
                            className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-slate-900">{tenure.tenor}</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDelete(tenure.id)}
                                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => openEdit(tenure)}
                                        className="px-4 py-2 bg-[#1a237e] text-white rounded-xl text-sm font-semibold hover:bg-[#151c64] transition-colors"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-slate-400 font-medium mb-1">Matures in</p>
                                    <p className="text-sm font-semibold text-slate-800">{tenure.maturesDays} days.</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium mb-1">Percentage</p>
                                    <p className="text-sm font-semibold text-slate-800">{tenure.percentage} %</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <AddTenureModal
                    onClose={() => { setShowModal(false); setEditingTenure(null); }}
                    onSave={handleSave}
                    initial={editingTenure}
                />
            )}
        </div>
    );
}