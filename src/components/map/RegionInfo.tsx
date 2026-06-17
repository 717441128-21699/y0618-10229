import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Thermometer, Clock, TrendingUp } from 'lucide-react';
import type { RegionTemperature } from '../../data/types';
import { formatTemperature } from '../../utils/formatters';
import { colors } from '../../utils/colors';

interface RegionInfoProps {
  region: RegionTemperature;
  selectedYear: number;
  onClose: () => void;
}

export const RegionInfo: React.FC<RegionInfoProps> = ({
  region,
  selectedYear,
  onClose,
}) => {
  const currentTemp = region.temperatureAnomalies[selectedYear] || 0;
  const decadalAvg = Object.entries(region.temperatureAnomalies)
    .filter(([year]) => Math.floor(parseInt(year) / 10) * 10 === Math.floor(selectedYear / 10) * 10)
    .map(([, temp]) => temp)
    .reduce((a, b) => a + b, 0) / 10;

  const trend = Object.entries(region.temperatureAnomalies)
    .filter(([year]) => parseInt(year) >= selectedYear - 20 && parseInt(year) <= selectedYear)
    .reduce((acc, [year, temp], _, arr) => {
      if (arr.length < 2) return 0;
      const first = arr[0][1];
      const last = arr[arr.length - 1][1];
      return (last - first) / 20;
    }, 0);

  const maxTemp = Math.max(...Object.values(region.temperatureAnomalies));
  const maxYear = Object.entries(region.temperatureAnomalies).find(([, t]) => t === maxTemp)?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute top-4 right-4 w-80 rounded-2xl bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.accent}25` }}>
            <MapPin size={18} style={{ color: colors.accent }} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{region.regionName}</h3>
            <p className="text-xs text-gray-400">{region.regionCode}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Thermometer size={12} />
              <span>{selectedYear}年</span>
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: colors.accent }}>
              {formatTemperature(currentTemp, true)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Clock size={12} />
              <span>十年均值</span>
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color: colors.glacier }}>
              {formatTemperature(decadalAvg, true)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <TrendingUp size={12} />
              <span>20年趋势</span>
            </div>
            <div className="text-xl font-bold font-mono" style={{ color: trend > 0 ? colors.warning : colors.forest }}>
              {trend > 0 ? '+' : ''}{trend.toFixed(3)}°C/年
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Thermometer size={12} />
              <span>历史最高</span>
            </div>
            <div className="text-xl font-bold font-mono" style={{ color: colors.warning }}>
              {formatTemperature(maxTemp, true)}
            </div>
            <div className="text-[10px] text-gray-500">{maxYear}年</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <div className="text-xs text-gray-400 mb-1">北极放大效应</div>
          <div className="text-sm text-white">
            该地区位于纬度 {region.latitude > 0 ? '北纬' : '南纬'} {Math.abs(region.latitude).toFixed(1)}°，
            {Math.abs(region.latitude) > 50 
              ? '属于高纬度地区，升温速度约为全球平均的 2-3 倍'
              : '升温速度接近全球平均水平'
            }
          </div>
        </div>
      </div>
    </motion.div>
  );
};
