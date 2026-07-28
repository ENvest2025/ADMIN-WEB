import { useEffect, useMemo, useState } from 'react';
import {
    Search,
    Loader2,
    Info,
    ChevronLeft,
    ChevronRight,
    Check,
    X,
    Clock,
    RefreshCcw,
    DollarSign,
    Calendar,
    Mail,
    Hash,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { requestsService } from '@/lib/api/requestsService';
import {
    InvestmentRequest,
    TakeActionOnRequestPayload,
} from '@shared/api';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const PAGE_SIZE = 50;

const REQUEST_TYPE_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
    liquidate: {
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: DollarSign,
        label: 'Liquidate',
    },
    rollover: {
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: RefreshCcw,
        label: 'Rollover',
    },
};

const ADMIN_STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
    pending: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Clock,
        label: 'Pending',
    },
    approved: {
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
        label: 'Approved',
    },
    rejected: {
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        label: 'Rejected',
    },
};

type ActionKind = 'approve' | 'reject';

const formatCurrency = (currency: string, value: string) => {
    const num = parseFloat(value || '0');
    return `${currency} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value: string | null) => {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });
};

export default function InvestmentRequests() {
    const [requests, setRequests] = useState<InvestmentRequest[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [requestType, setRequestType] = useState<'all' | 'liquidate' | 'rollover'>('all');
    const [adminStatus, setAdminStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [page, setPage] = useState(0);

    const [selected, setSelected] = useState<InvestmentRequest | null>(null);
    const [action, setAction] = useState<ActionKind | null>(null);
    const [rolloverDays, setRolloverDays] = useState<string>('365');
    const [submitting, setSubmitting] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await requestsService.viewAllRequests({
                limit: PAGE_SIZE,
                offset: page * PAGE_SIZE,
                request: requestType === 'all' ? undefined : requestType,
                adminStatus: adminStatus === 'all' ? undefined : adminStatus,
                search: searchTerm || undefined,
            });

            if (response.status) {
                setRequests(response.data?.requests ?? []);
                setTotal(response.data?.total ?? 0);
            } else {
                toast.error(response.message || 'Failed to fetch requests');
                setRequests([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Error fetching investment requests:', error);
            toast.error('An error occurred while fetching requests');
            setRequests([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, requestType, adminStatus, searchTerm]);

    // Client-side search fallback so users see immediate filtering
    // even if the backend ignores the `search` parameter.
    const visibleRequests = useMemo(() => {
        if (!searchTerm) return requests;
        const q = searchTerm.toLowerCase();
        return requests.filter((r) =>
            [
                r.client_fname,
                r.client_lname,
                `${r.client_fname} ${r.client_lname}`,
                r.client_email,
                r.trnx_id,
                String(r.client_account_id),
            ]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [requests, searchTerm]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setSearchTerm(searchInput.trim());
    };

    const openAction = (req: InvestmentRequest, kind: ActionKind) => {
        setSelected(req);
        setAction(kind);
        setRolloverDays('365');
    };

    const closeAction = () => {
        if (submitting) return;
        setSelected(null);
        setAction(null);
    };

    const submitAction = async () => {
        if (!selected || !action) return;

        const payload: TakeActionOnRequestPayload = {
            request_id: selected.request_id,
            action,
        };

        if (action === 'approve' && selected.request === 'rollover') {
            const days = parseInt(rolloverDays, 10);
            if (Number.isNaN(days) || days <= 0) {
                toast.error('Enter a valid number of rollover days');
                return;
            }
            if (days !== 365) {
                payload.rollover_days = days;
            }
        }

        setSubmitting(true);
        try {
            const response = await requestsService.takeActionOnRequest(payload);
            if (response.status) {
                toast.success(
                    response.message ||
                        `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
                );
                setSelected(null);
                setAction(null);
                fetchRequests();
            } else {
                toast.error(response.message || 'Action failed');
            }
        } catch (err: any) {
            console.error('takeActionOnRequest error:', err);
            toast.error(err?.response?.data?.message || 'Action failed');
        } finally {
            setSubmitting(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Roll Over / Liquidation
                    </h1>
                    <p className="text-sm sm:text-base text-slate-500">
                        Review and action client liquidation & rollover requests
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                    <span className="font-semibold text-slate-900">{total}</span>
                    <span>total requests</span>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-3 sm:p-4">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-end"
                    >
                        <div className="relative flex-1 min-w-0">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={18}
                            />
                            <Input
                                placeholder="Search by client name, email or transaction ID..."
                                className="pl-10"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 lg:gap-4 lg:flex">
                            <div className="w-full lg:w-44">
                                <Label className="text-xs text-slate-500 mb-1.5 block">
                                    Request type
                                </Label>
                                <Select
                                    value={requestType}
                                    onValueChange={(v) => {
                                        setPage(0);
                                        setRequestType(v as any);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All types</SelectItem>
                                        <SelectItem value="liquidate">Liquidate</SelectItem>
                                        <SelectItem value="rollover">Rollover</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full lg:w-44">
                                <Label className="text-xs text-slate-500 mb-1.5 block">
                                    Admin status
                                </Label>
                                <Select
                                    value={adminStatus}
                                    onValueChange={(v) => {
                                        setPage(0);
                                        setAdminStatus(v as any);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="bg-[#B8860B] hover:bg-[#966d09] text-white h-10 w-full lg:w-auto"
                        >
                            Search
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#B8860B]" size={40} />
                    <p className="text-slate-500 font-medium">Fetching requests...</p>
                </div>
            ) : visibleRequests.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="text-slate-400" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">No requests found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        We couldn't find any liquidation or rollover requests matching the
                        current filters.
                    </p>
                </div>
            ) : (
                <>
                    {/* Card list (< xl) — sidebar eats 256px so we keep cards until there's real room */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xl:hidden">
                        {visibleRequests.map((req) => {
                            const typeKey = (req.request || '').toLowerCase();
                            const statusKey = (req.adminStatus || '').toLowerCase();
                            const typeCfg =
                                REQUEST_TYPE_CONFIG[typeKey] || REQUEST_TYPE_CONFIG.liquidate;
                            const statusCfg =
                                ADMIN_STATUS_CONFIG[statusKey] || ADMIN_STATUS_CONFIG.pending;
                            const TypeIcon = typeCfg.icon;
                            const StatusIcon = statusCfg.icon;
                            const isPending = statusKey === 'pending';

                            return (
                                <Card
                                    key={req.request_id}
                                    className="border-slate-100 shadow-sm"
                                >
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="font-semibold text-slate-900 truncate">
                                                    {req.client_fname} {req.client_lname}
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                                                    <Mail size={11} className="shrink-0" />
                                                    <span className="truncate">{req.client_email}</span>
                                                </div>
                                            </div>
                                            <Badge
                                                className={cn(
                                                    'px-2 py-0.5 font-semibold capitalize border shrink-0',
                                                    statusCfg.color
                                                )}
                                            >
                                                <StatusIcon size={11} className="mr-1" />
                                                {statusCfg.label}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                            <Badge
                                                className={cn(
                                                    'px-2 py-0.5 font-semibold capitalize border',
                                                    typeCfg.color
                                                )}
                                            >
                                                <TypeIcon size={11} className="mr-1" />
                                                {typeCfg.label}
                                            </Badge>
                                            <span className="font-mono text-slate-500 flex items-center gap-1 truncate">
                                                <Hash size={11} className="text-slate-400 shrink-0" />
                                                <span className="truncate">{req.trnx_id}</span>
                                            </span>
                                        </div>

                                        <div className="text-sm">
                                            <div className="font-medium text-slate-800 line-clamp-1">
                                                {req.product_name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                ROI {req.roi_percentage}%
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-1">
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                                    Amount
                                                </div>
                                                <div className="text-sm font-semibold text-slate-800">
                                                    {formatCurrency(req.currency, req.amount_invested)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                                    Current
                                                </div>
                                                <div className="text-sm font-semibold text-[#B8860B]">
                                                    {formatCurrency(req.currency, req.current_amount)}
                                                </div>
                                                <div className="text-[10px] text-emerald-600">
                                                    +{formatCurrency(req.currency, req.accrued_interest)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={11} className="text-slate-400" />
                                                <span>Req {formatDate(req.request_date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={11} className="text-slate-400" />
                                                <span>Due {formatDate(req.due_date)}</span>
                                            </div>
                                        </div>

                                        {isPending ? (
                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                <Button
                                                    size="sm"
                                                    className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                                                    onClick={() => openAction(req, 'approve')}
                                                >
                                                    <Check size={14} className="mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-9 w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => openAction(req, 'reject')}
                                                >
                                                    <X size={14} className="mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-slate-400 text-center pt-1">
                                                No actions available
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Desktop table (xl+) — only shown when there's real horizontal room */}
                    <Card className="border-slate-100 shadow-sm overflow-hidden hidden xl:block">
                        <div className="overflow-x-auto">
                            <Table className="min-w-[1100px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
                                <TableHeader>
                                    <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                                        <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Client</TableHead>
                                        <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Product</TableHead>
                                        <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Type</TableHead>
                                        <TableHead className="font-semibold text-slate-600 text-right whitespace-nowrap">Amount</TableHead>
                                        <TableHead className="font-semibold text-slate-600 text-right whitespace-nowrap">Current Value</TableHead>
                                        <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Requested</TableHead>
                                        <TableHead className="font-semibold text-slate-600 whitespace-nowrap">Status</TableHead>
                                        <TableHead className="font-semibold text-slate-600 text-right whitespace-nowrap">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleRequests.map((req) => {
                                        const typeKey = (req.request || '').toLowerCase();
                                        const statusKey = (req.adminStatus || '').toLowerCase();
                                        const typeCfg =
                                            REQUEST_TYPE_CONFIG[typeKey] || REQUEST_TYPE_CONFIG.liquidate;
                                        const statusCfg =
                                            ADMIN_STATUS_CONFIG[statusKey] || ADMIN_STATUS_CONFIG.pending;
                                        const TypeIcon = typeCfg.icon;
                                        const StatusIcon = statusCfg.icon;
                                        const isPending = statusKey === 'pending';

                                        return (
                                            <TableRow
                                                key={req.request_id}
                                                className="hover:bg-slate-50/40"
                                            >
                                                <TableCell className="max-w-[220px]">
                                                    <div className="font-semibold text-slate-900 truncate">
                                                        {req.client_fname} {req.client_lname}
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1 truncate">
                                                        <Mail size={11} className="shrink-0" />
                                                        <span className="truncate">{req.client_email}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                                        <Hash size={11} className="shrink-0" />
                                                        <span className="font-mono truncate">{req.trnx_id}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[220px]">
                                                    <div className="font-medium text-slate-800 text-sm truncate">
                                                        {req.product_name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 whitespace-nowrap">
                                                        ROI {req.roi_percentage}%
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <Badge
                                                        className={cn(
                                                            'px-2.5 py-0.5 font-semibold capitalize border whitespace-nowrap',
                                                            typeCfg.color
                                                        )}
                                                    >
                                                        <TypeIcon size={12} className="mr-1.5 shrink-0" />
                                                        {typeCfg.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-slate-800 whitespace-nowrap">
                                                    {formatCurrency(req.currency, req.amount_invested)}
                                                </TableCell>
                                                <TableCell className="text-right whitespace-nowrap">
                                                    <div className="font-semibold text-[#B8860B]">
                                                        {formatCurrency(req.currency, req.current_amount)}
                                                    </div>
                                                    <div className="text-[11px] text-emerald-600">
                                                        +{formatCurrency(req.currency, req.accrued_interest)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <div className="text-sm text-slate-700 flex items-center gap-1.5">
                                                        <Calendar size={12} className="text-slate-400" />
                                                        {formatDate(req.request_date)}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        Due {formatDate(req.due_date)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    <Badge
                                                        className={cn(
                                                            'px-2.5 py-0.5 font-semibold capitalize border whitespace-nowrap',
                                                            statusCfg.color
                                                        )}
                                                    >
                                                        <StatusIcon size={12} className="mr-1.5 shrink-0" />
                                                        {statusCfg.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right whitespace-nowrap">
                                                    {isPending ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                onClick={() => openAction(req, 'approve')}
                                                            >
                                                                <Check size={14} className="mr-1" />
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                onClick={() => openAction(req, 'reject')}
                                                            >
                                                                <X size={14} className="mr-1" />
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">—</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </>
            )}

            {/* Pagination */}
            {total > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <p className="text-xs sm:text-sm text-slate-500 font-medium text-center sm:text-left">
                        Page {page + 1} of {totalPages} · {total} total
                    </p>
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                            className="h-9 px-3 w-full sm:w-auto"
                        >
                            <ChevronLeft size={16} className="mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page + 1 >= totalPages || loading}
                            className="h-9 px-3 w-full sm:w-auto"
                        >
                            Next
                            <ChevronRight size={16} className="ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            <Dialog open={!!selected && !!action} onOpenChange={(open) => !open && closeAction()}>
                <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
                    {selected && action && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-lg sm:text-xl font-bold capitalize">
                                    {action} {selected.request} request
                                </DialogTitle>
                                <DialogDescription>
                                    Confirm this action for{' '}
                                    <span className="font-semibold text-slate-700">
                                        {selected.client_fname} {selected.client_lname}
                                    </span>
                                    .
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3 rounded-lg bg-slate-50 p-3 sm:p-4 text-sm">
                                <div className="flex justify-between gap-3">
                                    <span className="text-slate-500 shrink-0">Transaction</span>
                                    <span className="font-mono text-slate-800 truncate text-right">
                                        {selected.trnx_id}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-slate-500 shrink-0">Product</span>
                                    <span className="font-medium text-slate-800 text-right line-clamp-2">
                                        {selected.product_name}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-slate-500 shrink-0">Amount invested</span>
                                    <span className="font-semibold text-slate-800 text-right">
                                        {formatCurrency(selected.currency, selected.amount_invested)}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-slate-500 shrink-0">Current value</span>
                                    <span className="font-semibold text-[#B8860B] text-right">
                                        {formatCurrency(selected.currency, selected.current_amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-slate-500 shrink-0">Due date</span>
                                    <span className="text-slate-700 text-right">
                                        {formatDate(selected.due_date)}
                                    </span>
                                </div>
                            </div>

                            {action === 'approve' && selected.request === 'rollover' && (
                                <div className="space-y-2">
                                    <Label htmlFor="rollover_days" className="text-sm font-medium">
                                        Rollover duration (days)
                                    </Label>
                                    <Input
                                        id="rollover_days"
                                        type="number"
                                        min={1}
                                        value={rolloverDays}
                                        onChange={(e) => setRolloverDays(e.target.value)}
                                        placeholder="365"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Defaults to 365 days. Change to set a custom rollover period.
                                    </p>
                                </div>
                            )}

                            {action === 'reject' && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-3">
                                    The client will be notified that this request has been rejected.
                                </p>
                            )}

                            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                                <Button
                                    variant="outline"
                                    onClick={closeAction}
                                    disabled={submitting}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submitAction}
                                    disabled={submitting}
                                    className={cn(
                                        'text-white w-full sm:w-auto',
                                        action === 'approve'
                                            ? 'bg-emerald-600 hover:bg-emerald-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    )}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={16} className="mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : action === 'approve' ? (
                                        <>
                                            <Check size={16} className="mr-2" />
                                            Confirm Approve
                                        </>
                                    ) : (
                                        <>
                                            <X size={16} className="mr-2" />
                                            Confirm Reject
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
