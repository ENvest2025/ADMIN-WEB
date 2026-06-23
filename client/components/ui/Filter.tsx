import { X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface FilterValues {
    status: string;
    email: string;
    start_date: string;
    end_date: string;
}

interface FilterProps {
    onApply: (filters: FilterValues) => void;
    onClear: () => void;
    initialValues?: Partial<FilterValues>;
}

export function Filter({ onApply, onClear, initialValues }: FilterProps) {
    const [status, setStatus] = useState<string>(initialValues?.status || '');
    const [email, setEmail] = useState<string>(initialValues?.email || '');
    const [startDate, setStartDate] = useState<string>(initialValues?.start_date || '');
    const [endDate, setEndDate] = useState<string>(initialValues?.end_date || '');
    const [isOpen, setIsOpen] = useState(false);

    const handleApply = () => {
        onApply({ status, email, start_date: startDate, end_date: endDate });
        setIsOpen(false);
    };

    const handleClear = () => {
        setStatus('');
        setEmail('');
        setStartDate('');
        setEndDate('');
        onClear();
        setIsOpen(false);
    };

    const hasActiveFilters = status || email || startDate || endDate;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "gap-2 font-medium border-slate-200",
                        hasActiveFilters ? "text-[#B8860B] border-[#B8860B]" : "text-slate-500"
                    )}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    Filter
                    {hasActiveFilters && (
                        <span className="w-2 h-2 rounded-full bg-[#B8860B]"></span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-6 rounded-2xl" align="end">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Filter</h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-base font-medium text-slate-900">By Status</label>
                        <div className="flex flex-wrap gap-3">
                            {['All', 'Level 1', 'Level 2', 'Level 3', 'Fully Verified'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s === 'All' ? '' : s)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                                        (status === s) || (s === 'All' && !status)
                                            ? "bg-[#B8860B] text-white border-[#B8860B]"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-[#B8860B]"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-base font-medium text-slate-900">By Email</label>
                        <input
                            type="text"
                            placeholder="Search by email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-base font-medium text-slate-900">By Date Range</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <input
                                    type="date"
                                    placeholder="Start date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                                />
                            </div>
                            <div className="relative">
                                <input
                                    type="date"
                                    placeholder="End date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={handleClear}
                            className="px-6 py-2.5 rounded-xl text-slate-900 font-semibold border border-slate-900 hover:bg-slate-50 transition-colors"
                        >
                            Clear filter
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-6 py-2.5 rounded-xl text-white font-semibold bg-[#B8860B] hover:bg-[#966F09] transition-colors"
                        >
                            Apply filter
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

