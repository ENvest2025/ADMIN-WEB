import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Eye, 
    RefreshCcw,
    ChevronLeft, 
    ChevronRight, 
    Loader2,
    Calendar,
    DollarSign,
    User,
    CheckCircle2,
    Clock,
    XCircle,
    TrendingUp,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { investmentService } from '@/lib/api/investmentService';
import { Investment } from '@shared/api';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
    'pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending' },
    'active': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Active' },
    'matured': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: TrendingUp, label: 'Matured' },
    'liquidated': { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: DollarSign, label: 'Liquidated' },
    'cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
    'rollover': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: RefreshCcw, label: 'Rollover' },
};

export default function UserInvestments() {
    const navigate = useNavigate();
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(10);

    const fetchInvestments = async () => {
        setLoading(true);
        try {
            const response = await investmentService.pullInvestments({
                type: '', 
                search: searchTerm || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
                start: currentPage * pageSize,
                length: pageSize,
                order_column: 'created_at',
                order_dir: 'DESC'
            });
            
            if (response.status) {
                setInvestments(response.data);
            } else {
                toast.error(response.message || 'Failed to fetch investments');
            }
        } catch (error) {
            console.error('Error fetching investments:', error);
            toast.error('An error occurred while fetching investments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvestments();
    }, [currentPage, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchInvestments();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Investments</h1>
                    <p className="text-slate-500">Manage and track all user investment activities</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input 
                                placeholder="Search by name, email or client ID..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="matured">Matured</SelectItem>
                                    <SelectItem value="liquidated">Liquidated</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="rollover">Rollover</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="bg-[#B8860B] hover:bg-[#966d09] text-white">
                            Search
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Investment Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#B8860B]" size={40} />
                    <p className="text-slate-500 font-medium">Fetching investments...</p>
                </div>
            ) : investments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="text-slate-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No investments found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any investments matching your current filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {investments.map((investment) => {
                        const status = STATUS_CONFIG[investment.status.toLowerCase()] || STATUS_CONFIG['pending'];
                        const StatusIcon = status.icon;
                        
                        return (
                            <Card key={investment.investment_id} className="group hover:border-[#B8860B]/30 transition-all duration-300 shadow-sm overflow-hidden border-slate-100 flex flex-col">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className={cn("px-2.5 py-0.5 font-semibold capitalize border", status.color)}>
                                            <StatusIcon size={12} className="mr-1.5" />
                                            {status.label}
                                        </Badge>
                                        <span className="text-xs text-slate-400 font-mono">{investment.transaction_id}</span>
                                    </div>
                                    <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">{investment.full_name}</CardTitle>
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                        <User size={14} />
                                        <span>{investment.userID}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 py-4 flex-1">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Product</p>
                                            <p className="text-sm font-semibold text-slate-800 line-clamp-1">{investment.product_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Amount Paid</p>
                                            <p className="text-sm font-bold text-[#B8860B]">
                                                {investment.currency} {parseFloat(investment.amount_paid).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">ROI</p>
                                            <p className="text-sm font-semibold text-slate-800">{investment.roi_percentage}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Maturity Date</p>
                                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                <Calendar size={13} />
                                                <span>{new Date(investment.maturity_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4">
                                    <Button 
                                        variant="outline" 
                                        className="w-full text-xs font-bold gap-2 h-10 border-slate-200 hover:bg-[#B8860B] hover:text-white hover:border-[#B8860B] transition-all duration-300"
                                        onClick={() => navigate(`/dashboard/user-investments/${investment.investment_id}`, { state: { investment } })}
                                    >
                                        <Eye size={16} />
                                        View Details
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {investments.length > 0 && (
                <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-slate-500 font-medium">
                        Showing page {currentPage + 1}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="h-9 px-3"
                        >
                            <ChevronLeft size={16} className="mr-1" />
                            Previous
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={investments.length < pageSize}
                            className="h-9 px-3"
                        >
                            Next
                            <ChevronRight size={16} className="ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
