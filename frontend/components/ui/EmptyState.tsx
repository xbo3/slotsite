import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-text-secondary text-sm max-w-sm">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 px-6 py-2.5 btn-cta rounded-lg text-sm"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-2.5 btn-cta rounded-lg text-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
