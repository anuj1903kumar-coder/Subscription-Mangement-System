import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  isPositive?: boolean;
  alert?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  isPositive,
  alert,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 ${
        alert
          ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50 shadow-rose-950/20 shadow-lg'
          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/80 shadow-lg'
      } ${onClick ? 'cursor-pointer group' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</span>
        <div className={`p-2.5 rounded-xl ${alert ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400 group-hover:scale-105'} transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              isPositive
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-rose-500/15 text-rose-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
      )}

      {/* Subtle background glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
};
