import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dashboardService, Client } from '@/lib/api/dashboardService';
import { toast } from 'sonner';

type UserStatus = 'Active' | 'Suspended' | 'Deactivated';



type ModalType = 'suspend' | 'unsuspend' | 'delete' | null;

interface ConfirmModalProps {
    type: ModalType;
    userName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmModal({ type, userName, onConfirm, onCancel }: ConfirmModalProps) {
    const config = {
        suspend: {
            title: 'Suspend user?',
            message: `Are you sure you want to suspend ${userName}?`,
            confirmText: 'Yes, suspend',
        },
        unsuspend: {
            title: 'Un-suspend user',
            message: `Are you sure you want to un-suspend ${userName}?`,
            confirmText: 'Yes, un-suspend',
        },
        delete: {
            title: 'Delete account',
            message: `Are you sure you want to delete ${userName}?`,
            confirmText: 'Yes, delete',
        },
    };

    if (!type) return null;
    const { title, message, confirmText } = config[type];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
                <div className="w-12 h-12 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center mx-auto mb-4">
                    <span className="text-yellow-500 text-xl">⚠️</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">{title}</h2>
                <p className="text-sm text-slate-500 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-medium hover:bg-[#9a7009] transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: UserStatus }) {
    return (
        <span className={cn(
            "text-xs font-semibold",
            status === 'Active' && "text-emerald-500",
            status === 'Suspended' && "text-yellow-600",
            status === 'Deactivated' && "text-red-500",
        )}>
            {status}
        </span>
    );
}

function ActionsDropdown({
    user,
    onAction,
}: {
    user: Client;
    onAction: (action: 'view' | 'suspend' | 'unsuspend' | 'delete', user: Client) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
                <MoreVertical size={16} />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-8 z-20 bg-white border border-slate-100 rounded-xl shadow-xl py-1 w-44 overflow-hidden">
                        {[
                            { label: 'View user', action: 'view' as const },
                            { label: 'Suspend user', action: 'suspend' as const },
                            { label: 'Un-suspend user', action: 'unsuspend' as const },
                            { label: 'Delete account', action: 'delete' as const, danger: true },
                        ].map(({ label, action, danger }) => (
                            <button
                                key={action}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                    onAction(action, user);
                                }}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 text-sm transition-colors",
                                    danger
                                        ? "text-red-500 hover:bg-red-50"
                                        : "text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function UserManagement() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [modal, setModal] = useState<{ type: ModalType; user: Client | null }>({ type: null, user: null });

    const fetchUsers = async (page: number) => {
        setLoading(true);
        try {
            const response = await dashboardService.fetchClients({
                page,
                limit: 10,
            });
            if (response.status) {
                setUsers(response.data.users);
                setTotalPages(response.data.total_pages);
                setTotalUsers(response.data.total);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.clientID.includes(search)
    );

    const handleAction = (action: 'view' | 'suspend' | 'unsuspend' | 'delete', user: Client) => {
        if (action === 'view') {
            navigate(`/dashboard/users/${user.clientID}`);
        } else {
            setModal({ type: action as ModalType, user });
        }
    };

    const handleConfirm = () => {
        if (!modal.user) return;
        // API call to suspend/delete would go here
        toast.info(`Action ${modal.type} triggered for ${modal.user.name}`);
        setModal({ type: null, user: null });
    };

    // Simple pagination range
    const getPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i <= 3 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-slate-900">All users</h1>
                    <span className="px-2.5 py-0.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold rounded-full">
                        {totalUsers.toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <Filter size={15} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100">
                            {['S/N', 'Name', 'Email address', 'ID', 'Phone number', 'Status', 'Last login', ''].map((col) => (
                                <th key={col} className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider first:w-12">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-5 py-4 text-center text-sm text-slate-400">Loading users...</td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-5 py-4 text-center text-sm text-slate-400">No users found</td>
                            </tr>
                        ) : (
                            filtered.map((user, index) => (
                                <tr
                                    key={user.clientID}
                                    onClick={() => navigate(`/dashboard/users/${user.clientID}`)}
                                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                                >
                                    <td className="px-5 py-4 text-sm text-slate-400">{(currentPage - 1) * 10 + index + 1}</td>
                                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">{user.name}</td>
                                    <td className="px-5 py-4 text-sm text-slate-500">{user.email}</td>
                                    <td className="px-5 py-4 text-sm text-slate-500 font-mono">{user.clientID}</td>
                                    <td className="px-5 py-4 text-sm text-slate-500">{user.phone}</td>
                                    <td className="px-5 py-4"><StatusBadge status={user.status as any} /></td>
                                    <td className="px-5 py-4 text-sm text-slate-400">{user.last_login}</td>
                                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                        <ActionsDropdown user={user as any} onAction={handleAction as any} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                    <span className="text-sm text-slate-400">Page {currentPage} of {totalPages}</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {getPageNumbers().map((p, i) => (
                            <button
                                key={i}
                                onClick={() => typeof p === 'number' && setCurrentPage(p)}
                                className={cn(
                                    "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                                    p === currentPage
                                        ? "bg-[#B8860B] text-white"
                                        : p === '...'
                                            ? "text-slate-300 cursor-default"
                                            : "text-slate-500 hover:bg-slate-100"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        Go to page
                        <input
                            type="number"
                            min={1}
                            max={totalPages}
                            defaultValue={currentPage}
                            onBlur={(e) => setCurrentPage(Math.min(totalPages, Math.max(1, Number(e.target.value))))}
                            className="w-14 text-center border border-slate-200 rounded-lg py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
                        />
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {modal.type && modal.user && (
                <ConfirmModal
                    type={modal.type}
                    userName={modal.user.name}
                    onConfirm={handleConfirm}
                    onCancel={() => setModal({ type: null, user: null })}
                />
            )}
        </div>
    );
}