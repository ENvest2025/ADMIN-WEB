import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type InvestmentTab = 'Stocks' | 'Investment notes';
type InvestmentType = 'Stocks' | 'Investment notes';

interface Product {
    id: string;
    name: string;
    description: string;
    type: InvestmentType;
}

const INITIAL_PRODUCTS: Product[] = [
    { id: 'ngn-stocks', name: 'NGN Stocks', description: 'Full system control with the ability to manage users, permissions, and system settings.', type: 'Stocks' },
    { id: 'us-stocks', name: 'US Stocks', description: 'Full system control with the ability to manage users, permissions, and system settings.', type: 'Stocks' },
    { id: 'golden-bridge-income', name: 'GoldenBridge Income Notes (GIN)', description: 'Retailers, individuals wishing to accumulate funds towards a future project.', type: 'Investment notes' },
    { id: 'golden-bridge-ethical', name: 'GoldenBridge Ethical Notes (GEN)', description: 'Retailers, individuals wishing to accumulate funds towards a future project.', type: 'Investment notes' },
    { id: 'golden-bridge-dollar', name: 'GoldenBridge Dollar Notes (GDN)', description: 'Retailers, individuals wishing to accumulate funds towards a future project.', type: 'Investment notes' },
    { id: 'golden-bridge-treasury', name: 'GoldenBridge Treasury Notes (GTN)', description: 'Retailers, individuals wishing to accumulate funds towards a future project.', type: 'Investment notes' },
];

function AddInvestmentModal({ onClose, onSave }: { onClose: () => void; onSave: (p: Product) => void }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<InvestmentType>('Stocks');

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ id: name.toLowerCase().replace(/\s+/g, '-'), name, description, type });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Add Investment</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Name of investment</label>
                        <input
                            type="text"
                            placeholder="Name of investment"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
                        <textarea
                            placeholder="type here"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300 resize-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-2">Investment Type</label>
                        <div className="space-y-2">
                            {(['Stocks', 'Investment notes'] as InvestmentType[]).map((t) => (
                                <label key={t} className="flex items-center gap-2.5 cursor-pointer">
                                    <input type="radio" name="investType" value={t} checked={type === t}
                                        onChange={() => setType(t)} className="w-4 h-4 accent-yellow-500" />
                                    <span className="text-sm text-slate-600">{t}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between p-6 border-t border-slate-100">
                    <button onClick={onClose}
                        className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave}
                        className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProductCard({ product, onDelete, onEdit, onView }: {
    product: Product;
    onDelete: () => void;
    onEdit: () => void;
    onView: () => void;
}) {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-base font-bold text-slate-900 mb-2">{product.name}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{product.description}</p>
            <div className="flex items-center gap-3">
                <button onClick={onDelete}
                    className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">
                    Delete
                </button>
                <button onClick={onEdit}
                    className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    Edit
                </button>
                <button onClick={onView}
                    className="flex-1 py-2 bg-[#1a237e] text-white rounded-xl text-sm font-semibold hover:bg-[#151c64] transition-colors">
                    View
                </button>
            </div>
        </div>
    );
}

export default function InvestmentProducts() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<InvestmentTab>('Stocks');
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [showModal, setShowModal] = useState(false);

    const filtered = products.filter(p => p.type === activeTab);

    const handleDelete = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));
    const handleSave = (product: Product) => setProducts(prev => [...prev, product]);

    // ─── KEY CHANGE: Stocks go to /stocks-overview/:id, Notes go to /notes/:id ───
    const handleView = (product: Product) => {
        if (product.type === 'Stocks') {
            // Goes to NGNStocksOverview (stats + table page)
            navigate(`/dashboard/investments/stocks-overview/${product.id}`);
        } else {
            // Goes to InvestmentNoteDetail (tenure options page)
            navigate(`/dashboard/investments/notes/${product.id}`);
        }
    };

    const handleEdit = (product: Product) => {
        if (product.type === 'Stocks') {
            navigate(`/dashboard/investments/stocks-overview/${product.id}`);
        } else {
            navigate(`/dashboard/investments/notes/${product.id}`);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs + Add Button */}
            <div className="flex items-center justify-between">
                <div className="flex gap-1 border-b border-slate-100">
                    {(['Stocks', 'Investment notes'] as InvestmentTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 pb-3 text-sm font-medium transition-all border-b-2 -mb-px",
                                activeTab === tab
                                    ? "border-[#B8860B] text-[#B8860B]"
                                    : "border-transparent text-slate-400 hover:text-slate-700"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors"
                >
                    Add Investment
                </button>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 gap-5">
                {filtered.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onDelete={() => handleDelete(product.id)}
                        onEdit={() => handleEdit(product)}
                        onView={() => handleView(product)}
                    />
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-2 py-20 text-center text-slate-400">
                        <p className="text-base font-medium">No {activeTab.toLowerCase()} added yet</p>
                        <p className="text-sm mt-1">Click "Add Investment" to get started</p>
                    </div>
                )}
            </div>

            {showModal && (
                <AddInvestmentModal onClose={() => setShowModal(false)} onSave={handleSave} />
            )}
        </div>
    );
}