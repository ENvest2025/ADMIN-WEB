import { useState } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KycFilterValues {
    status: string;
    start_date: string;
    end_date: string;
    id: string;
}

interface KycFilterProps {
    onApply: (filters: KycFilterValues) => void;
    onClear: () => void;
    initialValues?: Partial<KycFilterValues>;
}

const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Declined'] as const;

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Calendar Modal ───────────────────────────────────────────────────────────

interface CalendarModalProps {
    value: string;
    onApply: (date: string) => void;
    onCancel: () => void;
}

function CalendarModal({ value, onApply, onCancel }: CalendarModalProps) {
    const initial = value ? new Date(value + 'T00:00:00') : new Date();
    const [viewYear, setViewYear] = useState(initial.getFullYear());
    const [viewMonth, setViewMonth] = useState(initial.getMonth());
    const [selected, setSelected] = useState<string>(value || '');

    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    // Monday-first: Sun=0 becomes index 6
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; current: boolean }[] = [];
    for (let i = 0; i < startOffset; i++) {
        cells.push({ day: daysInPrev - startOffset + 1 + i, current: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, current: true });
    }
    const tail = 42 - cells.length;
    for (let d = 1; d <= tail; d++) {
        cells.push({ day: d, current: false });
    }

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const toStr = (day: number) =>
        `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70]">
            <div className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl">
                <h3 className="text-base font-bold text-slate-900 mb-5">Set date</h3>

                {/* Month nav */}
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={prevMonth}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <ChevronLeft size={16} className="text-[#B8860B]" />
                    </button>
                    <span className="text-sm font-semibold text-[#B8860B]">
                        {MONTHS[viewMonth]} {viewYear}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <ChevronRight size={16} className="text-[#B8860B]" />
                    </button>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 mb-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d} className="text-center text-xs text-slate-400 py-1 font-medium">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-y-1">
                    {cells.map((cell, i) => {
                        const sel = cell.current && selected === toStr(cell.day);
                        return (
                            <button
                                key={i}
                                disabled={!cell.current}
                                onClick={() => cell.current && setSelected(toStr(cell.day))}
                                className={cn(
                                    'h-9 w-9 mx-auto flex items-center justify-center rounded-full text-sm transition-colors',
                                    !cell.current && 'text-slate-300 cursor-default',
                                    cell.current && !sel && 'text-slate-700 hover:bg-slate-100 cursor-pointer',
                                    sel && 'bg-[#B8860B] text-white font-semibold'
                                )}
                            >
                                {cell.day}
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-5">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => selected && onApply(selected)}
                        disabled={!selected}
                        className="flex-1 py-2.5 bg-[#B8860B] text-white rounded-xl text-sm font-semibold hover:bg-[#966F09] transition-colors disabled:opacity-40"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────

function FilterModal({
    values,
    onApply,
    onClear,
    onClose,
}: {
    values: KycFilterValues;
    onApply: (v: KycFilterValues) => void;
    onClear: () => void;
    onClose: () => void;
}) {
    const [status, setStatus] = useState(values.status || '');
    const [startDate, setStartDate] = useState(values.start_date || '');
    const [endDate, setEndDate] = useState(values.end_date || '');
    const [id, setId] = useState(values.id || '');
    const [calendarOpen, setCalendarOpen] = useState<'start' | 'end' | null>(null);

    const formatDisplay = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const dateLabel = () => {
        if (startDate && endDate) return `${formatDisplay(startDate)} — ${formatDisplay(endDate)}`;
        if (startDate) return formatDisplay(startDate);
        return '';
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={onClose}
            >
                {/* Card */}
                <div
                    className="bg-white rounded-2xl p-8 w-[440px] shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-7">
                        <h3 className="text-xl font-bold text-slate-900">Filter</h3>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* By Status */}
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-800">By Status</p>
                            <div className="flex gap-2">
                                {STATUS_OPTIONS.map(s => {
                                    const active = (s === 'All' && !status) || status === s;
                                    return (
                                        <button
                                            key={s}
                                            onClick={() => setStatus(s === 'All' ? '' : s)}
                                            className={cn(
                                                'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                                                active
                                                    ? 'bg-[#B8860B] text-white border-[#B8860B]'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#B8860B]'
                                            )}
                                        >
                                            {s}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* By Date */}
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-800">By Date</p>
                            <button
                                onClick={() => setCalendarOpen('start')}
                                className="w-full flex items-center justify-between h-12 px-4 border border-slate-200 rounded-xl hover:border-[#B8860B] transition-colors text-left"
                            >
                                <span className={cn(
                                    'text-sm',
                                    dateLabel() ? 'text-slate-800' : 'text-slate-400'
                                )}>
                                    {dateLabel() || 'Select date range'}
                                </span>
                                <Calendar size={16} className="text-slate-400 shrink-0" />
                            </button>
                        </div>

                        {/* By ID */}
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-slate-800">By ID</p>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="search ID"
                                    value={id}
                                    onChange={e => setId(e.target.value)}
                                    className="w-full h-12 px-4 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] text-slate-800 placeholder:text-slate-400"
                                />
                                {/* Chevron down icon matching Figma dropdown arrow */}
                                <svg
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" strokeWidth="2"
                                    strokeLinecap="round" strokeLinejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-1">
                            <button
                                onClick={() => { onClear(); onClose(); }}
                                className="px-6 py-2.5 rounded-xl text-slate-900 font-semibold border border-slate-300 hover:bg-slate-50 transition-colors text-sm"
                            >
                                Clear filter
                            </button>
                            <button
                                onClick={() => { onApply({ status, start_date: startDate, end_date: endDate, id }); onClose(); }}
                                className="px-6 py-2.5 rounded-xl text-white font-semibold bg-[#B8860B] hover:bg-[#966F09] transition-colors text-sm"
                            >
                                Apply filter
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Start date calendar */}
            {calendarOpen === 'start' && (
                <CalendarModal
                    value={startDate}
                    onApply={date => {
                        setStartDate(date);
                        setCalendarOpen('end');
                    }}
                    onCancel={() => setCalendarOpen(null)}
                />
            )}

            {/* End date calendar */}
            {calendarOpen === 'end' && (
                <CalendarModal
                    value={endDate}
                    onApply={date => {
                        setEndDate(date);
                        setCalendarOpen(null);
                    }}
                    onCancel={() => setCalendarOpen(null)}
                />
            )}
        </>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function KycFilter({ onApply, onClear, initialValues }: KycFilterProps) {
    const [isOpen, setIsOpen] = useState(false);

    const currentValues: KycFilterValues = {
        status: initialValues?.status || '',
        start_date: initialValues?.start_date || '',
        end_date: initialValues?.end_date || '',
        id: initialValues?.id || '',
    };

    const hasActive =
        currentValues.status ||
        currentValues.start_date ||
        currentValues.end_date ||
        currentValues.id;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                    hasActive
                        ? 'text-[#B8860B] border-[#B8860B] bg-[#B8860B]/5'
                        : 'text-slate-500 border-slate-200 hover:border-slate-300 bg-white'
                )}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filter
                {hasActive && <span className="w-2 h-2 rounded-full bg-[#B8860B]" />}
            </button>

            {isOpen && (
                <FilterModal
                    values={currentValues}
                    onApply={v => { onApply(v); setIsOpen(false); }}
                    onClear={() => { onClear(); setIsOpen(false); }}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}