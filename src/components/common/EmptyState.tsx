import React from "react";
import { CalendarOff, type LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  message: string;
  /** Lucide icon component (pass e.g. `CalendarOff`, not a pre-rendered element). */
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon: Icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-in fade-in duration-500">
      <div className="p-4 mb-4 text-gray-400 bg-slate-50 rounded-full">
        {Icon ? (
          <Icon className="w-12 h-12" strokeWidth={1.5} />
        ) : (
          <CalendarOff className="w-12 h-12" strokeWidth={1.5} />
        )}
      </div>
      <p className="max-w-xs mb-6 text-lg font-medium text-gray-500 italic font-lora">
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 text-sm font-bold text-teal-700 transition-all border-2 border-teal-600 rounded-full hover:bg-teal-600 hover:text-white active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
