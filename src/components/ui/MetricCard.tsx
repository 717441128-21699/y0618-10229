import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatTemperature, formatCO2, formatSeaLevel, formatSeaIce } from '../../utils/formatters';
import { colors } from '../../utils/colors';
import type { MetricType } from '../../data/types';

interface MetricCardProps {
  metric: MetricType;
  name: string;
  value: number;
  baseline: number;
  unit: string;
  trend: number;
  color: string;
  description: string;
  delay?: number;
}

const formatValue = (metric: MetricType, value: number): string => {
  const formatters: Record<MetricType, (v: number) => string> = {
    temperature: (v) => formatTemperature(v, true),
    co2: formatCO2,
    seaLevel: (v) => formatSeaLevel(v, true),
    seaIce: formatSeaIce,
  };
  return formatters[metric](value);
};

export const MetricCard: React.FC<MetricCardProps> = ({
  name,
  value,
  baseline,
  trend,
  color,
  description,
  metric,
  delay = 0,
}) => {
  const changeFromBaseline = value - baseline;
  const isBadTrend = metric === 'seaIce' ? trend < 0 : trend > 0;
  
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = isBadTrend ? colors.warning : colors.forest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border border-white/10 shadow-2xl"
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        borderColor: `${color}30`,
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: color }} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">{name}</h3>
            <p className="text-xs text-gray-400 max-w-[200px]">{description}</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: `${trendColor}20` }}>
            <TrendIcon size={14} style={{ color: trendColor }} />
            <span className="text-xs font-medium" style={{ color: trendColor }}>
              {trend > 0 ? '+' : ''}{trend.toFixed(3)}/年
            </span>
          </div>
        </div>

        <div className="flex items-end gap-3 mb-3">
          <span className="text-4xl font-bold tracking-tight" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
            {formatValue(metric, value)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">较基线:</span>
          <span 
            className="text-xs font-semibold px-2 py-1 rounded-md"
            style={{ 
              backgroundColor: `${color}20`,
              color: color,
              fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            {metric === 'seaIce' ? '' : '+'}{changeFromBaseline.toFixed(2)} {metric === 'temperature' ? '°C' : metric === 'co2' ? 'ppm' : metric === 'seaLevel' ? 'mm' : '百万km²'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
