import { StatCards } from './blocks/StatCards';
import { RegistrationChart } from './blocks/RegistrationChart';
import { TransactionHistory } from './blocks/TransactionHistory';
import { RecentKYC } from '@/pages/Dashboard/blocks/RecentKYC';
import { useDashboardStats } from '@/hooks/useDashboard';

export default function Overview() {
    // Initial render call with default payload
    const { data: response, isLoading } = useDashboardStats({
        year: 2025,
        month: "",
        day: ""
    });

    const dashboardData = response?.data;

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
            </div>

            <StatCards data={dashboardData} />

            <div className="grid grid-cols-3 gap-8">
                <RegistrationChart data={dashboardData?.["User Registration Status"]} />
                <TransactionHistory />
            </div>

            <RecentKYC />
        </div>
    );
}
