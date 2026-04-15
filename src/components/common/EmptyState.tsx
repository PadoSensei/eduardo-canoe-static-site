import React from "react";
import { CalendarOff, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  message: string;
  icon?: React.ReactElement<LucideIcon>;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-in fade-in duration-500">
      <div className="p-4 mb-4 text-gray-400 bg-slate-50 rounded-full">
        {icon || <CalendarOff className="w-12 h-12" strokeWidth={1.5} />}
      </div>
      <p className="max-w-xs text-lg font-medium text-gray-500 italic font-lora">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;
