import React from 'react';
import { motion } from 'framer-motion';
import { colors } from '../../utils/colors';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  color: string;
  description?: string;
  delay?: number;
  trend?: { value: number; label: string };
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  color,
  description,
  delay = 0,
  trend,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-xl p-5 backdrop-blur-xl border border-white/10 shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${colors.primaryLight}60 100%)`,
      }}
    >
      <div className="flex items-start gap-4">
        <div 
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}25` }}
        >
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p 
            className="text-2xl font-bold tracking-tight"
            style={{ color, fontFamily: "'JetBrains Mono', monospace" }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className="text-xs mt-2" style={{ color: trend.value > 0 ? colors.forest : colors.warning }}>
              {trend.label}
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
