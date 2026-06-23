import { Search, Bell, Home, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function TopNav() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40 backdrop-blur-md bg-white/80">
            <div className="flex items-center gap-2 text-sm">
                <Home size={16} className="text-slate-400" />
                <ChevronRight size={14} className="text-slate-300" />
                {pathnames.map((value, index) => {
                    const isLast = index === pathnames.length - 1;
                    const label = value.charAt(0).toUpperCase() + value.slice(1);

                    return (
                        <div key={value} className="flex items-center gap-2">
                            <span className={isLast ? "text-slate-900 font-semibold" : "text-slate-400 font-medium"}>
                                {label}
                            </span>
                            {!isLast && <ChevronRight size={14} className="text-slate-300" />}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search here"
                        className="pl-10 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 transition-all placeholder:text-slate-400"
                    />
                </div>

                <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 border-2 border-white rounded-full"></span>
                </button>

                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 cursor-pointer hover:border-yellow-400 transition-colors">
                    <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                        alt="User"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
}
