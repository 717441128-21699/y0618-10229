import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Eye, EyeOff } from 'lucide-react';
import { TrendLineChart } from '../components/charts/TrendLineChart';
import { MultiToggleGroup } from '../components/ui/ToggleButton';
import { ToggleGroup } from '../components/ui/ToggleButton';
import { ExportButton } from '../components/ui/ExportButton';
import { useAppStore } from '../store/useAppStore';
import { climateData, metricConfigs } from '../data/mockData/climateGenerator';
import { colors } from '../utils/colors';
import type { MetricType } from '../data/types';

export const TrendsView: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const {
    selectedMetrics,
    setSelectedMetrics,
    timeGranularity,
    setTimeGranularity,
    showBaseline,
    setShowBaseline,
  } = useAppStore();

  const metricOptions = metricConfigs.map(config => ({
    value: config.key,
    label: config.name,
    color: config.color,
  }));

  const granularityOptions = [
    { value: 'yearly', label: '年均值', color: colors.accent },
    { value: 'decadal', label: '十年均值', color: colors.glacier },
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
            气候指标趋势分析
          </h1>
          <p className="text-gray-400 text-sm">
            查看1850年以来全球温度、CO₂浓度、海平面、海冰面积的长期变化趋势
          </p>
        </div>
        <ExportButton
          targetRef={chartRef}
          title="气候趋势图"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="p-5 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-white/10"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              选择指标
            </label>
            <MultiToggleGroup
              options={metricOptions as any}
              values={selectedMetrics}
              onChange={(values) => setSelectedMetrics(values)}
            />
          </div>
          
          <div className="flex-shrink-0">
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              时间粒度
            </label>
            <ToggleGroup
              options={granularityOptions}
              value={timeGranularity}
              onChange={(value) => setTimeGranularity(value as 'yearly' | 'decadal')}
            />
          </div>

          <div className="flex-shrink-0">
            <label className="text-sm font-medium text-gray-400 mb-2 block">
              基线显示
            </label>
            <button
              onClick={() => setShowBaseline(!showBaseline)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border
                ${showBaseline
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-400 shadow-lg shadow-orange-500/20'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                }
              `}
            >
              {showBaseline ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>工业化前基线</span>
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        ref={chartRef}
        className="p-6 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-white/10 min-h-[500px]"
      >
        {selectedMetrics.length > 0 ? (
          <TrendLineChart
            data={climateData}
            selectedMetrics={selectedMetrics as MetricType[]}
            timeGranularity={timeGranularity}
            showBaseline={showBaseline}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <TrendingUp size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-500 text-lg">请至少选择一个指标进行查看</p>
            <p className="text-gray-600 text-sm mt-1">点击上方按钮选择要分析的气候指标</p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
          <h3 className="text-sm font-semibold text-white mb-2">关于工业化前基线</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            工业化前基线通常指1850-1900年的平均水平，作为工业革命前的参考基准。
            《巴黎协定》的温控目标（1.5°C/2°C）即是相对于这一基线的温度上升幅度。
          </p>
        </div>
        
        <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <h3 className="text-sm font-semibold text-white mb-2">数据说明</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            温度数据基于NASA GISS地表温度异常数据集，CO₂数据基于NOAA莫纳罗亚观测站，
            海平面数据基于AVISO卫星测高，海冰数据基于NSIDC北极海冰范围监测。
          </p>
        </div>
      </motion.div>
    </div>
  );
};
