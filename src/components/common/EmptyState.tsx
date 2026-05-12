import React from "react";
import CalendarOff from "lucide-react/dist/esm/icons/calendar-off";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps {
  message: string;
  /** Lucide icon component (pass e.g. `CalendarOff`, not a pre-rendered element). */
  icon?: LucideIcon;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-in fade-in duration-500">
      <div className="p-4 mb-4 text-gray-400 bg-slate-50 rounded-full">
        {Icon ? (
          <Icon className="w-12 h-12" strokeWidth={1.5} />
        ) : (
          <CalendarOff className="w-12 h-12" strokeWidth={1.5} />
        )}
      </div>
      <p className="max-w-xs text-lg font-medium text-gray-500 italic font-lora">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
