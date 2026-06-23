import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className={cn("flex items-center justify-between px-2 py-4", className)}>
      <div className="text-sm font-semibold text-slate-900">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500"
        >
          <span className="text-sm">
            <span className="mr-4">1</span> 2
          </span>
          {/* Using text for demo, but design shows just numbers for prev/next maybe? 
              Wait, the design shows "1 2 [3] ... 10 11 12". 
              Prev/Next buttons are likely expected but visually represented by the numbers logic above?
              Actually the screenshot has < and > arrows or similar at the edges if needed, 
              but the user asked for "1,2,3 ... 10, 11, 12". 
              Let's stick to standard number based pagination.
              Wait, checking the image again...
              Ah, it has "Go to page [dropdown]" on the right and "Page 1 of 30" on the left.
              And centered usage of numbers.
          */}
        </button>

        <div className="flex items-center gap-2">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-sm text-sm font-medium transition-colors",
                page === currentPage
                  ? "border-2 border-[#B8860B] text-slate-900 font-bold"
                  : "text-slate-500 hover:text-slate-900",
                page === '...' && "cursor-default hover:text-slate-500"
              )}
            >
              {page}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-slate-500 text-sm">Go to page</span>
          <select
            value={currentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            className="h-8 pl-2 pr-8 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#B8860B]"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
