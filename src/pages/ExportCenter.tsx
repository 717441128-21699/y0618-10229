import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '../components/ui/StatCard';
import { colors } from '../utils/colors';
import { climateData } from '../data/mockData/climateGenerator';
import { regionTemperatures } from '../data/mockData/regionTemps';
import { extremeWeatherData } from '../data/mockData/extremeWeather';
import { scenarioPredictions } from '../data/mockData/scenarios';
import {
  exportClimateChartAsPNG,
  exportRegionChartAsPNG,
  exportExtremeWeatherChartAsPNG,
  exportScenarioChartAsPNG,
} from '../utils/chartExporter';
import { Download, FileText, Image, Table, BarChart3, Map, TrendingUp, CloudRain, Globe, ThermometerSun } from 'lucide-react';

interface ExportItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  data: any[];
  formats: string[];
  color: string;
  exportPNG: (filename: string) => void;
}

export const ExportCenter: React.FC = () => {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportItems: ExportItem[] = [
    {
      id: 'climate',
      name: '全球气候指标数据',
      description: '1850-2024年全球温度、CO₂浓度、海平面高度、海冰面积数据',
      icon: <TrendingUp className="w-5 h-5" />,
      data: climateData,
      formats: ['CSV', 'JSON', 'PNG'],
      color: colors.accent,
      exportPNG: exportClimateChartAsPNG,
    },
    {
      id: 'regions',
      name: '地区温度数据',
      description: '全球各地区1950-2024年温度异常数据',
      icon: <Globe className="w-5 h-5" />,
      data: regionTemperatures,
      formats: ['CSV', 'JSON', 'PNG'],
      color: colors.forest,
      exportPNG: exportRegionChartAsPNG,
    },
    {
      id: 'extreme',
      name: '极端天气事件数据',
      description: '1950s-2020s各年代极端天气事件统计',
      icon: <CloudRain className="w-5 h-5" />,
      data: extremeWeatherData,
      formats: ['CSV', 'JSON', 'PNG'],
      color: colors.warning,
      exportPNG: exportExtremeWeatherChartAsPNG,
    },
    {
      id: 'scenarios',
      name: 'IPCC情景预测数据',
      description: '2024-2100年四种排放情景下的温升预测数据',
      icon: <ThermometerSun className="w-5 h-5" />,
      data: scenarioPredictions,
      formats: ['CSV', 'JSON', 'PNG'],
      color: colors.scenarios['SSP2-4.5'],
      exportPNG: exportScenarioChartAsPNG,
    },
  ];

  const totalDataPoints = climateData.length + 
    regionTemperatures.reduce((sum, r) => sum + Object.keys(r.temperatureAnomalies).length, 0) +
    extremeWeatherData.reduce((sum, d) => sum + (d.heatwaves + d.heavyRain + d.hurricanes + d.droughts), 0) +
    scenarioPredictions.reduce((sum, s) => sum + s.data.length, 0);

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

  const flattenRegionData = () => {
    const result: any[] = [];
    regionTemperatures.forEach(region => {
      Object.entries(region.temperatureAnomalies).forEach(([year, temp]) => {
        result.push({
          regionCode: region.regionCode,
          regionName: region.regionName,
          latitude: region.latitude,
          longitude: region.longitude,
          year: parseInt(year),
          temperatureAnomaly: temp,
        });
      });
    });
    return result;
  };

  const flattenScenarioData = () => {
    const result: any[] = [];
    scenarioPredictions.forEach(scenario => {
      scenario.data.forEach(d => {
        result.push({
          scenario: scenario.scenario,
          scenarioCode: scenario.scenarioCode,
          year: d.year,
          temperature: d.temperature,
          lowerBound: d.lowerBound,
          upperBound: d.upperBound,
        });
      });
    });
    return result;
  };

  const exportAsCSV = (item: ExportItem, filename: string) => {
    let data = item.data;
    
    if (item.id === 'regions') {
      data = flattenRegionData();
    } else if (item.id === 'scenarios') {
      data = flattenScenarioData();
    }
    
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'object' ? `"${JSON.stringify(val)}"` : val
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportAsJSON = (item: ExportItem, filename: string) => {
    let data = item.data;
    
    if (item.id === 'regions') {
      data = flattenRegionData();
    } else if (item.id === 'scenarios') {
      data = flattenScenarioData();
    }
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.click();
  };

  const handleExport = (item: ExportItem, format: string) => {
    setExporting(`${item.id}-${format}`);
    
    setTimeout(() => {
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${item.name}_${timestamp}`;
      
      if (format === 'CSV') {
        exportAsCSV(item, filename);
      } else if (format === 'JSON') {
        exportAsJSON(item, filename);
      } else if (format === 'PNG') {
        item.exportPNG(filename);
      }
      
      setExporting(null);
    }, 300);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          数据导出中心
        </h1>
        <p className="text-gray-400">
          导出气候数据用于报告、研究或展览展示
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="数据记录总数"
          value={totalDataPoints.toLocaleString()}
          subtitle="条可导出数据记录"
          icon={<Table className="w-5 h-5" />}
          color={colors.accent}
        />
        <StatCard
          title="时间跨度"
          value="174年"
          subtitle="1850年 - 2024年"
          icon={<BarChart3 className="w-5 h-5" />}
          color={colors.forest}
        />
        <StatCard
          title="覆盖地区"
          value="20+"
          subtitle="全球主要国家和地区"
          icon={<Map className="w-5 h-5" />}
          color={colors.glacier}
        />
        <StatCard
          title="情景预测"
          value="4种"
          subtitle="IPCC AR6 排放情景"
          icon={<ThermometerSun className="w-5 h-5" />}
          color={colors.scenarios['SSP2-4.5']}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-white mb-4">可导出数据集</h2>
        <div className="space-y-4">
          {exportItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="glass-card rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">数据记录:</span>
                      <span className="text-gray-300 font-mono">{item.data.length.toLocaleString()} 条</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.formats.map((format) => {
                    const isExporting = exporting === `${item.id}-${format}`;
                    const formatIcon = format === 'CSV' || format === 'JSON' 
                      ? <FileText className="w-4 h-4" />
                      : <Image className="w-4 h-4" />;
                    
                    return (
                      <motion.button
                        key={format}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleExport(item, format)}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: isExporting ? `${item.color}40` : `${item.color}15`,
                          color: item.color,
                          border: `1px solid ${item.color}30`,
                        }}
                      >
                        {isExporting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" 
                                 style={{ borderColor: item.color, borderTopColor: 'transparent' }} />
                            <span>导出中...</span>
                          </>
                        ) : (
                          <>
                            {formatIcon}
                            <span>{format}</span>
                          </>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">导出说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: colors.forest }} />
              <h3 className="font-medium text-white">CSV 格式</h3>
            </div>
            <p className="text-sm text-gray-400">
              逗号分隔值格式，适用于Excel、Google Sheets等电子表格软件，
              方便进行数据处理和分析。
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: colors.glacier }} />
              <h3 className="font-medium text-white">JSON 格式</h3>
            </div>
            <p className="text-sm text-gray-400">
              JavaScript对象表示法，适用于程序开发和数据交换，
              保留完整的层级结构和数据类型。
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5" style={{ color: colors.accent }} />
              <h3 className="font-medium text-white">PNG 格式</h3>
            </div>
            <p className="text-sm text-gray-400">
              高清图片导出，适用于报告、演示文稿和展览展示，
              保留所有图表样式和标注。
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 bg-gradient-to-r from-orange-500/5 to-rose-500/5 border-orange-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500/20 flex-shrink-0">
            <Download className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">数据来源说明</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              本平台提供的数据基于真实气候科学趋势建模，包括NOAA全球温度异常数据、
              夏威夷莫纳罗亚天文台CO₂观测数据、IPCC AR6情景预测数据等。
              模拟数据用于展示和教学目的，实际研究请参考官方数据源。
              所有图表可在各功能页面通过右上角导出按钮直接导出为高清图片。
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
