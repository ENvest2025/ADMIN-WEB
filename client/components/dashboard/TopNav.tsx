import { useState } from 'react';
import { Search, Bell, Home, ChevronRight, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

// Stable "random" hue derived from the string, so a user's colour never changes.
const hueFromString = (s: string) =>
    [...s].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

export function TopNav({ onMenuClick }: Readonly<{ onMenuClick: () => void }>) {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);
    const { user } = useAuthStore();
    const [imgError, setImgError] = useState(false);

    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    const avatarSource = displayName || user?.email || '';
    const avatarInitial = (avatarSource.trim()[0] || '?').toUpperCase();
    const avatarBg = `hsl(${hueFromString(avatarSource)}, 60%, 45%)`;
    // Try the admin's image first; fall back to the coloured initial if it
    // can't load (bare default like "user.png", 404, etc.).
    const showAvatarImg = !!user?.image && !imgError;

    return (
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-40 backdrop-blur-md bg-white/80">
            <div className="flex items-center gap-2 text-sm min-w-0">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>
                <Home size={16} className="text-slate-400 shrink-0 hidden sm:block" />
                <ChevronRight size={14} className="text-slate-300 shrink-0 hidden sm:block" />
                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                    {pathnames.map((value, index) => {
                        const isLast = index === pathnames.length - 1;
                        const label = value.charAt(0).toUpperCase() + value.slice(1);

                        return (
                            <div key={value} className="flex items-center gap-2 min-w-0">
                                <span className={`truncate ${isLast ? "text-slate-900 font-semibold" : "text-slate-400 font-medium hidden sm:inline"}`}>
                                    {label}
                                </span>
                                {!isLast && <ChevronRight size={14} className="text-slate-300 shrink-0 hidden sm:block" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search here"
                        className="pl-10 pr-4 py-2 w-40 lg:w-64 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all placeholder:text-slate-400"
                    />
                </div>

                <button className="md:hidden relative p-2 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Search">
                    <Search size={20} />
                </button>

                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Notifications">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 border-2 border-white rounded-full"></span>
                </button>

                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden text-white text-sm font-bold cursor-pointer shrink-0 ring-1 ring-black/5 select-none"
                    style={{ backgroundColor: avatarBg }}
                    title={displayName || user?.email || 'Account'}
                >
                    {showAvatarImg ? (
                        <img
                            src={user!.image}
                            alt={displayName || 'Admin'}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        avatarInitial
                    )}
                </div>
            </div>
        </header>
    );
}
