'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-dark-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        &lt;
      </button>

      {pages.map((page, idx) =>
        typeof page === 'string' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-text-muted text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all ${
              page === currentPage
                ? 'bg-accent text-dark-bg'
                : 'text-text-secondary hover:text-white hover:bg-dark-elevated'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-dark-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        &gt;
      </button>
    </div>
  );
}
