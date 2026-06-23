import { DataTable } from '@/components/ui/DataTable';
import { cn } from '@/lib/utils';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKycList } from '@/hooks/useDashboard';

// Transform API data to match DataTable requirements
interface KycTableRow {
    id: string;
    ID: string;
    NAME: string;
    email: string;
    progress: string;
    status: string;
    lastupdated: string;
}

export function RecentKYC() {
    const navigate = useNavigate();
    const { data: response, isLoading, isError } = useKycList({
        limit: 5,
        page: 1,
        start_date: "2025-01-01",
        end_date: "2026-12-31"
    });

    // Transform data to add lowercase 'id' for DataTable
    const users: KycTableRow[] = (response?.data?.users || []).map(user => ({
        ...user,
        id: user.ID // Add lowercase id for DataTable key
    }));

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusColor = (status: string) => {
        if (status === 'Fully Verified') return "bg-green-50 text-green-500";
        if (status.includes('Level')) return "bg-blue-50 text-blue-500";
        return "bg-yellow-50 text-yellow-500";
    };

    const columns = [
        {
            header: 'S/N',
            cell: (_item: KycTableRow) => users.indexOf(_item) + 1,
            className: "pl-6 whitespace-nowrap w-20"
        },
        { header: 'ID', accessorKey: 'ID' as const },
        { header: 'Name', accessorKey: 'NAME' as const },
        { header: 'Email address', accessorKey: 'email' as const },
        { header: 'Progress', accessorKey: 'progress' as const },
        {
            header: 'Status',
            cell: (item: KycTableRow) => (
                <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    getStatusColor(item.status)
                )}>
                    {item.status}
                </span>
            )
        },
        {
            header: 'Last updated',
            cell: (item: KycTableRow) => formatDate(item.lastupdated)
        },
        {
            header: 'Action',
            cell: () => (
                <button className="w-8 h-8 rounded-full border border-[#B8860B] flex items-center justify-center text-[#B8860B] hover:bg-[#B8860B] hover:text-white transition-colors">
                    <div className="w-2 h-2 rounded-full border-2 border-current"></div>
                </button>
            ),
            className: "pr-6"
        }
    ];

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">KYC Management</h3>
                <button
                    onClick={() => navigate('/dashboard/kyc')}
                    className="text-[#B8860B] text-sm font-bold flex items-center gap-1 hover:underline"
                >
                    View all <ChevronRight size={16} />
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
            ) : isError ? (
                <div className="text-center py-8 text-slate-500">Failed to load KYC data</div>
            ) : users.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No KYC records found</div>
            ) : (
                <DataTable
                    data={users}
                    columns={columns}
                />
            )}
        </div>
    );
}

