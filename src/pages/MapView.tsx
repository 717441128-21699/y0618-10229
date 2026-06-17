import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Map, Info } from 'lucide-react';
import { WorldMap } from '../components/map/WorldMap';
import { TimeSlider } from '../components/map/TimeSlider';
import { ExportButton } from '../components/ui/ExportButton';
import { StatCard } from '../components/ui/StatCard';
import { mapYears } from '../data/mockData/mapData';
import { regionTemperatures } from '../data/mockData/regionTemps';
import { colors } from '../utils/colors';

export const MapView: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setSelectedYear(prev => {
          const currentIndex = mapYears.indexOf(prev);
          const nextIndex = (currentIndex + 1) % mapYears.length;
          return mapYears[nextIndex];
        });
      }, 800);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const avgTemp = Object.values(regionTemperatures).reduce((sum, region) => {
    return sum + (region.temperatureAnomalies[selectedYear] || 0);
  }, 0) / regionTemperatures.length;

  const maxRegion = regionTemperatures.reduce((max, region) => {
    const temp = region.temperatureAnomalies[selectedYear] || -Infinity;
    const maxTemp = max.temperatureAnomalies[selectedYear] || -Infinity;
    return temp > maxTemp ? region : max;
  }, regionTemperatures[0]);

  const minRegion = regionTemperatures.reduce((min, region) => {
    const temp = region.temperatureAnomalies[selectedYear] || Infinity;
    const minTemp = min.temperatureAnomalies[selectedYear] || Infinity;
    return temp < minTemp ? region : min;
  }, regionTemperatures[0]);

  const stats = [
    {
      title: '全球平均',
      value: `+${avgTemp.toFixed(2)}°C`,
      subtitle: `${selectedYear}年`,
      icon: <Map className="w-5 h-5" />,
      color: colors.accent,
      description: '所有地区平均升温幅度',
    },
    {
      title: '升温最快',
      value: `+${(maxRegion.temperatureAnomalies[selectedYear] || 0).toFixed(2)}°C`,
      subtitle: maxRegion.regionName,
      icon: <Map className="w-5 h-5" />,
      color: colors.warning,
      description: `${selectedYear}年升温最快地区`,
    },
    {
      title: '升温最慢',
      value: `+${(minRegion.temperatureAnomalies[selectedYear] || 0).toFixed(2)}°C`,
      subtitle: minRegion.regionName,
      icon: <Map className="w-5 h-5" />,
      color: colors.glacier,
      description: `${selectedYear}年升温最慢地区`,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            全球温度分布
          </h1>
          <p className="text-gray-400 text-sm">
            探索全球各地区温度异常的空间分布与时间演变
          </p>
        </div>
        <ExportButton
          targetRef={chartRef}
          title="全球温度分布图"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            color={stat.color}
            description={stat.description}
            delay={0.1 + index * 0.1}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        ref={chartRef}
        className="p-4 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-white/10 min-h-[600px]"
      >
        <WorldMap selectedYear={selectedYear} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <TimeSlider
          years={mapYears}
          selectedYear={selectedYear}
          onChange={setSelectedYear}
          isPlaying={isPlaying}
          onPlayToggle={handlePlayToggle}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.glacier}25` }}>
            <Info size={20} style={{ color: colors.glacier }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">北极放大效应</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              注意观察高纬度地区（如北极周边的俄罗斯、加拿大、格陵兰等）的升温幅度显著高于全球平均水平。
              这一现象被称为"北极放大效应"，主要原因是海冰融化导致反照率降低，以及大气和海洋环流变化等因素。
              北极地区的升温速度通常是全球平均的2-3倍。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
