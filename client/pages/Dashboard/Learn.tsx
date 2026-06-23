import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExt from '@tiptap/extension-underline';
import LinkExt from '@tiptap/extension-link';
import {
    ArrowLeft,
    Eye,
    Pencil,
    Trash2,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Link as LinkIcon,
    Quote,
    Minus,
    Loader2,
    Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { learnService } from '@/lib/api/learnService';
import { LearnArticle } from '@shared/api';

// ─── Normalized article shape used across the views ───────────────────────────
interface Article {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    image: string | null;
    views: number;
    datePublished: string;
}

const stripHtml = (html: string) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
};

const formatDate = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });
};

// Map a raw backend article (field names vary) into our normalized shape.
const normalize = (raw: LearnArticle & Record<string, any>): Article => {
    const content = raw.content ?? raw.body ?? '';
    return {
        id: Number(raw.id ?? raw.news_id ?? raw.newsletter_id ?? 0),
        title: raw.title ?? '',
        content,
        excerpt: stripHtml(content).slice(0, 160),
        image: raw.image ?? raw.image_url ?? raw.banner ?? null,
        views: Number(raw.views ?? raw.view_count ?? raw.no_of_views ?? 0),
        datePublished:
            raw.created ??
            raw.created_at ??
            raw.date_published ??
            raw.date ??
            '',
    };
};

