import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useAppStore } from '../store/useAppStore';
import { climateData } from '../data/mockData/climateGenerator';
import { regionTemperatures } from '../data/mockData/regionTemps';
import { extremeWeatherData, extremeWeatherTypes } from '../data/mockData/extremeWeather';
import { scenarioPredictions } from '../data/mockData/scenarios';
import { calculateCorrelation, calculateTrendRate, calculateDecadalAverage } from '../data/statistics';
import { colors } from '../utils/colors';
import {
  FileText,
  Eye,
  Settings,
  Download,
  CheckCircle2,
  Circle,
  ChevronRight,
  Thermometer,
  Cloud,
  Waves,
  Snowflake,
  TrendingUp,
  MapPin,
  ScatterChart,
  CloudLightning,
  Globe2,
  Calendar,
  FileBarChart,
  Printer,
  Share2,
  RefreshCw,
} from 'lucide-react';

export const ReportBuilder: React.FC = () => {
  const {
    reportConfig,
    viewConfigs,
    updateReportConfig,
    toggleReportSection,
    updateReportSection,
    resetViewConfigs,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'config' | 'preview'>('preview');
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const enabledSections = reportConfig.sections.filter(s => s.enabled);

  const latestYear = 2024;
  const baselineStart = 1850;
  const baselineEnd = 1900;
  const baselineYears = Array.from({ length: baselineEnd - baselineStart + 1 }, (_, i) => baselineStart + i);
  const baselineTemp = baselineYears.reduce((sum, y) => {
    const d = climateData.find(c => c.year === y);
    return sum + (d?.temperature || 0);
  }, 0) / baselineYears.length;

  const latestTemp = climateData.find(d => d.year === latestYear)?.temperature || 0;
  const latestCO2 = climateData.find(d => d.year === latestYear)?.co2 || 0;
  const latestSeaLevel = climateData.find(d => d.year === latestYear)?.seaLevel || 0;
  const latestSeaIce = climateData.find(d => d.year === latestYear)?.seaIce || 0;

  const tempTrend = calculateTrendRate(climateData, 'temperature', 40);
  const co2TempCorrelation = calculateCorrelation(
    climateData,
    'co2',
    'temperature',
    [1950, 2024]
  );

  const totalExtremeEvents2020s = extremeWeatherData.find(d => d.decade === '2020s');
  const totalExtremeEvents1950s = extremeWeatherData.find(d => d.decade === '1950s');
  const extremeGrowth = totalExtremeEvents1950s && totalExtremeEvents2020s
    ? Math.round(((totalExtremeEvents2020s.heatwaves + totalExtremeEvents2020s.heavyRain + totalExtremeEvents2020s.hurricanes + totalExtremeEvents2020s.droughts) /
        (totalExtremeEvents1950s.heatwaves + totalExtremeEvents1950s.heavyRain + totalExtremeEvents1950s.hurricanes + totalExtremeEvents1950s.droughts) - 1) * 100)
    : 0;

  const ssp126_2100 = scenarioPredictions.find(s => s.scenarioCode === 'SSP1-2.6')?.data.find(d => d.year === 2100);
  const ssp585_2100 = scenarioPredictions.find(s => s.scenarioCode === 'SSP5-8.5')?.data.find(d => d.year === 2100);

  const topWarmingRegions = [...regionTemperatures]
    .sort((a, b) => (b.temperatureAnomalies[latestYear] || 0) - (a.temperatureAnomalies[latestYear] || 0))
    .slice(0, 5);

  const exportReportAsPNG = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#0F172A',
        scale: 2,
        logging: false,
        useCORS: true,
        windowWidth: reportRef.current.scrollWidth,
      });
      const link = document.createElement('a');
      link.download = `${reportConfig.title}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const renderMetricBar = (label: string, value: string, color: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
        <div className="text-lg font-bold text-white font-mono">{value}</div>
      </div>
    </div>
  );

  const renderLineChartPlaceholder = (title: string, data: Array<{ year: number; value: number }>, color: string, unit: string) => {
    const minYear = Math.min(...data.map(d => d.year));
    const maxYear = Math.max(...data.map(d => d.year));
    const values = data.map(d => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const width = 100;
    const height = 50;

    const points = data.map(d => {
      const x = ((d.year - minYear) / (maxYear - minYear)) * width;
      const y = height - ((d.value - minVal) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">{title}</div>
        <svg viewBox={`0 -5 ${width + 10} ${height + 15}`} className="w-full h-32">
          <defs>
            <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
          <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#grad-${title})`} />
          <text x="0" y={height + 10} fontSize="7" fill="#64748B">{minYear}</text>
          <text x={width - 15} y={height + 10} fontSize="7" fill="#64748B">{maxYear}</text>
          <text x="0" y="4" fontSize="7" fill={color}>{maxVal.toFixed(1)} {unit}</text>
        </svg>
      </div>
    );
  };

  const renderOverviewSection = () => (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 pb-2 border-b border-white/10">
        <FileBarChart size={20} style={{ color: colors.accent }} />
        一、总体概述
      </h2>
      
      <p className="text-gray-300 leading-relaxed mb-6 text-sm">
        本报告基于{reportConfig.timeRange[0]}-{reportConfig.timeRange[1]}年的全球气候观测数据和IPCC第六次评估报告（AR6）的情景预测数据，
        系统分析了全球气温、大气CO₂浓度、海平面高度及北极海冰面积等关键指标的长期变化趋势。
        截至{latestYear}年，全球平均温度相对于工业化前（{baselineStart}-{baselineEnd}年）已升高
        <span className="font-bold" style={{ color: colors.accent }}> +{latestTemp.toFixed(2)}°C</span>。
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {renderMetricBar('全球温升', `+${latestTemp.toFixed(2)}°C`, colors.accent, <Thermometer size={16} />)}
        {renderMetricBar('CO₂浓度', `${latestCO2.toFixed(0)} ppm`, colors.glacier, <Cloud size={16} />)}
        {renderMetricBar('海平面上升', `+${latestSeaLevel.toFixed(1)} mm`, colors.forest, <Waves size={16} />)}
        {renderMetricBar('北极海冰', `${latestSeaIce.toFixed(2)} 百万km²`, colors.scenarios['SSP1-2.6'], <Snowflake size={16} />)}
      </div>

      <div className="p-5 rounded-xl border" style={{ backgroundColor: `${colors.accent}08`, borderColor: `${colors.accent}20` }}>
        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: colors.accent }}>
          <CheckCircle2 size={16} /> 核心发现
        </h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex gap-2">
            <ChevronRight size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.accent }} />
            <span>温度上升速率持续加快：过去{latestYear - 1980}年平均温升速率约为 <b className="text-white">{(tempTrend * 10).toFixed(2)}°C / 十年</b></span>
          </li>
          <li className="flex gap-2">
            <ChevronRight size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.accent }} />
            <span>CO₂浓度与温度异常呈 <b className="text-white">强正相关</b>（R² = {co2TempCorrelation.rSquared.toFixed(3)}）</span>
          </li>
          <li className="flex gap-2">
            <ChevronRight size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.accent }} />
            <span>极端天气事件频率相比1950年代增加约 <b className="text-white">{extremeGrowth}%</b></span>
          </li>
          <li className="flex gap-2">
            <ChevronRight size={14} className="flex-shrink-0 mt-0.5" style={{ color: colors.accent }} />
            <span>高排放情景（SSP5-8.5）下2100年温升可能高达 <b className="text-white">+{ssp585_2100?.temperature.toFixed(1)}°C</b></span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderTrendsSection = () => {
    const cfg = viewConfigs.trends;
    const filteredData = climateData.filter(d => d.year >= cfg.timeRange[0] && d.year <= cfg.timeRange[1]);

    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 pb-2 border-b border-white/10">
          <TrendingUp size={20} style={{ color: colors.accent }} />
          二、趋势分析
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                style={{ backgroundColor: `${colors.accent}15`, color: colors.accent, border: `1px solid ${colors.accent}30` }}>
            <Calendar size={12} /> 粒度: {cfg.timeGranularity === 'yearly' ? '年均' : '十年均值'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/10">
            时间范围: {cfg.timeRange[0]}-{cfg.timeRange[1]}年
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/10">
            指标: {cfg.selectedMetrics.length}项
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {cfg.selectedMetrics.includes('temperature') &&
            renderLineChartPlaceholder(
              '全球平均温度异常 (°C)',
              cfg.timeGranularity === 'yearly'
                ? filteredData.map(d => ({ year: d.year, value: d.temperature }))
                : calculateDecadalAverage(climateData, 'temperature').map(d => ({
                    year: parseInt(d.decade),
                    value: d.value
                  })),
              colors.accent,
              '°C'
            )}
          {cfg.selectedMetrics.includes('co2') &&
            renderLineChartPlaceholder(
              '大气CO₂浓度 (ppm)',
              cfg.timeGranularity === 'yearly'
                ? filteredData.map(d => ({ year: d.year, value: d.co2 }))
                : calculateDecadalAverage(climateData, 'co2').map(d => ({
                    year: parseInt(d.decade),
                    value: d.value
                  })),
              colors.glacier,
              'ppm'
            )}
          {cfg.selectedMetrics.includes('seaLevel') &&
            renderLineChartPlaceholder(
              '海平面变化 (mm)',
              cfg.timeGranularity === 'yearly'
                ? filteredData.map(d => ({ year: d.year, value: d.seaLevel }))
                : calculateDecadalAverage(climateData, 'seaLevel').map(d => ({
                    year: parseInt(d.decade),
                    value: d.value
                  })),
              colors.forest,
              'mm'
            )}
          {cfg.selectedMetrics.includes('seaIce') &&
            renderLineChartPlaceholder(
              '北极海冰面积 (百万km²)',
              cfg.timeGranularity === 'yearly'
                ? filteredData.map(d => ({ year: d.year, value: d.seaIce }))
                : calculateDecadalAverage(climateData, 'seaIce').map(d => ({
                    year: parseInt(d.decade),
                    value: d.value
                  })),
              colors.scenarios['SSP1-2.6'],
              'km²'
            )}
        </div>

        {cfg.showBaseline && (
          <p className="text-xs text-gray-500 mb-4 italic">
            * 虚线标注为工业化前基线水平（{baselineStart}-{baselineEnd}年均值）
          </p>
        )}

        <div className="p-5 rounded-xl bg-white/5 border border-white/5">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: colors.forest }} />
            关键结论
          </h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span>全球温度呈现 <b className="text-white">加速上升</b> 趋势，近50年增幅尤为显著</span>
            </li>
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span>CO₂浓度已从工业化前的约280ppm增长至{latestCO2.toFixed(0)}ppm以上</span>
            </li>
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span>北极海冰以每十年 <b className="text-white">约{((7.5 - latestSeaIce) / ((latestYear - 1979) / 10)).toFixed(2)}百万km²</b> 的速率减少</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  const renderMapSection = () => {
    const cfg = viewConfigs.map;
    const year = cfg.selectedYear;

    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 pb-2 border-b border-white/10">
          <MapPin size={20} style={{ color: colors.glacier }} />
          三、全球升温分布
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                style={{ backgroundColor: `${colors.glacier}15`, color: colors.glacier, border: `1px solid ${colors.glacier}30` }}>
            <Calendar size={12} /> 展示年份: {year}年
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/10">
            覆盖区域: {regionTemperatures.length}个国家/地区
          </span>
        </div>

        <div className="flex items-center justify-between mb-4 p-4 rounded-xl bg-white/5 border border-white/5">
          <div>
            <div className="text-xs text-gray-400 mb-1">升温幅度最大的5个区域</div>
            <div className="text-xs text-gray-500">{year}年数据</div>
          </div>
          <div className="flex-1 mx-6 max-w-md">
            <div className="space-y-2">
              {topWarmingRegions.map((r, idx) => {
                const temp = r.temperatureAnomalies[year] || 0;
                const pct = Math.min(100, (temp / 5) * 100);
                return (
                  <div key={r.regionCode} className="flex items-center gap-2">
                    <span className="w-24 text-xs text-gray-300 truncate">{r.regionName}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${colors.forest}, ${colors.accent}, ${colors.scenarios['SSP5-8.5']})`,
                        }}
                      />
                    </div>
                    <span className="w-14 text-right text-xs font-mono font-bold" style={{ color: colors.accent }}>
                      +{temp.toFixed(2)}°C
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg text-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <div className="text-forest mb-0.5" style={{ color: colors.forest }}>0 - 1°C</div>
            <div className="text-gray-500">轻微升温</div>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <div className="text-amber-400 mb-0.5" style={{ color: colors.warning }}>1 - 2°C</div>
            <div className="text-gray-500">中度升温</div>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
            <div className="text-orange-400 mb-0.5" style={{ color: colors.accent }}>2 - 3°C</div>
            <div className="text-gray-500">高度升温</div>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <div className="text-red-400 mb-0.5" style={{ color: colors.scenarios['SSP5-8.5'] }}>3°C+</div>
            <div className="text-gray-500">极端升温</div>
          </div>
        </div>

        <div className="mt-5 p-5 rounded-xl bg-white/5 border border-white/5">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: colors.glacier }} />
            关键结论
          </h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span><b className="text-white">北极放大效应</b>显著：高纬度地区升温幅度约为全球平均的2-3倍</span>
            </li>
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span>陆地升温普遍 <b className="text-white">快于海洋</b>，北半球中高纬度最为突出</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  const renderCorrelationSection = () => {
    const cfg = viewConfigs.correlation;
    const metricNames: Record<string, string> = {
      temperature: '温度异常',
      co2: 'CO₂浓度',
      seaLevel: '海平面变化',
      seaIce: '海冰面积',
    };

    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 pb-2 border-b border-white/10">
          <ScatterChart size={20} style={{ color: colors.forest }} />
          四、相关性分析
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                style={{ backgroundColor: `${colors.forest}15`, color: colors.forest, border: `1px solid ${colors.forest}30` }}>
            X轴: {metricNames[cfg.xMetric] || cfg.xMetric}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                style={{ backgroundColor: `${colors.accent}15`, color: colors.accent, border: `1px solid ${colors.accent}30` }}>
            Y轴: {metricNames[cfg.yMetric] || cfg.yMetric}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-white/10 text-gray-300 border border-white/10">
            时间范围: {cfg.timeRange[0]}-{cfg.timeRange[1]}年
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
            <div className="text-xs text-gray-400 mb-1">Pearson相关系数</div>
            <div className="text-2xl font-bold font-mono" style={{ color: colors.accent }}>
              r = {co2TempCorrelation.pearsonR.toFixed(3)}
            </div>
            <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs"
                 style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}>
              强正相关
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
            <div className="text-xs text-gray-400 mb-1">决定系数 R²</div>
            <div className="text-2xl font-bold font-mono" style={{ color: colors.forest }}>
              {co2TempCorrelation.rSquared.toFixed(3)}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {(co2TempCorrelation.rSquared * 100).toFixed(1)}% 变异可解释
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
            <div className="text-xs text-gray-400 mb-1">回归斜率</div>
            <div className="text-2xl font-bold font-mono" style={{ color: colors.glacier }}>
              {co2TempCorrelation.slope.toFixed(4)}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              °C / ppm
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
            <div className="text-xs text-gray-400 mb-1">P值 (显著性)</div>
            <div className="text-2xl font-bold font-mono" style={{ color: colors.scenarios['SSP1-2.6'] }}>
              {co2TempCorrelation.pValue < 0.001 ? '< 0.001' : co2TempCorrelation.pValue.toFixed(4)}
            </div>
            <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs"
                 style={{ backgroundColor: `${colors.forest}15`, color: colors.forest }}>
              极显著
            </div>
          </div>
        </div>

        {cfg.showRegression && (
          <div className="p-4 rounded-xl font-mono text-sm bg-white/5 border border-white/5 mb-6">
            <div className="text-gray-400 mb-1">回归方程:</div>
            <div className="text-lg text-white">{co2TempCorrelation.regressionEquation}</div>
          </div>
        )}

        <div className="p-5 rounded-xl bg-white/5 border border-white/5">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: colors.forest }} />
            关键结论
          </h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span>CO₂浓度与全球温度异常存在 <b className="text-white">统计学上极其显著的正相关关系</b></span>
            </li>
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span>回归分析表明，CO₂浓度每增加100ppm，温度约上升 <b className="text-white">{(co2TempCorrelation.slope * 100).toFixed(2)}°C</b></span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  const renderExtremeWeatherSection = () => {
    const cfg = viewConfigs.extremeWeather;
    const typeNames: Record<string, string> = {
      heatwaves: '极端高温',
      heavyRain: '暴雨事件',
      hurricanes: '飓风/台风',
      droughts: '严重干旱',
    };

    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 pb-2 border-b border-white/10">
          <CloudLightning size={20} style={{ color: colors.warning }} />
          五、极端天气事件
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {cfg.selectedTypes.map(t => {
            const typeInfo = extremeWeatherTypes.find(x => x.key === t);
            return (
              <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                    style={{ backgroundColor: `${typeInfo?.color || colors.warning}15`, color: typeInfo?.color || colors.warning, border: `1px solid ${typeInfo?.color || colors.warning}30` }}>
                {typeNames[t] || t}
              </span>
            );
          })}
        </div>

        <div className="space-y-3 mb-6">
          {extremeWeatherData.map(decade => {
            const total = cfg.selectedTypes.reduce((sum, t) => sum + (decade[t as keyof typeof decade] as number || 0), 0);
            const maxTotal = 80;
            const pct = (total / maxTotal) * 100;
            return (
              <div key={decade.decade} className="flex items-center gap-4">
                <span className="w-16 text-sm font-medium text-gray-300">{decade.decade}</span>
                <div className="flex-1 h-8 rounded-lg bg-white/5 overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${colors.forest}, ${colors.warning}, ${colors.accent})`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs font-bold text-white font-mono drop-shadow-lg">
                      {total} 次
                    </span>
                  </div>
                </div>
                <span className="w-20 text-right text-xs text-gray-500">
                  {decade.startYear}-{decade.endYear}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {cfg.selectedTypes.map(t => {
            const typeInfo = extremeWeatherTypes.find(x => x.key === t);
            const growth = (() => {
              const first = extremeWeatherData[0];
              const last = extremeWeatherData[extremeWeatherData.length - 1];
              if (!first || !last) return 0;
              const fVal = first[t as keyof typeof first] as number;
              const lVal = last[t as keyof typeof last] as number;
              return Math.round(((lVal / fVal) - 1) * 100);
            })();
            return (
              <div key={t} className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">{typeNames[t]}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${typeInfo?.color || colors.warning}15`, color: typeInfo?.color || colors.warning }}>
                    +{growth}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">1950s → 2020s 增幅</div>
              </div>
            );
          })}
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/5">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: colors.warning }} />
            关键结论
          </h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span>进入21世纪以来，<b className="text-white">各类极端天气事件频率均明显增加</b></span>
            </li>
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span>极端高温事件增长最为显著，2020年代较1950年代增长 <b className="text-white">{extremeGrowth}%以上</b></span>
            </li>
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span>温度每升高1°C，极端天气发生概率呈 <b className="text-white">非线性增长</b></span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  const renderScenariosSection = () => {
    const cfg = viewConfigs.scenarios;
    return (
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 pb-2 border-b border-white/10">
          <Globe2 size={20} style={{ color: colors.warning }} />
          六、未来情景预测
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {cfg.selectedScenarios.map(code => {
            const info = scenarioPredictions.find(s => s.scenarioCode === code);
            return (
              <span key={code} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                    style={{ backgroundColor: `${info?.color || colors.warning}15`, color: info?.color || colors.warning, border: `1px solid ${info?.color || colors.warning}30` }}>
                <Circle size={8} fill={info?.color} style={{ color: info?.color }} />
                {code}
              </span>
            );
          })}
        </div>

        {cfg.showTargets && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl border"
                 style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: colors.forest }}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-base font-bold text-white">1.5°C 目标</div>
                  <div className="text-xs" style={{ color: colors.forest }}>《巴黎协定》理想目标</div>
                </div>
              </div>
              <p className="text-xs text-gray-400">SSP1-2.6 情景下可达成此目标</p>
            </div>
            <div className="p-4 rounded-xl border"
                 style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: colors.warning }}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-base font-bold text-white">2.0°C 上限</div>
                  <div className="text-xs" style={{ color: colors.warning }}>《巴黎协定》承诺目标</div>
                </div>
              </div>
              <p className="text-xs text-gray-400">多数情景可能突破此阈值</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-3 text-xs text-gray-400 font-medium">排放情景</th>
                <th className="text-center py-3 px-3 text-xs text-gray-400 font-medium">2050年温升</th>
                <th className="text-center py-3 px-3 text-xs text-gray-400 font-medium">2100年温升 (中值)</th>
                <th className="text-center py-3 px-3 text-xs text-gray-400 font-medium">2100年置信区间</th>
                <th className="text-center py-3 px-3 text-xs text-gray-400 font-medium">风险评估</th>
              </tr>
            </thead>
            <tbody>
              {cfg.selectedScenarios.map(code => {
                const scenario = scenarioPredictions.find(s => s.scenarioCode === code);
                if (!scenario) return null;
                const y2050 = scenario.data.find(d => d.year === 2050);
                const y2100 = scenario.data.find(d => d.year === 2100);
                const riskLevel = y2100 ? (
                  y2100.temperature <= 1.5 ? { text: '较低', color: colors.forest } :
                  y2100.temperature <= 2.0 ? { text: '中等', color: colors.warning } :
                  y2100.temperature <= 3.5 ? { text: '较高', color: colors.accent } :
                  { text: '极高', color: colors.scenarios['SSP5-8.5'] }
                ) : { text: '未知', color: '#666' };

                return (
                  <tr key={code} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: scenario.color }} />
                        <span className="font-mono font-medium text-white">{scenario.scenarioCode}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 ml-4.5" style={{ marginLeft: '18px' }}>{scenario.description}</div>
                    </td>
                    <td className="text-center py-3 px-3 font-mono text-gray-300">
                      {y2050 ? `+${y2050.temperature.toFixed(2)}°C` : '-'}
                    </td>
                    <td className="text-center py-3 px-3 font-mono font-bold" style={{ color: scenario.color }}>
                      {y2100 ? `+${y2100.temperature.toFixed(2)}°C` : '-'}
                    </td>
                    <td className="text-center py-3 px-3 font-mono text-xs text-gray-400">
                      {y2100 ? `[+${y2100.lowerBound.toFixed(2)}, +${y2100.upperBound.toFixed(2)}]` : '-'}
                    </td>
                    <td className="text-center py-3 px-3">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: `${riskLevel.color}15`, color: riskLevel.color }}>
                        {riskLevel.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/5">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: colors.warning }} />
            关键结论
          </h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span>不同减排路径下的2100年温升差异巨大：从 <b style={{ color: colors.forest }}>+{ssp126_2100?.temperature.toFixed(1)}°C</b> 到 <b style={{ color: colors.scenarios['SSP5-8.5'] }}>+{ssp585_2100?.temperature.toFixed(1)}°C</b></span>
            </li>
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span>SSP1-2.6 情景下有望将温升控制在 <b className="text-white">2°C以内</b>，但需立即大幅减排</span>
            </li>
            <li className="flex gap-2">
              <ChevronRight size={14} className="flex-shrink-0 mt-0.5 text-gray-500" />
              <span>高排放情景下的气候影响将是 <b className="text-white">不可逆且灾难性</b> 的</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 h-[calc(100vh-8rem)] flex flex-col"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            报告生成器
          </h1>
          <p className="text-gray-400">
            配置章节内容，一键生成科普分析报告，支持导出
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'config'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Settings size={16} /> 配置
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye size={16} /> 预览
            </button>
          </div>

          <button
            onClick={resetViewConfigs}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <RefreshCw size={16} /> 重置配置
          </button>

          <button
            onClick={exportReportAsPNG}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: colors.accent }}
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={16} />
            )}
            导出报告 PNG
          </button>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {activeTab === 'config' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-5 overflow-y-auto pr-2"
          >
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Settings size={18} style={{ color: colors.accent }} /> 报告基本信息
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">报告标题</label>
                  <input
                    type="text"
                    value={reportConfig.title}
                    onChange={e => updateReportConfig({ title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">副标题</label>
                  <input
                    type="text"
                    value={reportConfig.subtitle}
                    onChange={e => updateReportConfig({ subtitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    时间范围: {reportConfig.timeRange[0]} - {reportConfig.timeRange[1]} 年
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1850}
                      max={2100}
                      value={reportConfig.timeRange[0]}
                      onChange={e => updateReportConfig({
                        timeRange: [Math.min(parseInt(e.target.value), reportConfig.timeRange[1] - 10), reportConfig.timeRange[1]]
                      })}
                      className="flex-1 accent-orange-500"
                    />
                    <input
                      type="range"
                      min={1850}
                      max={2100}
                      value={reportConfig.timeRange[1]}
                      onChange={e => updateReportConfig({
                        timeRange: [reportConfig.timeRange[0], Math.max(parseInt(e.target.value), reportConfig.timeRange[0] + 10)]
                      })}
                      className="flex-1 accent-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FileText size={18} style={{ color: colors.glacier }} /> 章节配置
                </h3>
                <span className="text-xs text-gray-500">
                  已选 {enabledSections.length}/{reportConfig.sections.length}
                </span>
              </div>

              <div className="space-y-2">
                {reportConfig.sections.map((section, idx) => (
                  <div
                    key={section.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      section.enabled
                        ? 'bg-white/5 border-white/10 hover:border-white/20'
                        : 'bg-white/[0.02] border-white/5 opacity-60'
                    }`}
                    onClick={() => toggleReportSection(section.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                          section.enabled
                            ? 'bg-orange-500 border-orange-500'
                            : 'border-gray-600'
                        }`}
                      >
                        {section.enabled && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-white text-sm flex items-center gap-2">
                            <span className="text-gray-500 text-xs">{idx + 1}.</span>
                            {section.title}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{section.description}</p>

                        {section.enabled && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                            <label className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={section.includeChart}
                                onClick={e => e.stopPropagation()}
                                onChange={e => updateReportSection(section.id, { includeChart: e.target.checked })}
                                className="accent-orange-500"
                              />
                              图表
                            </label>
                            <label className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={section.includeConclusions}
                                onClick={e => e.stopPropagation()}
                                onChange={e => updateReportSection(section.id, { includeConclusions: e.target.checked })}
                                className="accent-orange-500"
                              />
                              结论
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Share2 size={18} style={{ color: colors.forest }} /> 导出说明
              </h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex gap-2">
                  <ChevronRight size={12} className="flex-shrink-0 mt-0.5" />
                  <span>报告自动复用各视图的配置（指标、时间、情景等）</span>
                </li>
                <li className="flex gap-2">
                  <ChevronRight size={12} className="flex-shrink-0 mt-0.5" />
                  <span>可直接在各数据页面调整参数后返回本页预览效果</span>
                </li>
                <li className="flex gap-2">
                  <ChevronRight size={12} className="flex-shrink-0 mt-0.5" />
                  <span>PNG导出为高清图（2倍分辨率），适合打印或报告</span>
                </li>
              </ul>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${activeTab === 'config' ? 'lg:col-span-7' : 'col-span-12'} overflow-hidden flex flex-col`}
        >
          <div className="glass-card rounded-2xl border border-white/10 flex-1 overflow-y-auto">
            <div className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between border-b border-white/10"
                 style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-2">
                <FileText size={18} style={{ color: colors.accent }} />
                <span className="text-sm font-medium text-white">报告预览</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar size={12} />
                生成日期: {new Date().toLocaleDateString('zh-CN')}
              </div>
            </div>

            <div
              ref={reportRef}
              className="p-8 max-w-4xl mx-auto"
              style={{ backgroundColor: '#0F172A', minHeight: '800px' }}
            >
              <div className="text-center mb-10 pb-8 border-b border-white/10">
                <h1 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {reportConfig.title}
                </h1>
                <p className="text-gray-400 text-base mb-4">{reportConfig.subtitle}</p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={12} /> 分析时段: {reportConfig.timeRange[0]}-{reportConfig.timeRange[1]}年
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Printer size={12} /> 报告生成时间: {new Date().toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>

              {enabledSections.length === 0 ? (
                <div className="text-center py-20">
                  <FileText size={48} className="mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-500">请在左侧「配置」面板中勾选要包含的章节</p>
                </div>
              ) : (
                <>
                  {enabledSections.find(s => s.id === 'overview') && renderOverviewSection()}
                  {enabledSections.find(s => s.id === 'trends') && renderTrendsSection()}
                  {enabledSections.find(s => s.id === 'map') && renderMapSection()}
                  {enabledSections.find(s => s.id === 'correlation') && renderCorrelationSection()}
                  {enabledSections.find(s => s.id === 'extremeWeather') && renderExtremeWeatherSection()}
                  {enabledSections.find(s => s.id === 'scenarios') && renderScenariosSection()}
                </>
              )}

              <div className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-gray-600">
                <p className="mb-2">
                  本报告由「气候变化历史数据可视化平台」自动生成
                </p>
                <p>
                  数据基于真实气候科学趋势建模，用于科普教学和展览展示目的
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
