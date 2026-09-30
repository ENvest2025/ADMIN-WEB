import { useEffect, useRef, useState } from 'react';
import {
    Plus, Loader2, Info, Pencil, Trash2, X, Upload, Film, Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { inAppAdsService } from '@/lib/api/inAppAdsService';
import { InAppAd } from '@shared/api';

const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VID_TYPES = ['video/mp4'];
const MAX_IMG = 2 * 1024 * 1024; // 2MB
const MAX_VID = 5 * 1024 * 1024; // 5MB
const ACCEPT = [...IMG_TYPES, ...VID_TYPES].join(',');

const MAX_W = 3840;
const MAX_H = 2160;

const validateFile = (file: File): string | null => {
    const isVideo = file.type.startsWith('video/');
    if (!IMG_TYPES.includes(file.type) && !VID_TYPES.includes(file.type)) {
        return 'Use JPG, PNG, WEBP, GIF (≤2MB) or MP4 (≤5MB, ≤5s).';
    }
    if (isVideo && file.size > MAX_VID) return 'Video must be 5MB or less.';
    if (!isVideo && file.size > MAX_IMG) return 'Image must be 2MB or less.';
    return null;
};

// Mirror the backend's landscape + dimension rules before uploading.
const checkDimensions = (w: number, h: number): string | null => {
    if (!w || !h) return 'Could not read the media dimensions. Please try another file.';
    if (w <= h) return `Media must be landscape (width greater than height). This file is ${w}×${h}.`;
    if (w > MAX_W || h > MAX_H) return `Media must be at most ${MAX_W} × ${MAX_H}. This file is ${w}×${h}.`;
    return null;
};

const readImageDimensions = (file: File): Promise<{ w: number; h: number }> =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('read-error')); };
        img.src = url;
    });

const readVideoMeta = (file: File): Promise<{ w: number; h: number; duration: number }> =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.onloadedmetadata = () => { resolve({ w: v.videoWidth, h: v.videoHeight, duration: v.duration }); URL.revokeObjectURL(url); };
        v.onerror = () => { URL.revokeObjectURL(url); reject(new Error('read-error')); };
        v.src = url;
    });

const isVideoType = (t: string) => t === 'video' || t.startsWith('video');

// ─── Media preview ────────────────────────────────────────────────────────────
function Media({ url, type, className }: Readonly<{ url: string; type: string; className?: string }>) {
    if (isVideoType(type)) {
        return <video src={url} className={className} muted loop playsInline controls />;
    }
    return <img src={url} alt="" className={className} />;
}

