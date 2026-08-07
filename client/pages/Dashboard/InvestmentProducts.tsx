import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Info, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { productsService } from '@/lib/api/productsService';
import { notesService } from '@/lib/api/notesService';
import { NoteFormModal } from '@/components/dashboard/NoteFormModal';
import { InvestmentNoteModel, NoteListItem, ProductStock } from '@shared/api';

type InvestmentTab = 'Stocks' | 'Investment notes';
type InvestmentType = 'Stocks' | 'Investment notes';

interface Product {
    id: string;
    name: string;
    description: string;
    type: InvestmentType;
}

// Build a readable card description from the (often sparse) API fields.
const stockDescription = (s: ProductStock): string =>
    s.investment_focus?.trim() || `${s.short_name || s.product_name} stocks`;

const noteDescription = (n: NoteListItem): string =>
    n.investment_focus?.trim() || `${n.short_name || n.product_name}`;

function ProductCard({ product, onDelete, onEdit, onView, editing }: Readonly<{
    product: Product;
    onDelete: () => void;
    onEdit?: () => void;
    onView: () => void;
    editing?: boolean;
}>) {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-base font-bold text-slate-900">{product.name}</h3>
                <button
                    onClick={onDelete}
                    title="Delete"
                    aria-label="Delete"
                    className="shrink-0 -mr-1.5 -mt-1 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1 line-clamp-3">{product.description}</p>
            <div className="flex items-center gap-3">
                {onEdit && (
                    <button
                        onClick={onEdit}
                        disabled={editing}
                        className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {editing && <Loader2 size={14} className="animate-spin" />}
                        Edit
                    </button>
                )}
                <button
                    onClick={onView}
                    className="flex-1 py-2 bg-[#1a237e] text-white rounded-xl text-sm font-semibold hover:bg-[#151c64] transition-colors"
                >
                    View
                </button>
            </div>
        </div>
    );
}

export default function InvestmentProducts() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<InvestmentTab>('Investment notes');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateNote, setShowCreateNote] = useState(false);
    const [editNote, setEditNote] = useState<InvestmentNoteModel | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Stocks come from getAllProducts (/api/v1); notes come from the
            // inv-notes list, which carries the `id` needed to open a note.
            const [productsRes, notesRes] = await Promise.all([
                productsService.getAllProducts(),
                notesService.getAllNotes(),
            ]);

            const stocks: Product[] = (productsRes.data?.stocks ?? []).map((s) => ({
                id: s.product_code,
                name: s.product_name,
                description: stockDescription(s),
                type: 'Stocks',
            }));

            const notes: Product[] = (notesRes.data ?? []).map((n) => ({
                id: String(n.id),
                name: n.product_name,
                description: noteDescription(n),
                type: 'Investment notes',
            }));

            setProducts([...stocks, ...notes]);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load investment products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filtered = products.filter(p => p.type === activeTab);

    // NOTE: front-end only for now — no delete-product endpoint yet.
    const handleDelete = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

    // Stocks go to the overview page; notes go to the note detail page.
    const handleView = (product: Product) => {
        const base = product.type === 'Stocks'
            ? `/dashboard/investments/stocks-overview/${product.id}`
            : `/dashboard/investments/notes/${product.id}`;
        navigate(base);
    };

    // Edit opens the note form modal in place (fetches the full note first),
    // instead of just re-opening the detail page.
    const openEditNote = async (product: Product) => {
        setEditingId(product.id);
        try {
            const res = await notesService.getSingleNote(product.id);
            if (res.status) {
                const raw = res.data;
                const note = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
                if (note) setEditNote(note);
                else toast.error('Note not found');
            } else {
                toast.error(res.message || 'Failed to load note');
            }
        } catch (err) {
            console.error('Error loading note for edit:', err);
            toast.error('Failed to load note');
        } finally {
            setEditingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs + Add Button */}
            <div className="flex items-center justify-between">
                <div className="flex gap-1 border-b border-slate-100">
                    {(['Investment notes', 'Stocks'] as InvestmentTab[]).map((tab) => (
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
                {activeTab === 'Investment notes' && (
                    <button
                        onClick={() => setShowCreateNote(true)}
                        className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors"
                    >
                        Add Investment Note
                    </button>
                )}
            </div>

            {/* Cards Grid */}
            {activeTab === 'Stocks' ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-24 text-center">
                    <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🚧</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Stocks — coming soon</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
                        Stock management isn't ready yet. This section will light up once the
                        stocks API is available.
                    </p>
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#B8860B]" size={40} />
                    <p className="text-slate-500 font-medium">Loading products...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filtered.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onDelete={() => handleDelete(product.id)}
                            onView={() => handleView(product)}
                            onEdit={product.type === 'Investment notes' ? () => openEditNote(product) : undefined}
                            editing={editingId === product.id}
                        />
                    ))}
                    {filtered.length === 0 && (
                        <div className="lg:col-span-2 py-20 text-center text-slate-400">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Info className="text-slate-400" size={24} />
                            </div>
                            <p className="text-base font-medium">No {activeTab.toLowerCase()} found</p>
                            <p className="text-sm mt-1">Nothing to show for this category yet</p>
                        </div>
                    )}
                </div>
            )}

            {showCreateNote && (
                <NoteFormModal
                    mode="create"
                    onClose={() => setShowCreateNote(false)}
                    onSaved={() => { setShowCreateNote(false); fetchProducts(); }}
                />
            )}

            {editNote && (
                <NoteFormModal
                    mode="edit"
                    initial={editNote}
                    onClose={() => setEditNote(null)}
                    onSaved={() => { setEditNote(null); fetchProducts(); }}
                />
            )}
        </div>
    );
}