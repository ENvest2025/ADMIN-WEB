import { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/pagination';
import { ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useKycList } from '@/hooks/useDashboard';
import { KycFilter, KycFilterValues } from '@/components/ui/KycFilter';

const ITEMS_PER_PAGE = 10;

interface KycTableRow {
    id: string;
    ID: string;
    NAME: string;
    email: string;
    progress: string;
    status: string;
    lastupdated: string;
}

const TABS = ['All', 'Pending', 'Approved', 'Declined'] as const;
type TabType = typeof TABS[number];

export default function KYCManagement() {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<TabType>('All');
    const [filters, setFilters] = useState<KycFilterValues>({
        status: '',
        start_date: '',
        end_date: '',
        id: '',
    });

    const apiPayload = useMemo(() => {
        let statusFilter = activeTab !== 'All' ? activeTab : '';
        if (filters.status) statusFilter = filters.status;

        return {
            email: '',
            status: statusFilter,
            limit: ITEMS_PER_PAGE,
            page: currentPage,
            start_date: filters.start_date || '2020-01-01',
            end_date: filters.end_date || '2030-12-31',
        };
    }, [activeTab, filters, currentPage]);

    const { data: response, isLoading, isError } = useKycList(apiPayload);

    const users: KycTableRow[] = (response?.data?.users || []).map(user => ({
        ...user,
        id: user.ID,
    }));

    const pagination = response?.data?.pagination;
    const totalPages = pagination?.last_page || 1;
    const totalItems = pagination?.total || 0;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getStatusStyle = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'approved') return 'text-green-600 font-semibold';
        if (s === 'declined') return 'text-red-500 font-semibold';
        if (s === 'pending') return 'bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold';
        return 'text-slate-500';
    };

    const columns = [
        {
            header: 'S/N',
            cell: (item: KycTableRow) =>
                users.indexOf(item) + 1 + (currentPage - 1) * ITEMS_PER_PAGE,
            className: 'pl-6 whitespace-nowrap',
        },
        { header: 'ID', accessorKey: 'ID' as const, className: 'whitespace-nowrap' },
        { header: 'Name', accessorKey: 'NAME' as const, className: 'whitespace-nowrap' },
        { header: 'Email address', accessorKey: 'email' as const, className: 'whitespace-nowrap' },
        {
            header: 'Progress',
            cell: (item: KycTableRow) => `Step ${item.progress}`,
            className: 'whitespace-nowrap',
        },
        {
            header: 'Status',
            cell: (item: KycTableRow) => (
                <span className={cn('text-xs', getStatusStyle(item.status))}>
                    {item.status}
                </span>
            ),
        },
        {
            header: 'Last updated',
            cell: (item: KycTableRow) => formatDate(item.lastupdated),
        },
        {
            header: 'Action',
            cell: (item: KycTableRow) => (
                <button
                    onClick={() => navigate(`/dashboard/kyc/${item.ID}`)}
                    className="w-8 h-8 rounded-full border border-[#B8860B] flex items-center justify-center text-[#B8860B] hover:bg-[#B8860B] hover:text-white transition-colors"
                >
                    <div className="w-2 h-2 rounded-full border-2 border-current" />
                </button>
            ),
            className: 'pr-6',
        },
    ];

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setCurrentPage(1);
        // Clear status filter when switching tabs so tab drives the filter
        setFilters(prev => ({ ...prev, status: '' }));
    };

    const handleFilterApply = (newFilters: KycFilterValues) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleFilterClear = () => {
        setFilters({ status: '', start_date: '', end_date: '', id: '' });
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <span
                    onClick={() => navigate('/dashboard')}
                    className="cursor-pointer hover:text-slate-900 transition-colors"
                >
                    Dashboard
                </span>
                <ChevronRight size={14} />
                <span className="font-semibold text-slate-900">KYC Management</span>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                {/* Tabs + Filter */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-8 border-b border-slate-100 w-full relative">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={cn(
                                    'pb-4 text-sm font-medium relative transition-colors',
                                    activeTab === tab
                                        ? 'text-[#B8860B]'
                                        : 'text-slate-500 hover:text-slate-900'
                                )}
                            >
                                {tab}
                                {tab === 'All' && (
                                    <span
                                        className={cn(
                                            'ml-2 px-2 py-0.5 rounded-full text-xs',
                                            activeTab === tab
                                                ? 'bg-[#B8860B]/10 text-[#B8860B]'
                                                : 'bg-slate-100 text-slate-500'
                                        )}
                                    >
                                        {totalItems}
                                    </span>
                                )}
                                {activeTab === tab && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#B8860B]" />
                                )}
                            </button>
                        ))}

                        <div className="absolute right-0 top-0 -mt-2">
                            <KycFilter
                                onApply={handleFilterApply}
                                onClear={handleFilterClear}
                                initialValues={filters}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : isError ? (
                    <div className="text-center py-16 text-slate-500">
                        Failed to load KYC data
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-16 text-slate-500">
                        No KYC records found
                    </div>
                ) : (
                    <>
                        <DataTable data={users} columns={columns} />
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            className="mt-6"
                        />
                    </>
                )}
            </div>
        </div>
    );
}