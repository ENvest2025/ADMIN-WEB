import {
    LayoutDashboard,
    UserCheck,
    Users,
    ArrowRightLeft,
    Wallet,
    Briefcase,
    TrendingUp,
    PieChart,
    BookOpen,
    HelpCircle,
    Settings,
    LogOut,
    Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/lib/api/authService';

const menuItems = [
    {
        group: 'Overview', items: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            { name: 'KYC Management', icon: UserCheck, path: '/dashboard/kyc' },
            { name: 'User Management', icon: Users, path: '/dashboard/users' },
        ]
    },
    {
        group: 'Finances', items: [
            { name: 'Transactions', icon: ArrowRightLeft, path: '/dashboard/transactions', count: 10 },
            { name: 'Withdrawals', icon: Wallet, path: '/dashboard/withdrawals' },
            { name: 'Investment Products', icon: Briefcase, path: '/dashboard/investments', count: 10 },
            { name: 'Investments', icon: TrendingUp, path: '/dashboard/user-investments' },
            { name: 'Roll Over / Liquidation', icon: Inbox, path: '/dashboard/requests' },
            { name: 'Portfolio management', icon: PieChart, path: '/dashboard/portfolio' },
        ]
    },
    {
        group: 'Administration', items: [
            { name: 'Learn', icon: BookOpen, path: '/dashboard/learn' },
            { name: 'Support', icon: HelpCircle, path: '/dashboard/support' },
            { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
        ]
    }
];

export function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-[#0A0E1A] text-slate-400 flex flex-col h-screen fixed left-0 top-0 z-50">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-yellow-500">EnVest</h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-8 scrollbar-hide">
                {menuItems.map((group) => (
                    <div key={group.group} className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 px-2">
                            {group.group}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => navigate(item.path)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                                            isActive
                                                ? "bg-[#B8860B] text-white"
                                                : "hover:bg-slate-800/50 hover:text-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className={cn(
                                                isActive ? "text-white" : "text-slate-500 group-hover:text-white transition-colors"
                                            )} />
                                            <span>{item.name}</span>
                                        </div>
                                        {item.count !== undefined && (
                                            <span className={cn(
                                                "text-[10px] px-2 py-0.5 rounded-full font-bold",
                                                isActive ? "bg-white text-[#B8860B]" : "bg-white/10 text-white"
                                            )}>
                                                {item.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-900 font-bold">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white truncate max-w-[120px]">
                                {user?.firstName} {user?.lastName}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                {user?.email}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
