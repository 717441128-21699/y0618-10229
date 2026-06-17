import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronLeft,
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
  Maximize2,
  Minimize2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  FileCode,
  X,
  ArrowLeft,
  ArrowRight,
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

  const [activeTab, setActiveTab] = useState<'config' | 'preview' | 'story'>('preview');
  const [exporting, setExporting] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const [presentMode, setPresentMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [storyYearIndex, setStoryYearIndex] = useState(0);
  const [storyAutoPlay, setStoryAutoPlay] = useState(false);
  const storyIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const storyYears = [
    {
      year: 1850,
      era: '工业化初期',
      subtitle: '第一次工业革命',
      temp: climateData.find(d => d.year === 1850)?.temperature || 0,
      co2: climateData.find(d => d.year === 1850)?.co2 || 0,
      bg: 'from-blue-900/30',
      accent: colors.glacier,
      narrative: '蒸汽机的广泛应用开启了人类大规模使用化石燃料的时代。此时全球平均温度较工业化前基线仍处于自然波动范围内，CO₂浓度维持在约285ppm。',
      keyEvents: ['英国完成工业革命', '全球人口约12亿', '主要能源：煤炭'],
    },
    {
      year: 1950,
      era: '二战后重建',
      subtitle: '大加速时代开始',
      temp: climateData.find(d => d.year === 1950)?.temperature || 0,
      co2: climateData.find(d => d.year === 1950)?.co2 || 0,
      bg: 'from-cyan-900/30',
      accent: colors.forest,
      narrative: '第二次世界大战后，全球工业化进程加速，\"大加速\"时代开启。消费主义兴起，石油成为主要能源，极端天气事件开始出现上升趋势。',
      keyEvents: ['石油成为主导能源', '汽车大规模普及', '全球人口约25亿', '极端天气事件：57次/十年'],
    },
    {
      year: 2000,
      era: '千年之交',
      subtitle: '气候变化显现',
      temp: climateData.find(d => d.year === 2000)?.temperature || 0,
      co2: climateData.find(d => d.year === 2000)?.co2 || 0,
      bg: 'from-amber-900/30',
      accent: colors.warning,
      narrative: '进入21世纪，气候变化的影响开始清晰可见。1997年《京都议定书》签署，但全球排放仍在快速增长。北极海冰面积开始明显缩减。',
      keyEvents: ['《京都议定书》签署', 'CO₂浓度突破369ppm', '北极海冰加速消融', '极端天气事件：82次/十年'],
    },
    {
      year: 2024,
      era: '关键节点',
      subtitle: '行动的最后窗口',
      temp: latestTemp,
      co2: latestCO2,
      bg: 'from-orange-900/30',
      accent: colors.accent,
      narrative: `全球温升已达+${latestTemp.toFixed(2)}°C，距《巴黎协定》1.5°C目标仅剩0.${Math.max(2, Math.round((1.5 - latestTemp) * 100))}°C的缓冲空间。2023年成为有记录以来最热的一年，极端天气在全球多地造成重大损失。`,
      keyEvents: [`全球温升 +${latestTemp.toFixed(2)}°C`, `CO₂浓度 ${latestCO2.toFixed(0)}ppm`, '《巴黎协定》执行关键期', `极端天气事件：${totalExtremeEvents2020s ? totalExtremeEvents2020s.heatwaves + totalExtremeEvents2020s.heavyRain + totalExtremeEvents2020s.hurricanes + totalExtremeEvents2020s.droughts : 0}+次/十年`],
    },
    {
      year: 2100,
      era: '未来选择',
      subtitle: '取决于今天的行动',
      temp: NaN,
      co2: NaN,
      bg: 'from-rose-900/30',
      accent: colors.scenarios['SSP5-8.5'],
      narrative: '2100年的气候取决于我们当下的选择：从可持续发展的+1.4°C，到化石燃料驱动的+6.8°C，不同情景之间差异高达5°C以上，将塑造完全不同的世界。',
      keyEvents: [
        'SSP1-2.6: +1.4°C (绿色转型)',
        'SSP2-4.5: +3.1°C (中等排放)',
        'SSP3-7.0: +4.9°C (区域竞争)',
        'SSP5-8.5: +6.8°C (高排放)',
      ],
      isFuture: true,
    },
  ];

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % (enabledSections.length + 1));
  }, [enabledSections.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => prev <= 0 ? enabledSections.length : prev - 1);
  }, [enabledSections.length]);

  const nextStory = useCallback(() => {
    setStoryYearIndex(prev => (prev + 1) % storyYears.length);
  }, [storyYears.length]);

  const prevStory = useCallback(() => {
    setStoryYearIndex(prev => prev <= 0 ? storyYears.length - 1 : prev - 1);
  }, [storyYears.length]);

  useEffect(() => {
    if (autoPlay && presentMode) {
      slideIntervalRef.current = setInterval(nextSlide, 8000);
    } else {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
        slideIntervalRef.current = null;
      }
    }
    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [autoPlay, presentMode, nextSlide]);

  useEffect(() => {
    if (storyAutoPlay && activeTab === 'story') {
      storyIntervalRef.current = setInterval(nextStory, 6000);
    } else {
      if (storyIntervalRef.current) {
        clearInterval(storyIntervalRef.current);
        storyIntervalRef.current = null;
      }
    }
    return () => {
      if (storyIntervalRef.current) clearInterval(storyIntervalRef.current);
    };
  }, [storyAutoPlay, activeTab, nextStory]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!presentMode && activeTab !== 'story') return;
      if (e.key === 'ArrowRight') presentMode ? nextSlide() : nextStory();
      if (e.key === 'ArrowLeft') presentMode ? prevSlide() : prevStory();
      if (e.key === 'Escape') setPresentMode(false);
      if (e.key === ' ') {
        e.preventDefault();
        presentMode ? setAutoPlay(a => !a) : setStoryAutoPlay(a => !a);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [presentMode, activeTab, nextSlide, prevSlide, nextStory, prevStory]);

  const exportReportAsPNG = async () => {
    if (!reportRef.current) return;
    setExporting('png');
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
      setExporting(null);
    }
  };

  const exportReportAsHTML = () => {
    setExporting('html');
    try {
      const reportElement = reportRef.current;
      if (!reportElement) return;

      const styles = Array.from(document.styleSheets)
        .map(s => {
          try {
            return Array.from(s.cssRules || []).map(r => r.cssText).join('\n');
          } catch { return ''; }
        }).join('\n');

      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportConfig.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0F172A;
      color: #E2E8F0;
      min-height: 100vh;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .report-container {
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      padding: 40px 0 32px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 40px;
    }
    .header h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 36px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 12px;
    }
    .header p {
      color: #94A3B8;
      font-size: 16px;
      margin-bottom: 16px;
    }
    .meta {
      color: #64748B;
      font-size: 13px;
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    section {
      margin-bottom: 48px;
    }
    h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 22px;
      color: #fff;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .metric-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .metric-icon {
      width: 40px; height: 40px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .metric-label { font-size: 12px; color: #94A3B8; margin-bottom: 4px; }
    .metric-value { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; color: #fff; }
    .chart-svg { width: 100%; height: 128px; margin-bottom: 16px; }
    .conclusions {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 20px 24px;
    }
    .conclusions h4 { color: #fff; font-size: 14px; font-weight: 600; margin-bottom: 12px; }
    .conclusions ul { list-style: none; }
    .conclusions li { font-size: 14px; color: #CBD5E1; padding: 4px 0; display: flex; gap: 8px; }
    .conclusions li::before { content: "▸"; color: #F97316; flex-shrink: 0; }
    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 32px;
      border-top: 1px solid rgba(255,255,255,0.1);
      color: #475569;
      font-size: 12px;
    }
    @media print {
      body { background: white; color: #1E293B; padding: 20px; }
      .metric-card { background: #F8FAFC; border-color: #E2E8F0; }
      .metric-label { color: #64748B; }
      .metric-value { color: #1E293B; }
      .conclusions { background: #F8FAFC; border-color: #E2E8F0; }
      .conclusions h4 { color: #1E293B; }
      .conclusions li { color: #334155; }
      h2 { color: #0F172A; border-color: #E2E8F0; }
      .header h1 { color: #0F172A; }
      section { page-break-inside: avoid; }
    }
  </style>
  <style>${styles}</style>
</head>
<body>
  <div class="report-container">
    <div class="header">
      <h1>${reportConfig.title}</h1>
      <p>${reportConfig.subtitle}</p>
      <div class="meta">
        <span>分析时段: ${reportConfig.timeRange[0]}-${reportConfig.timeRange[1]}年</span>
        <span>生成日期: ${new Date().toLocaleDateString('zh-CN')}</span>
      </div>
    </div>
    ${reportElement.innerHTML}
    <div class="footer">
      <p>本报告由「气候变化历史数据可视化平台」自动生成</p>
      <p>数据基于真实气候科学趋势建模，用于科普教学和展览展示</p>
    </div>
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      link.download = `${reportConfig.title}-${new Date().toISOString().split('T')[0]}.html`;
      link.href = URL.createObjectURL(blob);
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (e) {
      console.error('HTML export failed:', e);
    } finally {
      setExporting(null);
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
    if (data.length === 0) return null;
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
            <linearGradient id={`grad-${title.replace(/\s/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
          <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#grad-${title.replace(/\s/g, '-')})`} />
          <text x="0" y={height + 10} fontSize="7" fill="#64748B">{minYear}</text>
          <text x={width - 15} y={height + 10} fontSize="7" fill="#64748B">{maxYear}</text>
          <text x="0" y="4" fontSize="7" fill={color}>{maxVal.toFixed(1)} {unit}</text>
        </svg>
      </div>
    );
  };

  const sectionConfigs = reportConfig.sections;

  const renderOverviewSection = (forSlides: boolean = false) => {
    const section = sectionConfigs.find(s => s.id === 'overview');
    if (!section?.enabled) return null;

    return (
      <div className={forSlides ? 'h-full flex flex-col' : 'mb-10'}>
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

        {section.includeChart && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {renderMetricBar('全球温升', `+${latestTemp.toFixed(2)}°C`, colors.accent, <Thermometer size={16} />)}
            {renderMetricBar('CO₂浓度', `${latestCO2.toFixed(0)} ppm`, colors.glacier, <Cloud size={16} />)}
            {renderMetricBar('海平面上升', `+${latestSeaLevel.toFixed(1)} mm`, colors.forest, <Waves size={16} />)}
            {renderMetricBar('北极海冰', `${latestSeaIce.toFixed(2)} 百万km²`, colors.scenarios['SSP1-2.6'], <Snowflake size={16} />)}
          </div>
        )}

        {section.includeConclusions && (
          <div className={`p-5 rounded-xl border mt-auto ${forSlides ? '' : ''}`} style={{ backgroundColor: `${colors.accent}08`, borderColor: `${colors.accent}20` }}>
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
        )}
      </div>
    );
  };

  const renderTrendsSection = (forSlides: boolean = false) => {
    const cfg = viewConfigs.trends;
    const section = sectionConfigs.find(s => s.id === 'trends');
    if (!section?.enabled) return null;
    const filteredData = climateData.filter(d => d.year >= cfg.timeRange[0] && d.year <= cfg.timeRange[1]);

    return (
      <div className={forSlides ? 'h-full flex flex-col' : 'mb-10'}>
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

        {section.includeChart && (
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
        )}

        {cfg.showBaseline && section.includeChart && (
          <p className="text-xs text-gray-500 mb-4 italic">
            * 虚线标注为工业化前基线水平（{baselineStart}-{baselineEnd}年均值）
          </p>
        )}

        {section.includeConclusions && (
          <div className="p-5 rounded-xl bg-white/5 border border-white/5 mt-auto">
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
        )}
      </div>
    );
  };

  const renderMapSection = (forSlides: boolean = false) => {
    const cfg = viewConfigs.map;
    const section = sectionConfigs.find(s => s.id === 'map');
    if (!section?.enabled) return null;
    const year = cfg.selectedYear;

    return (
      <div className={forSlides ? 'h-full flex flex-col' : 'mb-10'}>
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

        {section.includeChart && (
          <>
            <div className="flex items-center justify-between mb-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div>
                <div className="text-xs text-gray-400 mb-1">升温幅度最大的5个区域</div>
                <div className="text-xs text-gray-500">{year}年数据</div>
              </div>
              <div className="flex-1 mx-6 max-w-md">
                <div className="space-y-2">
                  {topWarmingRegions.map((r) => {
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

            <div className="grid grid-cols-4 gap-2 text-xs mb-6">
              <div className="p-2 rounded-lg text-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <div className="mb-0.5" style={{ color: colors.forest }}>0 - 1°C</div>
                <div className="text-gray-500">轻微升温</div>
              </div>
              <div className="p-2 rounded-lg text-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                <div className="mb-0.5" style={{ color: colors.warning }}>1 - 2°C</div>
                <div className="text-gray-500">中度升温</div>
              </div>
              <div className="p-2 rounded-lg text-center" style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
                <div className="mb-0.5" style={{ color: colors.accent }}>2 - 3°C</div>
                <div className="text-gray-500">高度升温</div>
              </div>
              <div className="p-2 rounded-lg text-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <div className="mb-0.5" style={{ color: colors.scenarios['SSP5-8.5'] }}>3°C+</div>
                <div className="text-gray-500">极端升温</div>
              </div>
            </div>
          </>
        )}

        {section.includeConclusions && (
          <div className="p-5 rounded-xl bg-white/5 border border-white/5 mt-auto">
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
        )}
      </div>
    );
  };

  const renderCorrelationSection = (forSlides: boolean = false) => {
    const cfg = viewConfigs.correlation;
    const section = sectionConfigs.find(s => s.id === 'correlation');
    if (!section?.enabled) return null;
    const metricNames: Record<string, string> = {
      temperature: '温度异常',
      co2: 'CO₂浓度',
      seaLevel: '海平面变化',
      seaIce: '海冰面积',
    };

    return (
      <div className={forSlides ? 'h-full flex flex-col' : 'mb-10'}>
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

        {section.includeChart && (
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
        )}

        {cfg.showRegression && section.includeChart && (
          <div className="p-4 rounded-xl font-mono text-sm bg-white/5 border border-white/5 mb-6">
            <div className="text-gray-400 mb-1">回归方程:</div>
            <div className="text-lg text-white">{co2TempCorrelation.regressionEquation}</div>
          </div>
        )}

        {section.includeConclusions && (
          <div className="p-5 rounded-xl bg-white/5 border border-white/5 mt-auto">
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
        )}
      </div>
    );
  };

  const renderExtremeWeatherSection = (forSlides: boolean = false) => {
    const cfg = viewConfigs.extremeWeather;
    const section = sectionConfigs.find(s => s.id === 'extremeWeather');
    if (!section?.enabled) return null;
    const typeNames: Record<string, string> = {
      heatwaves: '极端高温',
      heavyRain: '暴雨事件',
      hurricanes: '飓风/台风',
      droughts: '严重干旱',
    };

    return (
      <div className={forSlides ? 'h-full flex flex-col' : 'mb-10'}>
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

        {section.includeChart && (
          <>
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
          </>
        )}

        {section.includeConclusions && (
          <div className="p-5 rounded-xl bg-white/5 border border-white/5 mt-auto">
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
        )}
      </div>
    );
  };

  const renderScenariosSection = (forSlides: boolean = false) => {
    const cfg = viewConfigs.scenarios;
    const section = sectionConfigs.find(s => s.id === 'scenarios');
    if (!section?.enabled) return null;

    return (
      <div className={forSlides ? 'h-full flex flex-col' : 'mb-10'}>
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

        {cfg.showTargets && section.includeChart && (
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

        {section.includeChart && (
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
                        <div className="text-xs text-gray-500 mt-0.5" style={{ marginLeft: '18px' }}>{scenario.description}</div>
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
        )}

        {section.includeConclusions && (
          <div className="p-5 rounded-xl bg-white/5 border border-white/5 mt-auto">
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
        )}
      </div>
    );
  };

  const slides = [
    { title: '封面', render: () => (
      <div className="h-full flex flex-col items-center justify-center text-center px-12">
        <h1 className="text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {reportConfig.title}
        </h1>
        <p className="text-2xl text-gray-400 mb-10">{reportConfig.subtitle}</p>
        <div className="flex items-center gap-6 text-gray-500 text-lg">
          <span className="inline-flex items-center gap-2">
            <Calendar size={20} /> {reportConfig.timeRange[0]}-{reportConfig.timeRange[1]}年
          </span>
        </div>
        <div className="mt-16 grid grid-cols-4 gap-6 w-full max-w-3xl">
          {renderMetricBar('全球温升', `+${latestTemp.toFixed(2)}°C`, colors.accent, <Thermometer size={20} />)}
          {renderMetricBar('CO₂浓度', `${latestCO2.toFixed(0)} ppm`, colors.glacier, <Cloud size={20} />)}
          {renderMetricBar('海平面', `+${latestSeaLevel.toFixed(1)} mm`, colors.forest, <Waves size={20} />)}
          {renderMetricBar('北极海冰', `${latestSeaIce.toFixed(2)}`, colors.scenarios['SSP1-2.6'], <Snowflake size={20} />)}
        </div>
      </div>
    )},
    { title: '总体概述', render: () => renderOverviewSection(true) },
    { title: '趋势分析', render: () => renderTrendsSection(true) },
    { title: '全球分布', render: () => renderMapSection(true) },
    { title: '相关性分析', render: () => renderCorrelationSection(true) },
    { title: '极端天气', render: () => renderExtremeWeatherSection(true) },
    { title: '情景预测', render: () => renderScenariosSection(true) },
    { title: '结束', render: () => (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <Globe2 size={64} className="mb-8" style={{ color: colors.accent }} />
        <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          感谢聆听
        </h2>
        <p className="text-xl text-gray-400 mb-8">气候变化的未来，取决于今天的选择</p>
        <div className="text-gray-600 text-sm">
          本报告由气候变化历史数据可视化平台生成
        </div>
      </div>
    ) },
  ];

  const filteredSlides = [
    slides[0],
    ...enabledSections.map(s => {
      const idxMap: Record<string, number> = { overview: 1, trends: 2, map: 3, correlation: 4, extremeWeather: 5, scenarios: 6 };
      return slides[idxMap[s.id]];
    }).filter(Boolean),
    slides[slides.length - 1],
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-6 flex flex-col ${presentMode ? 'fixed inset-0 z-50 m-0 bg-slate-950' : 'h-[calc(100vh-8rem)]'}`}
    >
      <AnimatePresence>
        {presentMode && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-4"
            style={{ background: 'linear-gradient(180deg, rgba(2,6,23,0.95), transparent)' }}
          >
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm font-medium">
                {currentSlide + 1} / {filteredSlides.length}
              </span>
              <span className="text-white/50 text-sm">•</span>
              <span className="text-white/60 text-sm">{filteredSlides[currentSlide]?.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setAutoPlay(!autoPlay)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                      title={autoPlay ? '暂停自动播放' : '自动播放'}>
                {autoPlay ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button onClick={prevSlide}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors">
                <ArrowLeft size={18} />
              </button>
              <button onClick={nextSlide}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors">
                <ArrowRight size={18} />
              </button>
              <button onClick={toggleFullscreen}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors">
                <Minimize2 size={18} />
              </button>
              <button onClick={() => { setPresentMode(false); setAutoPlay(false); }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!presentMode && (
        <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              报告生成器
            </h1>
            <p className="text-gray-400">
              配置章节内容，支持课堂讲解模式、故事线展示，一键导出
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-xl bg-white/5 border border-white/10 p-1">
              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'config' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Settings size={16} /> 配置
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'preview' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Eye size={16} /> 报告
              </button>
              <button
                onClick={() => setActiveTab('story')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'story' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Share2 size={16} /> 故事线
              </button>
            </div>

            <button
              onClick={resetViewConfigs}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <RefreshCw size={16} /> 重置
            </button>

            <button
              onClick={() => setPresentMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
              style={{ backgroundColor: colors.forest }}
            >
              <Maximize2 size={16} /> 讲解模式
            </button>

            <button
              onClick={exportReportAsHTML}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: colors.glacier }}
            >
              {exporting === 'html' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FileCode size={16} />
              )}
              导出 HTML
            </button>

            <button
              onClick={exportReportAsPNG}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: colors.accent }}
            >
              {exporting === 'png' ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={16} />
              )}
              导出 PNG
            </button>
          </div>
        </motion.div>
      )}

      <div className="flex-1 overflow-hidden relative">
        {presentMode ? (
          <div className="w-full h-full flex items-center justify-center px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-6xl h-full py-16"
              >
                {filteredSlides[currentSlide]?.render()}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : activeTab === 'story' ? (
          <div className="h-full glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Share2 size={18} style={{ color: colors.accent }} />
                  气候变迁故事线
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  从工业化初期到未来展望，关键节点一览
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStoryAutoPlay(!storyAutoPlay)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {storyAutoPlay ? <Pause size={14} /> : <Play size={14} />}
                  {storyAutoPlay ? '暂停循环' : '自动循环'}
                </button>
                <button onClick={prevStory}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors">
                  <SkipBack size={16} />
                </button>
                <button onClick={nextStory}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 transition-colors">
                  <SkipForward size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 py-4 border-b border-white/5 flex-shrink-0">
              {storyYears.map((s, idx) => (
                <React.Fragment key={s.year}>
                  <button
                    onClick={() => setStoryYearIndex(idx)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      storyYearIndex === idx
                        ? 'text-white shadow-lg scale-105'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                    style={{
                      backgroundColor: storyYearIndex === idx ? `${s.accent}30` : 'transparent',
                      border: storyYearIndex === idx ? `1px solid ${s.accent}` : '1px solid transparent',
                    }}
                  >
                    {s.year}
                  </button>
                  {idx < storyYears.length - 1 && (
                    <div className="w-8 h-px bg-white/10" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="flex-1 overflow-hidden relative">
              {storyYears.map((s, idx) => {
                const tempData = climateData.find(d => d.year === s.year);
                return (
                  <AnimatePresence key={s.year}>
                    {storyYearIndex === idx && (
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5 }}
                        className={`h-full flex items-center px-8 md:px-16 py-12 bg-gradient-to-br ${s.bg} to-transparent`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-6xl mx-auto">
                          <div>
                            <div className="inline-flex px-4 py-1.5 rounded-full text-sm font-medium mb-6"
                                 style={{ backgroundColor: `${s.accent}20`, color: s.accent, border: `1px solid ${s.accent}30` }}>
                              {s.era}
                            </div>
                            <div className="text-7xl md:text-8xl font-bold mb-4 font-mono" style={{ color: s.accent }}>
                              {s.year}
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              {s.subtitle}
                            </h3>
                            <p className="text-lg text-gray-300 leading-relaxed mb-8">
                              {s.narrative}
                            </p>
                            <div className="space-y-3">
                              {s.keyEvents.map((e, i) => (
                                <div key={i} className="flex items-start gap-3">
                                  <ChevronRight size={18} className="flex-shrink-0 mt-0.5" style={{ color: s.accent }} />
                                  <span className="text-gray-200">{e}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-center">
                            {!s.isFuture && tempData ? (
                              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                <div className="p-6 rounded-2xl border"
                                     style={{ backgroundColor: 'rgba(249, 115, 22, 0.08)', borderColor: `${s.accent}40` }}>
                                  <div className="text-xs text-gray-400 mb-2">温度异常</div>
                                  <div className="text-4xl font-bold text-white font-mono mb-1">
                                    {s.temp > 0 ? '+' : ''}{s.temp.toFixed(2)}°C
                                  </div>
                                  <div className="text-xs text-gray-500">vs. 工业化前</div>
                                </div>
                                <div className="p-6 rounded-2xl border"
                                     style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', borderColor: `${colors.glacier}40` }}>
                                  <div className="text-xs text-gray-400 mb-2">CO₂ 浓度</div>
                                  <div className="text-4xl font-bold text-white font-mono mb-1">
                                    {s.co2.toFixed(0)}
                                  </div>
                                  <div className="text-xs text-gray-500">parts per million</div>
                                </div>
                                <div className="p-6 rounded-2xl border bg-white/[0.03] border-white/10 col-span-2">
                                  <div className="text-xs text-gray-400 mb-3">全球极端天气指数</div>
                                  <div className="h-3 rounded-full bg-white/5 overflow-hidden mb-2">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${Math.min(100, s.year < 1950 ? 20 : s.year < 2000 ? 45 : s.year < 2025 ? 78 : 100)}%`,
                                        background: `linear-gradient(90deg, ${colors.forest}, ${s.accent})`,
                                      }}
                                    />
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>稳定</span>
                                    <span>警戒</span>
                                    <span>危急</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full max-w-md">
                                <div className="p-8 rounded-2xl border-2 border-dashed"
                                     style={{ borderColor: `${s.accent}40`, backgroundColor: `${s.accent}05` }}>
                                  <div className="text-center mb-6">
                                    <Globe2 size={48} className="mx-auto mb-3" style={{ color: s.accent }} />
                                    <div className="text-sm text-gray-400 mb-1">2100年温升情景</div>
                                    <div className="text-xs text-gray-500">今天的选择将决定未来的气候</div>
                                  </div>
                                  <div className="space-y-3">
                                    {scenarioPredictions.map(sc => {
                                      const t = sc.data.find(d => d.year === 2100);
                                      return (
                                        <div key={sc.scenarioCode} className="flex items-center gap-3">
                                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: sc.color }} />
                                          <div className="flex-1 text-sm text-gray-300">{sc.scenarioCode}</div>
                                          <div className="font-mono font-bold" style={{ color: sc.color }}>
                                            +{t?.temperature.toFixed(1)}°C
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-2 py-4 border-t border-white/5 flex-shrink-0">
              {storyYears.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setStoryYearIndex(idx)}
                  className={`w-2 rounded-full transition-all ${
                    storyYearIndex === idx ? 'w-8 h-2 bg-orange-400' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : activeTab === 'config' ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full space-y-5 overflow-y-auto pr-2"
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
                    className={`p-4 rounded-xl border transition-all ${
                      section.enabled
                        ? 'bg-white/5 border-white/10 hover:border-white/20'
                        : 'bg-white/[0.02] border-white/5 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3"
                         onClick={() => toggleReportSection(section.id)}>
                      <div
                        className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors cursor-pointer ${
                          section.enabled
                            ? 'bg-orange-500 border-orange-500'
                            : 'border-gray-600'
                        }`}
                      >
                        {section.enabled && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-white text-sm flex items-center gap-2">
                            <span className="text-gray-500 text-xs">{idx + 1}.</span>
                            {section.title}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{section.description}</p>

                        {section.enabled && (
                          <div className="flex gap-4 mt-3 pt-3 border-t border-white/5">
                            <label className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-300 cursor-pointer"
                                   onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={section.includeChart}
                                onChange={e => updateReportSection(section.id, { includeChart: e.target.checked })}
                                className="accent-orange-500"
                              />
                              图表/指标
                            </label>
                            <label className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-300 cursor-pointer"
                                   onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={section.includeConclusions}
                                onChange={e => updateReportSection(section.id, { includeConclusions: e.target.checked })}
                                className="accent-orange-500"
                              />
                              关键结论
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
                <Share2 size={18} style={{ color: colors.forest }} /> 功能说明
              </h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex gap-2">
                  <ChevronRight size={12} className="flex-shrink-0 mt-0.5" />
                  <span>「讲解模式」可全屏按章节分页播放，支持自动播放和键盘方向键切换</span>
                </li>
                <li className="flex gap-2">
                  <ChevronRight size={12} className="flex-shrink-0 mt-0.5" />
                  <span>「故事线」将关键年份（1850/1950/2000/2024/2100）串联，适合展览屏循环展示</span>
                </li>
                <li className="flex gap-2">
                  <ChevronRight size={12} className="flex-shrink-0 mt-0.5" />
                  <span>各数据页面调整的参数（指标、时间、情景等）会自动保存在此处复用</span>
                </li>
                <li className="flex gap-2">
                  <ChevronRight size={12} className="flex-shrink-0 mt-0.5" />
                  <span>HTML 导出包含完整 CSS 与字体链接，离线可打开，支持浏览器打印</span>
                </li>
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full overflow-hidden glass-card rounded-2xl border border-white/10 flex flex-col"
          >
            <div className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between border-b border-white/10 flex-shrink-0"
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

            <div className="flex-1 overflow-y-auto">
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
                    {renderOverviewSection()}
                    {renderTrendsSection()}
                    {renderMapSection()}
                    {renderCorrelationSection()}
                    {renderExtremeWeatherSection()}
                    {renderScenariosSection()}
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
        )}
      </div>
    </motion.div>
  );
};
