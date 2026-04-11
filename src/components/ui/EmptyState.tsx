import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm p-12 text-center">
      {icon && <div className="mb-3 text-gray-200">{icon}</div>}
      <p className="text-gray-600 font-medium">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 rounded-xl bg-rose-500 px-5 py-2 text-sm font-medium text-white hover:bg-rose-600 transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
