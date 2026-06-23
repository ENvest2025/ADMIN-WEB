import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Calendar, 
    DollarSign, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    TrendingUp, 
    RefreshCcw,
    User,
    Mail,
    Phone,
    Briefcase,
    Globe,
    CreditCard,
    BarChart3,
    Info
} from 'lucide-react';
import { Investment } from '@shared/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { investmentService } from '@/lib/api/investmentService';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
    'pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Pending' },
    'active': { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Active' },
    'matured': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: TrendingUp, label: 'Matured' },
    'liquidated': { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: DollarSign, label: 'Liquidated' },
    'cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Cancelled' },
    'rollover': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: RefreshCcw, label: 'Rollover' },
};

export default function UserInvestmentDetail() {
    const { investmentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [investment, setInvestment] = useState<Investment | null>(location.state?.investment || null);
    const [loading, setLoading] = useState(!investment);

    // Status Modal State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!investment && investmentId) {
            // If data wasn't passed via state, fetch it
            // Note: The API doesn't have a specific getDetail endpoint according to the request,
            // but we can search for it in the pullInvestments list if needed.
            // For now, assume it's passed via state or handled by the list fetch logic.
            const fetchDetail = async () => {
                setLoading(true);
                try {
                    const response = await investmentService.pullInvestments({
                        type: '',
                        search: investmentId, // Assuming we can search by ID
                        start: 0,
                        length: 1,
                        order_column: 'created_at',
                        order_dir: 'DESC'
                    });
                    if (response.status && response.data.length > 0) {
                        setInvestment(response.data[0]);
                    } else {
                        toast.error('Investment not found');
                        navigate('/dashboard/user-investments');
                    }
                } catch (error) {
                    toast.error('Failed to load investment details');
                } finally {
                    setLoading(false);
                }
            };
            fetchDetail();
        }
    }, [investmentId, investment, navigate]);

    const openStatusModal = () => {
        if (!investment) return;
        setNewStatus(investment.status);
        setIsStatusModalOpen(true);
        setIsConfirming(false);
    };

    const handleStatusUpdate = async () => {
        if (!investment || !newStatus) return;

        setIsUpdating(true);
        try {
            const response = await investmentService.changeInvestmentStatus({
                tnx_id: investment.transaction_id,
                newstatus: newStatus
            });

            if (response.status) {
                toast.success('Status updated successfully');
                setIsStatusModalOpen(false);
                // Update local state
                setInvestment({ ...investment, status: newStatus });
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('An error occurred while updating status');
        } finally {
            setIsUpdating(false);
            setIsConfirming(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B8860B]"></div>
                <p className="text-slate-500">Loading investment details...</p>
            </div>
        );
    }

    if (!investment) return null;

    const status = STATUS_CONFIG[investment.status.toLowerCase()] || STATUS_CONFIG['pending'];
    const StatusIcon = status.icon;

    const infoGroups = [
        {
            title: 'User Information',
            icon: User,
            items: [
                { label: 'Full Name', value: investment.full_name, icon: User },
                { label: 'User ID', value: investment.userID, icon: Globe },
                { label: 'Email', value: investment.email, icon: Mail },
                { label: 'Phone', value: investment.phone, icon: Phone },
            ]
        },
        {
            title: 'Investment Product',
            icon: Briefcase,
            items: [
                { label: 'Product Name', value: investment.product_name, icon: Briefcase },
                { label: 'Product Type', value: investment.product_type, icon: BarChart3 },
                { label: 'Transaction ID', value: investment.transaction_id, icon: CreditCard },
                { label: 'Currency', value: investment.currency, icon: Globe },
            ]
        },
        {
            title: 'Financial Details',
            icon: DollarSign,
            items: [
                { label: 'Amount Paid', value: `${investment.currency} ${parseFloat(investment.amount_paid).toLocaleString()}`, icon: DollarSign },
                { label: 'ROI Percentage', value: `${investment.roi_percentage}%`, icon: TrendingUp },
                { label: 'Expected Return', value: `${investment.currency} ${parseFloat(investment.total_expected_return).toLocaleString()}`, icon: CheckCircle2 },
                { label: 'Daily Interest', value: `${investment.currency} ${parseFloat(investment.daily_interest).toLocaleString()}`, icon: Clock },
            ]
        },
        {
            title: 'Timeline & Status',
            icon: Calendar,
            items: [
                { label: 'Start Date', value: new Date(investment.start_date).toLocaleDateString(), icon: Calendar },
                { label: 'Maturity Date', value: new Date(investment.maturity_date).toLocaleDateString(), icon: Calendar },
                { label: 'Duration', value: `${investment.duration_days} Days`, icon: Clock },
                { label: 'Status', value: investment.status.toUpperCase(), icon: StatusIcon, badge: true },
            ]
        }
    ];

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => navigate('/dashboard/user-investments')}
                    className="rounded-full hover:bg-slate-100"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-slate-900">Investment Details</h1>
                        <Badge className={cn("px-2.5 py-0.5 capitalize border", status.color)}>
                            <StatusIcon size={12} className="mr-1.5" />
                            {status.label}
                        </Badge>
                    </div>
                    <p className="text-slate-500 text-sm">Viewing details for transaction <span className="font-mono text-slate-700">{investment.transaction_id}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {infoGroups.map((group, idx) => (
                            <Card key={idx} className="border-slate-100 shadow-sm overflow-hidden">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
                                    <div className="flex items-center gap-2">
                                        <group.icon size={16} className="text-[#B8860B]" />
                                        <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">{group.title}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5">
                                    <div className="space-y-4">
                                        {group.items.map((item, i) => (
                                            <div key={i} className="flex flex-col">
                                                <span className="text-xs text-slate-400 font-medium mb-1">{item.label}</span>
                                                <div className="flex items-center gap-2">
                                                    <item.icon size={14} className="text-slate-300" />
                                                    {item.badge ? (
                                                        <Badge className={cn("px-2 py-0 font-bold capitalize", status.color)}>
                                                            {item.value}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-sm font-semibold text-slate-700">{item.value || 'N/A'}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Interest Breakdown */}
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader className="py-4 px-6 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <BarChart3 size={18} className="text-[#B8860B]" />
                                <CardTitle className="text-base font-bold text-slate-800">Interest Breakdown</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-tight mb-1">Daily Interest</p>
                                    <p className="text-xl font-bold text-slate-900">{investment.currency} {parseFloat(investment.daily_interest).toLocaleString()}</p>
                                </div>
                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-tight mb-1">Monthly Interest</p>
                                    <p className="text-xl font-bold text-slate-900">{investment.currency} {parseFloat(investment.monthly_interest).toLocaleString()}</p>
                                </div>
                                <div className="bg-[#B8860B]/5 p-4 rounded-2xl border border-[#B8860B]/10">
                                    <p className="text-xs text-[#B8860B] font-bold uppercase tracking-tight mb-1">Yearly Interest</p>
                                    <p className="text-xl font-bold text-slate-900">{investment.currency} {parseFloat(investment.yearly_interest).toLocaleString()}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Details / Actions */}
                <div className="space-y-6">
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader className="py-4 px-6 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Info size={18} className="text-[#B8860B]" />
                                <CardTitle className="text-base font-bold text-slate-800">System Logs</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Clock size={14} />
                                    <span>Created At</span>
                                </div>
                                <span className="text-slate-700 font-medium">{new Date(investment.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <RefreshCcw size={14} />
                                    <span>Last Updated</span>
                                </div>
                                <span className="text-slate-700 font-medium">{new Date(investment.updated_at).toLocaleString()}</span>
                            </div>
                            {investment.liquidation_date && (
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-red-400">
                                        <XCircle size={14} />
                                        <span>Liquidation Date</span>
                                    </div>
                                    <span className="text-red-700 font-medium">{new Date(investment.liquidation_date).toLocaleString()}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-slate-100 shadow-sm bg-slate-900 text-white">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Expected Return</p>
                                <p className="text-3xl font-bold text-white">
                                    {investment.currency} {parseFloat(investment.total_expected_return).toLocaleString()}
                                </p>
                            </div>
                            <div className="space-y-3">
                                <Button 
                                    className="w-full bg-[#B8860B] hover:bg-[#966d09] text-white font-bold gap-2 py-6"
                                    onClick={openStatusModal}
                                >
                                    <RefreshCcw size={18} />
                                    Change Investment Status
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Change Status Modal */}
            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Update Investment Status</DialogTitle>
                        <DialogDescription>
                            Change the status of investment for <strong>{investment?.full_name}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    
                    {!isConfirming ? (
                        <div className="py-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Select New Status</label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger className="w-full h-12">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="matured">Matured</SelectItem>
                                        <SelectItem value="liquidated">Liquidated</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="rollover">Rollover</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Current Status:</span>
                                    <Badge variant="outline" className="capitalize">{investment?.status}</Badge>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Transaction ID:</span>
                                    <span className="font-mono font-medium">{investment?.transaction_id}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-10 text-center space-y-4">
                            <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 border border-yellow-100">
                                <Info className="text-yellow-600" size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Are you absolutely sure?</h3>
                            <p className="text-slate-500 text-sm">
                                You are about to change the status from 
                                <span className="font-bold text-slate-900 px-1 capitalize">"{investment?.status}"</span> 
                                to 
                                <span className="font-bold text-[#B8860B] px-1 capitalize">"{newStatus}"</span>.
                                This action will be logged and may trigger system notifications.
                            </p>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        {!isConfirming ? (
                            <>
                                <Button variant="ghost" onClick={() => setIsStatusModalOpen(false)} disabled={isUpdating}>
                                    Cancel
                                </Button>
                                <Button 
                                    className="bg-slate-900 hover:bg-slate-800 text-white"
                                    onClick={() => setIsConfirming(true)}
                                    disabled={newStatus === investment?.status}
                                >
                                    Proceed to Update
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" onClick={() => setIsConfirming(false)} disabled={isUpdating}>
                                    Back
                                </Button>
                                <Button 
                                    className="bg-[#B8860B] hover:bg-[#966d09] text-white gap-2 min-w-[120px]"
                                    onClick={handleStatusUpdate}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Yes, Confirm Change"
                                    )}
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
