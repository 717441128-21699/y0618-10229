import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ScatterChart, Activity, Sigma, TrendingUp, Target, Info } from 'lucide-react';
import { ScatterChart as ScatterChartComp } from '../components/charts/ScatterChart';
import { ToggleGroup } from '../components/ui/ToggleButton';
import { ExportButton } from '../components/ui/ExportButton';
import { StatCard } from '../components/ui/StatCard';
import { useAppStore } from '../store/useAppStore';
import { climateData } from '../data/mockData/climateGenerator';
import { calculateCorrelation } from '../data/statistics';
import { colors } from '../utils/colors';
import { formatCorrelation } from '../utils/formatters';

const periodOptions = [
  { value: 'all', label: '全部数据', color: colors.accent },
  { value: 'pre1950', label: '1950年前', color: colors.glacier },
  { value: 'post1950', label: '1950年后', color: colors.forest },
  { value: 'post2000', label: '2000年后', color: colors.warning },
];

export const CorrelationView: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedPeriod, setSelectedPeriod] = React.useState('all');

  const yearRange = useMemo(() => {
    switch (selectedPeriod) {
      case 'pre1950': return [1850, 1950] as [number, number];
      case 'post1950': return [1950, 2024] as [number, number];
      case 'post2000': return [2000, 2024] as [number, number];
      default: return undefined;
    }
  }, [selectedPeriod]);

  const correlationResult = useMemo(() => {
    return calculateCorrelation(climateData, 'co2', 'temperature', yearRange);
  }, [yearRange]);

  const getCorrelationStrength = (r: number): { label: string; color: string } => {
    const absR = Math.abs(r);
    if (absR >= 0.9) return { label: '极强相关', color: colors.warning };
    if (absR >= 0.7) return { label: '强相关', color: colors.accent };
    if (absR >= 0.5) return { label: '中等相关', color: colors.glacier };
    if (absR >= 0.3) return { label: '弱相关', color: colors.forest };
    return { label: '极弱相关或无相关', color: colors.neutral[500] };
  };

  const correlationStrength = getCorrelationStrength(correlationResult.pearsonR);

  const stats = [
    {
      title: 'Pearson相关系数',
      value: formatCorrelation(correlationResult.pearsonR),
      subtitle: correlationStrength.label,
      icon: <Activity className="w-5 h-5" />,
      color: correlationStrength.color,
      description: '衡量CO₂与温度的线性相关程度',
    },
    {
      title: '决定系数 R²',
      value: formatCorrelation(correlationResult.rSquared),
      subtitle: `${(correlationResult.rSquared * 100).toFixed(1)}% 变异被解释`,
      icon: <Target className="w-5 h-5" />,
      color: colors.accent,
      description: '温度变异中可由CO₂解释的比例',
    },
    {
      title: '回归斜率',
      value: `${correlationResult.slope.toFixed(4)}°C/ppm`,
      subtitle: '每ppm CO₂温升',
      icon: <TrendingUp className="w-5 h-5" />,
      color: colors.warning,
      description: 'CO₂每增加1ppm的温度变化',
    },
    {
      title: 'P值显著性',
      value: correlationResult.pValue < 0.001 ? '< 0.001' : correlationResult.pValue.toFixed(4),
      subtitle: correlationResult.pValue < 0.05 ? '统计显著' : '不显著',
      icon: <Sigma className="w-5 h-5" />,
      color: correlationResult.pValue < 0.05 ? colors.forest : colors.warning,
      description: '相关性结果的统计显著性检验',
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
            CO₂与温度相关性分析
          </h1>
          <p className="text-gray-400 text-sm">
            分析大气CO₂浓度与全球平均温度异常的统计关系
          </p>
        </div>
        <ExportButton
          targetRef={chartRef}
          title="CO2温度相关性分析"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="p-5 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-white/10"
      >
        <label className="text-sm font-medium text-gray-400 mb-2 block">
          选择分析时段
        </label>
        <ToggleGroup
          options={periodOptions}
          value={selectedPeriod}
          onChange={setSelectedPeriod}
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
            delay={0.2 + index * 0.1}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        ref={chartRef}
        className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-white/10 min-h-[500px]"
      >
        <ScatterChartComp
          data={climateData}
          correlationResult={correlationResult}
          yearRange={yearRange}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
          <h3 className="text-sm font-semibold text-white mb-2">回归方程</h3>
          <p className="text-lg font-mono font-bold mb-2" style={{ color: colors.forest }}>
            {correlationResult.regressionEquation}
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            其中 x 代表CO₂浓度（ppm），y 代表温度异常（°C）。
            该方程可以根据CO₂浓度预测大致的温度异常水平。
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <Info size={20} className="flex-shrink-0 mt-0.5" style={{ color: colors.glacier }} />
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">关于相关性的说明</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                本分析展示了CO₂浓度与温度之间的强正相关关系。
                需要注意的是，相关性不等于因果性。
                气候科学研究表明，温室气体（如CO₂）的增加是导致全球变暖的主要驱动因素之一。
                散点图中的颜色区分了不同时期的数据：蓝色为1950年前，绿色为1950-2000年，橙色为2000年后。
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
