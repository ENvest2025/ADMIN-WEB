import { Card } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { UserRegistrationStatus } from '@/lib/api/dashboardService';
import { useMemo } from 'react';

interface RegistrationChartProps {
    data?: UserRegistrationStatus;
}

export function RegistrationChart({ data }: RegistrationChartProps) {
    const chartData = useMemo(() => {
        if (!data) return [];

        return data.labels.map((label, index) => ({
            month: label,
            count: data.values[index] || 0
        }));
    }, [data]);

    return (
        <Card className="p-8 border-slate-100 shadow-sm rounded-3xl bg-white col-span-2">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900">User registration status</h3>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748B', fontSize: 12 }}
                            dx={-10}
                        />
                        <Tooltip
                            cursor={{ fill: '#F8FAFC' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Bar
                            dataKey="count"
                            fill="#B8860B"
                            radius={[4, 4, 0, 0]}
                            barSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
