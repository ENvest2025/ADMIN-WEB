import { useState } from 'react';
import { Pencil, Trash2, X } from 'lucide-react';

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

const MOCK_FAQS: FAQ[] = [
    { id: '1', question: 'How do I register on EnVest?', answer: 'Access the website through www.envest.com' },
    { id: '2', question: 'What is dividend?', answer: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout" },
    { id: '3', question: 'How do I register on EnVest?', answer: 'Access the website through www.envest.com' },
    { id: '4', question: 'How do I register on EnVest?', answer: 'Access the website through www.envest.com' },
    { id: '5', question: 'How do I register on EnVest?', answer: 'Access the website through www.envest.com' },
    { id: '6', question: 'How do I register on EnVest?', answer: 'Access the website through www.envest.com' },
    { id: '7', question: 'How do I register on EnVest?', answer: 'Access the website through www.envest.com' },
    { id: '8', question: 'How do I register on EnVest?', answer: 'Access the website through www.envest.com' },
    { id: '9', question: 'How do I register on EnVest?', answer: 'Access the website through www.envest.com' },
];

// ─── FAQ Modal (Add/Edit) ─────────────────────────────────────────────────────
function FAQModal({ faq, onSave, onClose }: {
    faq?: FAQ | null;
    onSave: (q: string, a: string) => void;
    onClose: () => void;
}) {
    const [question, setQuestion] = useState(faq?.question || '');
    const [answer, setAnswer] = useState(faq?.answer || '');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">FAQ</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Question</label>
                        <input
                            type="text"
                            placeholder="question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700">Answer</label>
                        <textarea
                            placeholder="type here"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            rows={5}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300 resize-none"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                    <button onClick={onClose}
                        className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => { if (question.trim()) { onSave(question, answer); onClose(); } }}
                        className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteFAQModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
                <div className="w-12 h-12 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">⚠️</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Delete FAQ ?</h2>
                <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this FAQ?</p>
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors">
                        Yes, delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Support Page ────────────────────────────────────────────────────────
export default function Support() {
    const [faqs, setFaqs] = useState<FAQ[]>(MOCK_FAQS);
    const [showModal, setShowModal] = useState(false);
    const [editFaq, setEditFaq] = useState<FAQ | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const handleSave = (question: string, answer: string) => {
        if (editFaq) {
            setFaqs(prev => prev.map(f => f.id === editFaq.id ? { ...f, question, answer } : f));
            setEditFaq(null);
        } else {
            setFaqs(prev => [...prev, { id: Date.now().toString(), question, answer }]);
        }
    };

    const handleDelete = () => {
        if (deleteTarget) {
            setFaqs(prev => prev.filter(f => f.id !== deleteTarget));
            setDeleteTarget(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900">FAQ's</h1>
                <button
                    onClick={() => { setEditFaq(null); setShowModal(true); }}
                    className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors"
                >
                    Add
                </button>
            </div>

            {/* FAQ List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                    {faqs.map((faq) => (
                        <div key={faq.id} className="flex items-start justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-sm font-semibold text-slate-900 mb-1">{faq.question}</p>
                                <p className="text-sm text-slate-400 line-clamp-1">{faq.answer}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => { setEditFaq(faq); setShowModal(true); }}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-yellow-600 transition-colors"
                                >
                                    <Pencil size={15} />
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(faq.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            {showModal && (
                <FAQModal
                    faq={editFaq}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditFaq(null); }}
                />
            )}
            {deleteTarget && (
                <DeleteFAQModal
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}