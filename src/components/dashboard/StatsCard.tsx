import { memo } from 'react';

interface StatsCardProps {
  title: string;
  icon: string;
  stats: Array<{
    label: string;
    value: string | number;
    color?: string;
    subtitle?: string;
  }>;
}

// 🚀 PERFORMANCE: Memoized para evitar re-renders innecesarios
const StatsCard = memo(function StatsCard({ title, icon, stats }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
      <h3 className="font-bold text-lg mb-4 text-secondary dark:text-gray-100">
        {icon} {title}
      </h3>
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index}>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            <p
              className="text-2xl font-bold"
              style={{ color: stat.color || 'inherit' }}
            >
              {stat.value}
            </p>
            {stat.subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.subtitle}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default StatsCard;
