import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { AreaRangeChart } from '../components/charts/AreaRangeChart';
import { MultiToggleGroup } from '../components/ui/ToggleButton';
import { StatCard } from '../components/ui/StatCard';
import { ExportButton } from '../components/ui/ExportButton';
import { scenarioPredictions, scenarioInfo, getTemperatureTargets } from '../data/mockData/scenarios';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../utils/colors';
import { Leaf, Scale, Building2, Factory, Thermometer, AlertTriangle, Target, TrendingUp } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  leaf: <Leaf className="w-5 h-5" />,
  balance: <Scale className="w-5 h-5" />,
  building: <Building2 className="w-5 h-5" />,
  factory: <Factory className="w-5 h-5" />,
};

export const ScenariosView: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { selectedScenario, toggleScenario } = useAppStore();
  const temperatureTargets = getTemperatureTargets();

  const scenarioOptions = scenarioInfo.map(s => ({
    value: s.code,
    label: s.code,
    color: colors.scenarios[s.code as keyof typeof colors.scenarios] || colors.accent,
  }));

  const selectedScenarioData = scenarioPredictions.filter(s => selectedScenario.includes(s.scenarioCode));
  const bestCase = scenarioPredictions.find(s => s.scenarioCode === 'SSP1-2.6');
  const worstCase = scenarioPredictions.find(s => s.scenarioCode === 'SSP5-8.5');
  const best2100 = bestCase?.data.find(d => d.year === 2100)?.temperature || 0;
  const worst2100 = worstCase?.data.find(d => d.year === 2100)?.temperature || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            未来情景预测
          </h1>
          <p className="text-gray-400">
            IPCC AR6 排放情景对比，展示不同减排路径下的未来温升趋势
          </p>
        </div>
        <ExportButton targetRef={chartRef} title="气候变化情景预测" />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="最佳情景 (2100)"
          value={`+${best2100.toFixed(1)}°C`}
          subtitle="SSP1-2.6 可持续发展"
          icon={<Target className="w-5 h-5" />}
          color={colors.forest}
          trend={{ value: 1.5, label: '接近1.5°C目标' }}
        />
        <StatCard
          title="最差情景 (2100)"
          value={`+${worst2100.toFixed(1)}°C`}
          subtitle="SSP5-8.5 化石燃料发展"
          icon={<AlertTriangle className="w-5 h-5" />}
          color={colors.warning}
          trend={{ value: -2.5, label: '远超安全阈值' }}
        />
        <StatCard
          title="情景范围"
          value={`${(worst2100 - best2100).toFixed(1)}°C`}
          subtitle="2100年温升不确定性范围"
          icon={<TrendingUp className="w-5 h-5" />}
          color={colors.warning}
        />
        <StatCard
          title="当前温升"
          value="+1.2°C"
          subtitle="相对于工业化前水平"
          icon={<Thermometer className="w-5 h-5" />}
          color={colors.accent}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">排放情景选择</h2>
            <p className="text-sm text-gray-400">选择要对比的IPCC情景路径</p>
          </div>
          <MultiToggleGroup
            options={scenarioOptions}
            values={selectedScenario}
            onChange={(values) => {
              if (values.length > 0) {
                values.forEach((v) => {
                  if (!selectedScenario.includes(v)) {
                    toggleScenario(v);
                  }
                });
                selectedScenario.forEach((s) => {
                  if (!values.includes(s)) {
                    toggleScenario(s);
                  }
                });
              }
            }}
          />
        </div>

        <AreaRangeChart
          scenarios={selectedScenarioData}
          selectedScenarios={selectedScenario}
          chartRef={chartRef}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-white mb-4">情景说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarioInfo.map((info) => {
            const color = colors.scenarios[info.code as keyof typeof colors.scenarios] || colors.accent;
            const prediction = scenarioPredictions.find(s => s.scenarioCode === info.code);
            const temp2100 = prediction?.data.find(d => d.year === 2100)?.temperature || 0;
            
            return (
              <motion.div
                key={info.code}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all duration-300"
                style={{ backgroundColor: `${color}08` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {iconMap[info.icon]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{info.code}</h3>
                    <p className="text-sm text-gray-400">{info.name}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-4">{info.description}</p>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">2100年预测温升</span>
                    <span className="font-mono font-bold text-lg" style={{ color }}>
                      +{temp2100.toFixed(1)}°C
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-white mb-4">温度目标说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {temperatureTargets.map((target) => (
            <motion.div
              key={target.target}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="glass-card rounded-xl p-5 border border-white/10"
              style={{ borderLeft: `4px solid ${target.color}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${target.color}20` }}
                >
                  <Thermometer className="w-6 h-6" style={{ color: target.color }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: target.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {target.target}
                  </h3>
                  <p className="text-sm text-gray-400">{target.description}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">实现可能性</span>
                  <span className="text-white">{target.probability}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">风险等级</span>
                  <span style={{ color: target.color }}>{target.risk}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">科学背景</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed">
            IPCC（政府间气候变化专门委员会）第六次评估报告（AR6）采用了共享社会经济路径（SSPs）
            与代表性浓度路径（RCPs）相结合的情景框架。这些情景描述了未来可能的气候发展轨迹，
            取决于人类社会的选择和减排行动的力度。
          </p>
          <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm text-gray-300">
              <strong className="text-white">关键发现：</strong>
              只有在SSP1-2.6情景下，即立即实施大规模减排措施，
              才有可能将21世纪末的温升控制在2°C以内，并接近1.5°C的目标。
              在SSP5-8.5情景下，即继续依赖化石燃料的发展模式，
              到2100年全球平均温度可能比工业化前水平高出4.4°C以上，
              带来不可逆转的气候系统变化。
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