// ─── Rich Text Toolbar ────────────────────────────────────────────────────────
function ToolbarButton({
    onClick,
    active,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={title}
            // Keep the editor selection while clicking toolbar buttons.
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={cn(
                'p-1.5 rounded transition-colors',
                active ? 'bg-slate-200 text-[#B8860B]' : 'text-slate-600 hover:bg-slate-200'
            )}
        >
            {children}
        </button>
    );
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            UnderlineExt,
            LinkExt.configure({ openOnClick: false, autolink: true }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                class: cn(
                    'min-h-[200px] px-4 py-3 text-sm text-slate-700 focus:outline-none',
                    '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2',
                    '[&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2',
                    '[&_p]:mb-2',
                    '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
                    '[&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-500',
                    '[&_a]:text-[#B8860B] [&_a]:underline'
                ),
            },
        },
    });

    if (!editor) return null;

    const setLink = () => {
        const prev = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Enter URL', prev || 'https://');
        if (url === null) return; // cancelled
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const headingValue = editor.isActive('heading', { level: 1 })
        ? 'h1'
        : editor.isActive('heading', { level: 2 })
            ? 'h2'
            : 'p';

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200 bg-slate-50 flex-wrap">
                <select
                    value={headingValue}
                    onChange={(e) => {
                        const v = e.target.value;
                        if (v === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
                        else if (v === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
                        else editor.chain().focus().setParagraph().run();
                    }}
                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600 focus:outline-none"
                >
                    <option value="p">Normal text</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                </select>
                <div className="w-px h-5 bg-slate-200 mx-1" />

                <ToolbarButton title="Bold" active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold size={14} />
                </ToolbarButton>
                <ToolbarButton title="Italic" active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic size={14} />
                </ToolbarButton>
                <ToolbarButton title="Underline" active={editor.isActive('underline')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}>
                    <Underline size={14} />
                </ToolbarButton>
                <ToolbarButton title="Strikethrough" active={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}>
                    <Strikethrough size={14} />
                </ToolbarButton>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <List size={14} />
                </ToolbarButton>
                <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    <ListOrdered size={14} />
                </ToolbarButton>
                <ToolbarButton title="Quote" active={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    <Quote size={14} />
                </ToolbarButton>
                <ToolbarButton title="Link" active={editor.isActive('link')} onClick={setLink}>
                    <LinkIcon size={14} />
                </ToolbarButton>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                <ToolbarButton title="Divider"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    <Minus size={14} />
                </ToolbarButton>
            </div>

            {/* Editable Area */}
            <EditorContent editor={editor} />
        </div>
    );
}

// ─── Create/Edit Form ─────────────────────────────────────────────────────────
function LearnForm({
    onBack,
    onSaved,
    editArticle,
}: {
    onBack: () => void;
    onSaved: () => void;
    editArticle?: Article | null;
}) {
    const [title, setTitle] = useState(editArticle?.title || '');
    const [content, setContent] = useState(editArticle?.content || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }
        if (!stripHtml(content)) {
            toast.error('Please enter some content');
            return;
        }

        setSaving(true);
        try {
            const response = editArticle
                ? await learnService.editNewsLetter({
                      id: editArticle.id,
                      title: title.trim(),
                      content,
                  })
                : await learnService.addNewsLetter({
                      title: title.trim(),
                      content,
                  });

            if (response.status) {
                toast.success(
                    response.message ||
                        (editArticle ? 'Article updated' : 'Article published')
                );
                onSaved();
            } else {
                toast.error(response.message || 'Failed to save article');
            }
        } catch (err: any) {
            console.error('Error saving article:', err);
            toast.error(err?.response?.data?.message || 'Failed to save article');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <button onClick={onBack} disabled={saving}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium disabled:opacity-50">
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">Learn</span>
            </div>

            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900">Learn</h1>
                <button onClick={handleSave} disabled={saving}
                    className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors disabled:opacity-60 flex items-center gap-2">
                    {saving && <Loader2 size={15} className="animate-spin" />}
                    {saving ? 'Saving...' : 'Save details'}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
                {/* Title */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <input
                        type="text"
                        placeholder="Enter title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300"
                    />
                </div>

                {/* Newsletter Content */}
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Newsletter Content</label>
                    <RichTextEditor value={content} onChange={setContent} />
                </div>
            </div>
        </div>
    );
}

// ─── Article Detail View ──────────────────────────────────────────────────────
function ArticleDetail({ article, onBack }: { article: Article; onBack: () => void }) {
    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-2 text-sm">
                <button onClick={onBack}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                    <ArrowLeft size={16} />
                    Back
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={onBack} className="text-slate-400 hover:text-slate-600">Learn</button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-semibold">Details</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <h1 className="text-xl font-bold text-slate-900 mb-3">{article.title}</h1>
                <div className="flex gap-8 mb-6 pb-4 border-b border-slate-100">
                    <div>
                        <p className="text-xs text-slate-400 mb-0.5">No of Views</p>
                        <p className="text-sm font-bold text-slate-900">{article.views}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-0.5">Date Published</p>
                        <p className="text-sm font-bold text-slate-900">{formatDate(article.datePublished)}</p>
                    </div>
                </div>
                {article.image && (
                    <img src={article.image} alt={article.title}
                        className="w-full h-64 object-cover rounded-xl mb-6" />
                )}
                <div
                    className="text-sm text-slate-600 leading-relaxed space-y-4 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-[#B8860B] [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />
            </div>
        </div>
    );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({
    onConfirm,
    onCancel,
    deleting,
}: {
    onConfirm: () => void;
    onCancel: () => void;
    deleting: boolean;
}) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
                <div className="w-12 h-12 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">⚠️</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Delete article?</h2>
                <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this article?</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={deleting}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={deleting}
                        className="flex-1 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                        {deleting && <Loader2 size={14} className="animate-spin" />}
                        {deleting ? 'Deleting...' : 'Yes, delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Learn Page ──────────────────────────────────────────────────────────
type View = 'list' | 'create' | 'detail' | 'edit';

export default function Learn() {
    const [view, setView] = useState<View>('list');
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Article | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const response = await learnService.fetchAllNews({ id: '' });
            if (response.status) {
                const list = response.data?.news ?? [];
                setArticles(list.map(normalize));
            } else {
                toast.error(response.message || 'Failed to load articles');
                setArticles([]);
            }
        } catch (err) {
            console.error('Error fetching articles:', err);
            toast.error('An error occurred while loading articles');
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const response = await learnService.deleteNewsLetter({ id: deleteTarget.id });
            if (response.status) {
                toast.success(response.message || 'Article deleted');
                setDeleteTarget(null);
                fetchArticles();
            } else {
                toast.error(response.message || 'Failed to delete article');
            }
        } catch (err: any) {
            console.error('Error deleting article:', err);
            toast.error(err?.response?.data?.message || 'Failed to delete article');
        } finally {
            setDeleting(false);
        }
    };

    const handleSaved = () => {
        setView('list');
        setSelected(null);
        fetchArticles();
    };

    if (view === 'create')
        return <LearnForm onBack={() => setView('list')} onSaved={handleSaved} />;
    if (view === 'edit' && selected)
        return <LearnForm onBack={() => setView('list')} onSaved={handleSaved} editArticle={selected} />;
    if (view === 'detail' && selected)
        return <ArticleDetail article={selected} onBack={() => setView('list')} />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900">Learn</h1>
                <button onClick={() => { setSelected(null); setView('create'); }}
                    className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors">
                    Add
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#B8860B]" size={40} />
                    <p className="text-slate-500 font-medium">Loading articles...</p>
                </div>
            ) : articles.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="text-slate-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No articles yet</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        Click <span className="font-semibold text-[#B8860B]">Add</span> to publish your first Learn article.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {articles.map((article) => (
                        <div key={article.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2">{article.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed mb-5 line-clamp-3">{article.excerpt}</p>
                            <div className="flex items-center gap-3 pt-3 border-t border-slate-50">
                                <button
                                    onClick={() => { setSelected(article); setView('detail'); }}
                                    title="View"
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                    <Eye size={15} />
                                </button>
                                <button
                                    onClick={() => { setSelected(article); setView('edit'); }}
                                    title="Edit"
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-yellow-600 transition-colors">
                                    <Pencil size={15} />
                                </button>
                                <button
                                    onClick={() => setDeleteTarget(article)}
                                    title="Delete"
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {deleteTarget && (
                <DeleteModal
                    deleting={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => !deleting && setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
