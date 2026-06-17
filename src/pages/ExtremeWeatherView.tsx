import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { CloudLightning, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { BarChart } from '../components/charts/BarChart';
import { MultiToggleGroup } from '../components/ui/ToggleButton';
import { ExportButton } from '../components/ui/ExportButton';
import { StatCard } from '../components/ui/StatCard';
import { extremeWeatherData, extremeWeatherTypes } from '../data/mockData/extremeWeather';
import { colors } from '../utils/colors';

export const ExtremeWeatherView: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([
    'heatwaves', 'heavyRain', 'droughts'
  ]);

  const typeOptions = extremeWeatherTypes.map(type => ({
    value: type.key,
    label: type.name,
    color: type.color,
  }));

  const totalEvents = selectedTypes.reduce((sum, type) => {
    return sum + extremeWeatherData.reduce((s, d) => s + (d[type as keyof Omit<typeof d, 'decade' | 'startYear' | 'endYear'>] as number), 0);
  }, 0);

  const latestDecade = extremeWeatherData[extremeWeatherData.length - 1];
  const earliestDecade = extremeWeatherData[0];

  const getGrowthRate = (type: string): number => {
    const latest = latestDecade[type as keyof typeof latestDecade] as number;
    const earliest = earliestDecade[type as keyof typeof earliestDecade] as number;
    return ((latest - earliest) / earliest) * 100;
  };

  const fastestGrowing = selectedTypes.reduce((fastest, type) => {
    const rate = getGrowthRate(type);
    const fastestRate = getGrowthRate(fastest);
    return rate > fastestRate ? type : fastest;
  }, selectedTypes[0] || 'heatwaves');

  const fastestGrowingConfig = extremeWeatherTypes.find(t => t.key === fastestGrowing)!;
  const fastestGrowthRate = getGrowthRate(fastestGrowing);

  const stats = [
    {
      title: '事件总数',
      value: totalEvents.toLocaleString(),
      subtitle: `${extremeWeatherData.length}个年代`,
      icon: <CloudLightning className="w-5 h-5" />,
      color: colors.accent,
      description: '所选类型极端天气事件总数',
    },
    {
      title: '最新年代',
      value: latestDecade.decade.replace('s', '年代'),
      subtitle: `${selectedTypes.reduce((s, t) => s + (latestDecade[t as keyof typeof latestDecade] as number), 0)} 次事件`,
      icon: <CloudLightning className="w-5 h-5" />,
      color: colors.warning,
      description: '最新统计时段的极端天气情况',
    },
    {
      title: '增长最快',
      value: fastestGrowingConfig.name,
      subtitle: `+${fastestGrowthRate.toFixed(0)}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: fastestGrowingConfig.color,
      description: '相比1950年代的增长幅度',
    },
    {
      title: '风险等级',
      value: '高风险',
      subtitle: '持续增长趋势',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: colors.warning,
      description: '极端天气事件频率显著增加',
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
            极端天气事件对比
          </h1>
          <p className="text-gray-400 text-sm">
            对比不同年代各类极端天气事件的发生频率变化
          </p>
        </div>
        <ExportButton
          targetRef={chartRef}
          title="极端天气事件对比"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
        transition={{ duration: 0.5, delay: 0.2 }}
        className="p-5 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-white/10"
      >
        <label className="text-sm font-medium text-gray-400 mb-2 block">
          选择事件类型
        </label>
        <MultiToggleGroup
          options={typeOptions as any}
          values={selectedTypes}
          onChange={setSelectedTypes}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        ref={chartRef}
        className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-white/10 min-h-[500px]"
      >
        {selectedTypes.length > 0 ? (
          <BarChart
            data={extremeWeatherData}
            selectedTypes={selectedTypes}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <CloudLightning size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-500 text-lg">请至少选择一种极端天气类型</p>
            <p className="text-gray-600 text-sm mt-1">点击上方按钮选择要分析的事件类型</p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {extremeWeatherTypes.map((type, index) => (
          <div
            key={type.key}
            className="p-5 rounded-2xl border transition-all duration-200"
            style={{
              backgroundColor: `${type.color}10`,
              borderColor: `${type.color}20`,
              opacity: selectedTypes.includes(type.key) ? 1 : 0.5,
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
              <h3 className="text-sm font-semibold text-white">{type.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: `${type.color}20`, color: type.color }}>
                +{getGrowthRate(type.key).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {type.description}
            </p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="p-5 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.warning}25` }}>
            <Info size={20} style={{ color: colors.warning }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">气候变化与极端天气</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              科学研究表明，气候变化正在导致极端天气事件的频率和强度增加。
              温度升高意味着大气可以容纳更多水汽，从而增加强降水事件的发生；
              同时，海洋温度升高会加剧热带气旋的强度。
              这些变化对人类社会和生态系统构成了严重威胁。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