// ─── Create / Edit modal ──────────────────────────────────────────────────────
function AdFormModal({
    mode, initial, onClose, onSaved,
}: Readonly<{ mode: 'create' | 'edit'; initial?: InAppAd | null; onClose: () => void; onSaved: () => void }>) {
    const [title, setTitle] = useState(initial?.title || '');
    const [isActive, setIsActive] = useState<number>(initial ? Number(initial.is_active) : 1);
    const [sortOrder, setSortOrder] = useState<string>(initial?.sort_order || '0');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(initial?.url || null);
    const [previewType, setPreviewType] = useState<string>(initial?.media_type || 'image');
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const [checking, setChecking] = useState(false);

    const pickFile = async (f: File) => {
        const err = validateFile(f);
        if (err) { toast.error(err); return; }

        const isVideo = f.type.startsWith('video/');
        setChecking(true);
        try {
            if (isVideo) {
                const { w, h, duration } = await readVideoMeta(f);
                const dimErr = checkDimensions(w, h);
                if (dimErr) { toast.error(dimErr); return; }
                if (!(duration > 0 && duration <= 5)) {
                    toast.error(`Video must be between 1 and 5 seconds. This one is ${duration ? duration.toFixed(1) + 's' : 'unreadable'}.`);
                    return;
                }
            } else {
                const { w, h } = await readImageDimensions(f);
                const dimErr = checkDimensions(w, h);
                if (dimErr) { toast.error(dimErr); return; }
            }
            setFile(f);
            setPreview(URL.createObjectURL(f));
            setPreviewType(isVideo ? 'video' : 'image');
        } catch {
            toast.error('Could not read that media file. Please try another.');
        } finally {
            setChecking(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) { toast.error('Title is required'); return; }
        if (mode === 'create' && !file) { toast.error('Please select a media file'); return; }

        setSaving(true);
        try {
            let res;
            if (file) {
                const form = new FormData();
                if (mode === 'edit' && initial) form.append('id', String(initial.id));
                form.append('title', title.trim());
                form.append('is_active', String(isActive));
                form.append('sort_order', String(parseInt(sortOrder, 10) || 0));
                form.append('media', file);
                res = mode === 'edit'
                    ? await inAppAdsService.editWithMedia(form)
                    : await inAppAdsService.create(form);
            } else {
                // edit metadata only (JSON)
                res = await inAppAdsService.edit({
                    id: initial!.id,
                    title: title.trim(),
                    is_active: isActive,
                    sort_order: parseInt(sortOrder, 10) || 0,
                });
            }
            if (res.status) {
                toast.success(res.message || (mode === 'edit' ? 'Ad updated' : 'Ad created'));
                onSaved();
            } else {
                toast.error(res.message || 'Failed to save ad');
            }
        } catch (err: any) {
            console.error('Save ad error:', err);
            toast.error(err?.response?.data?.message || 'Failed to save ad');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
                    <h2 className="text-lg font-bold text-slate-900">{mode === 'edit' ? 'Edit Ad' : 'Create Ad'}</h2>
                    <button type="button" onClick={onClose} disabled={saving} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-50">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Start investing"
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-slate-300"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-700 block">Media {mode === 'edit' && <span className="text-slate-400 font-normal">(leave to keep current)</span>}</label>
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={checking}
                            className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-yellow-400 hover:bg-yellow-50/20 transition-all disabled:opacity-70"
                        >
                            {preview ? (
                                <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-900/5">
                                    <Media url={preview} type={previewType} className="w-full h-full object-contain" />
                                </div>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Upload size={18} className="text-slate-400" />
                                </div>
                            )}
                            <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                {checking ? (
                                    <><Loader2 size={14} className="animate-spin" /> Checking media…</>
                                ) : (
                                    <><span className="text-[#B8860B] font-semibold">Click to upload</span> landscape media</>
                                )}
                            </p>
                            <p className="text-xs text-slate-400 text-center">
                                JPG, PNG, WEBP, GIF (≤2MB) or MP4 (≤5MB, ≤5s). Width must exceed height.
                            </p>
                        </button>
                        <input ref={inputRef} type="file" accept={ACCEPT} className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 block">Sort order</label>
                            <input
                                type="number" min={0}
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
                            />
                            <p className="text-[11px] text-slate-400">Lower shows first</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 block">Status</label>
                            <select
                                value={isActive}
                                onChange={(e) => setIsActive(Number(e.target.value))}
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-yellow-400"
                            >
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-5 border-t border-slate-100 shrink-0">
                    <button type="button" onClick={onClose} disabled={saving}
                        className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                        Cancel
                    </button>
                    <button type="button" onClick={handleSave} disabled={saving}
                        className="px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] disabled:opacity-60 flex items-center gap-2">
                        {saving && <Loader2 size={15} className="animate-spin" />}
                        {saving ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create ad'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete modal ─────────────────────────────────────────────────────────────
function DeleteModal({ ad, deleting, onConfirm, onCancel }: Readonly<{ ad: InAppAd; deleting: boolean; onConfirm: () => void; onCancel: () => void }>) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
                <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="text-red-500" size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Delete ad?</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Delete <span className="font-semibold text-slate-700">{ad.title}</span> and its media? This cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button type="button" onClick={onCancel} disabled={deleting}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={deleting}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
                        {deleting && <Loader2 size={14} className="animate-spin" />}
                        {deleting ? 'Deleting...' : 'Yes, delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InAppAds() {
    const [ads, setAds] = useState<InAppAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<InAppAd | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<InAppAd | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchAds = async () => {
        setLoading(true);
        try {
            const res = await inAppAdsService.report({ page: 1, limit: 100 });
            if (res.status) {
                setAds(res.data?.items ?? []);
            } else {
                toast.error(res.message || 'Failed to load ads');
                setAds([]);
            }
        } catch (err) {
            console.error('Error fetching ads:', err);
            toast.error('Failed to load in-app ads');
            setAds([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAds(); }, []);

    const toggleActive = async (ad: InAppAd) => {
        setTogglingId(ad.id);
        try {
            const res = await inAppAdsService.edit({ id: ad.id, is_active: Number(ad.is_active) ? 0 : 1 });
            if (res.status) {
                toast.success(Number(ad.is_active) ? 'Ad hidden' : 'Ad activated');
                fetchAds();
            } else {
                toast.error(res.message || 'Failed to update ad');
            }
        } catch (err: any) {
            console.error('Toggle ad error:', err);
            toast.error(err?.response?.data?.message || 'Failed to update ad');
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await inAppAdsService.remove(deleteTarget.id);
            if (res.status) {
                toast.success(res.message || 'Ad deleted');
                setDeleteTarget(null);
                fetchAds();
            } else {
                toast.error(res.message || 'Failed to delete ad');
            }
        } catch (err: any) {
            console.error('Delete ad error:', err);
            toast.error(err?.response?.data?.message || 'Failed to delete ad');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">In-App Ads</h1>
                    <p className="text-sm text-slate-500">Manage the banners, GIFs and videos in the app carousel</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#9a7009] transition-colors shrink-0"
                >
                    <Plus size={16} /> Add Ad
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#B8860B]" size={40} />
                    <p className="text-slate-500 font-medium">Loading ads...</p>
                </div>
            ) : ads.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="text-slate-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No ads yet</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">Click <span className="font-semibold text-[#B8860B]">Add Ad</span> to create your first carousel item.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {ads.map((ad) => (
                        <div key={ad.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                            <div className="aspect-video bg-slate-900/5 relative">
                                <Media url={ad.url} type={ad.media_type} className="w-full h-full object-cover" />
                                <span className={cn(
                                    'absolute top-2 left-2 text-[11px] font-semibold px-2 py-0.5 rounded-full',
                                    Number(ad.is_active) ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                                )}>
                                    {Number(ad.is_active) ? 'Active' : 'Inactive'}
                                </span>
                                <span className="absolute top-2 right-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white flex items-center gap-1">
                                    {isVideoType(ad.media_type) ? <Film size={11} /> : <ImageIcon size={11} />}
                                    {ad.media_type}
                                </span>
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="text-sm font-bold text-slate-900 truncate">{ad.title}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Order {ad.sort_order} · {ad.width}×{ad.height}</p>
                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-50">
                                    <button
                                        type="button"
                                        onClick={() => toggleActive(ad)}
                                        disabled={togglingId === ad.id}
                                        className="flex-1 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                                    >
                                        {togglingId === ad.id && <Loader2 size={12} className="animate-spin" />}
                                        {Number(ad.is_active) ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button type="button" onClick={() => setEditing(ad)} title="Edit"
                                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-yellow-600 transition-colors">
                                        <Pencil size={15} />
                                    </button>
                                    <button type="button" onClick={() => setDeleteTarget(ad)} title="Delete"
                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <AdFormModal mode="create" onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); fetchAds(); }} />
            )}
            {editing && (
                <AdFormModal mode="edit" initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); fetchAds(); }} />
            )}
            {deleteTarget && (
                <DeleteModal ad={deleteTarget} deleting={deleting} onConfirm={handleDelete} onCancel={() => !deleting && setDeleteTarget(null)} />
            )}
        </div>
    );
}
