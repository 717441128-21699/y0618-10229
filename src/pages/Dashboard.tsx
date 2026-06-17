import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ThermometerSun,
  CloudFog,
  Waves,
  Snowflake,
  TrendingUp,
  Map,
  ScatterChart,
  CloudLightning,
  Globe2,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { MetricCard } from '../components/ui/MetricCard';
import { NavCard } from '../components/ui/NavCard';
import { StatCard } from '../components/ui/StatCard';
import { climateData, getLatestDataPoint, metricConfigs, INDUSTRIAL_BASELINE } from '../data/mockData/climateGenerator';
import { calculateTrendRate } from '../data/statistics';
import { colors } from '../utils/colors';
import type { MetricType } from '../data/types';

export const Dashboard: React.FC = () => {
  const latestData = getLatestDataPoint();

  const metrics = useMemo(() => {
    return metricConfigs.map(config => ({
      ...config,
      value: latestData[config.key as MetricType],
      trend: calculateTrendRate(climateData, config.key as MetricType, 10),
    }));
  }, [latestData]);

  const navItems = [
    {
      to: '/trends',
      title: '趋势分析',
      description: '查看温度、CO₂、海平面、海冰面积的历史变化趋势',
      icon: TrendingUp,
      color: colors.accent,
    },
    {
      to: '/map',
      title: '全球分布',
      description: '探索全球各地区升温幅度的空间分布差异',
      icon: Map,
      color: colors.glacier,
    },
    {
      to: '/correlation',
      title: '相关性分析',
      description: '分析CO₂浓度与温度异常的统计关系',
      icon: ScatterChart,
      color: colors.forest,
    },
    {
      to: '/extreme-weather',
      title: '极端天气',
      description: '对比不同年代极端天气事件的发生频率',
      icon: CloudLightning,
      color: colors.warning,
    },
    {
      to: '/scenarios',
      title: '情景预测',
      description: '查看IPCC不同排放情景下的未来温升预测',
      icon: Globe2,
      color: colors.warning,
    },
    {
      to: '/export',
      title: '数据导出',
      description: '导出图表和数据用于报告或展览展示',
      icon: Download,
      color: colors.glacier,
    },
  ];

  const stats = [
    {
      title: '数据跨度',
      value: `${INDUSTRIAL_BASELINE.startYear}-${latestData.year}`,
      subtitle: `${latestData.year - INDUSTRIAL_BASELINE.startYear} 年`,
      icon: <Globe2 className="w-5 h-5" />,
      color: colors.accent,
      description: '包含工业化前基线到最新数据',
    },
    {
      title: '温升总量',
      value: `+${latestData.temperature.toFixed(2)}°C`,
      subtitle: '较工业化前水平',
      icon: <ThermometerSun className="w-5 h-5" />,
      color: colors.warning,
      description: '已接近1.5°C温控目标',
    },
    {
      title: 'CO₂浓度',
      value: `${latestData.co2.toFixed(1)} ppm`,
      subtitle: '当前大气含量',
      icon: <CloudFog className="w-5 h-5" />,
      color: colors.glacier,
      description: '工业化前约为280ppm',
    },
    {
      title: '风险等级',
      value: '橙色预警',
      subtitle: '需立即行动',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: colors.warning,
      description: '温升趋势持续加速中',
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          气候变化数据可视化平台
        </h1>
        <p className="text-gray-400 text-lg">
          探索全球气候变化的历史趋势、空间分布与未来预测
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.key}
            metric={metric.key as MetricType}
            name={metric.name}
            value={metric.value}
            baseline={metric.baseline}
            unit={metric.unit}
            trend={metric.trend}
            color={metric.color}
            description={metric.description}
            delay={index * 0.1}
          />
        ))}
      </div>

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
            delay={0.4 + index * 0.1}
          />
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          深入分析
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {navItems.map((item, index) => (
            <NavCard
              key={item.to}
              icon={item.icon}
              title={item.title}
              description={item.description}
              to={item.to}
              color={item.color}
              delay={0.8 + index * 0.1}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 border border-orange-500/20"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.warning}25` }}>
            <AlertTriangle size={24} style={{ color: colors.warning }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              关于数据的重要说明
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              本平台使用基于真实气候科学趋势的模拟数据进行功能演示。数据模拟了 NASA GISS、NOAA 等权威机构发布的气候变化趋势。
              如需用于科学研究或正式报告，请参考官方数据源：NASA GISS Surface Temperature Analysis、NOAA Global Monitoring Laboratory、IPCC AR6 报告。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
