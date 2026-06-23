import { Card } from '@/components/ui/card';
import { DashboardData } from '@/lib/api/dashboardService';

interface StatCardsProps {
    data?: DashboardData;
}

export function StatCards({ data }: StatCardsProps) {
    const stats = [
        { label: 'Total users', value: data?.['Total Users'] ?? 0, className: 'bg-[#0A0E1A] text-white' },
        { label: 'Pending KYC', value: data?.['Pending KYC'] ?? 0 },
        { label: 'Available investment products', value: data?.['Available Products'] ?? 0 },
        { label: 'Recent transactions', value: data?.['Recent Transactions'] ?? 0 },
    ];

    return (
        <div className="grid grid-cols-4 gap-6">
            {stats.map((stat) => (
                <Card
                    key={stat.label}
                    className={`p-6 border-slate-100 shadow-sm rounded-2xl flex flex-col justify-between h-32 ${stat.className || 'bg-white text-slate-900'}`}
                >
                    <span className="text-sm font-medium opacity-70">{stat.label}</span>
                    <span className="text-4xl font-bold">{stat.value}</span>
                </Card>
            ))}
        </div>
    );
}
