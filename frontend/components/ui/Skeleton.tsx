import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-skeleton rounded', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-dark-card border border-white/5">
      <Skeleton className="w-full aspect-[4/3]" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 bg-dark-card rounded-lg">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

// Mobile Mypage: Profile Hero Skeleton
export function SkeletonProfileHero() {
  return (
    <div className="md:hidden bg-gradient-to-br from-dark-bg to-dark-card rounded-2xl border border-white/5 p-5">
      <div className="flex flex-col items-center mb-5">
        <Skeleton className="w-20 h-20 rounded-full mb-3" />
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="flex justify-between gap-2 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex-1 bg-black/20 rounded-lg p-3 flex flex-col items-center gap-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="flex-1 h-12 rounded-full" />
        <Skeleton className="flex-1 h-12 rounded-full" />
      </div>
    </div>
  );
}

// Mobile Mypage: Transaction Card Skeleton
export function SkeletonTransactionCards({ count = 4 }: { count?: number }) {
  return (
    <div className="md:hidden space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-dark-card rounded-xl border border-white/5 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Mobile Mypage: Bet Card Skeleton
export function SkeletonBetCards({ count = 4 }: { count?: number }) {
  return (
    <div className="md:hidden space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-dark-card rounded-xl border border-white/5 p-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-40" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}
