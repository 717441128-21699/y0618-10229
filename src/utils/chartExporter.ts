import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { chartBaseConfig, axisConfig, tooltipConfig, legendConfig, getLineSeriesConfig, getBarSeriesConfig, baselineMarkLine, targetLineConfig } from './chartConfig';
import { colors } from './colors';
import { climateData } from '../data/mockData/climateGenerator';
import { regionTemperatures } from '../data/mockData/regionTemps';
import { extremeWeatherData, extremeWeatherTypes } from '../data/mockData/extremeWeather';
import { scenarioPredictions } from '../data/mockData/scenarios';

const createChartCanvas = (option: EChartsOption, width: number = 1200, height: number = 700): string => {
  const div = document.createElement('div');
  div.style.width = `${width}px`;
  div.style.height = `${height}px`;
  div.style.position = 'absolute';
  div.style.left = '-9999px';
  div.style.top = '-9999px';
  document.body.appendChild(div);

  const chart = echarts.init(div, undefined, { renderer: 'canvas' });
  chart.setOption(option);

  const dataUrl = chart.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#0F172A',
  });

  chart.dispose();
  document.body.removeChild(div);

  return dataUrl;
};

const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

export const exportClimateChartAsPNG = (filename: string = 'global-climate-data') => {
  const tempData = climateData.map(d => [d.year, d.temperature] as [number, number]);
  const co2Data = climateData.map(d => [d.year, d.co2] as [number, number]);
  const seaLevelData = climateData.map(d => [d.year, d.seaLevel] as [number, number]);
  const seaIceData = climateData.map(d => [d.year, d.seaIce] as [number, number]);

  const option: EChartsOption = {
    ...chartBaseConfig,
    title: {
      text: '全球气候变化趋势 (1850-2024)',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: "'Space Grotesk', sans-serif",
      },
    },
    tooltip: {
      ...tooltipConfig,
      trigger: 'axis' as const,
    },
    legend: {
      ...legendConfig,
      data: ['温度异常 (°C)', 'CO₂浓度 (ppm)', '海平面变化 (mm)', '海冰面积 (百万km²)'],
      top: 40,
    },
    grid: {
      left: 60,
      right: 60,
      top: 100,
      bottom: 60,
    },
    xAxis: {
      ...axisConfig.xAxis,
      type: 'value' as const,
      name: '年份',
      min: 1850,
      max: 2024,
    },
    yAxis: [
      {
        ...axisConfig.yAxis,
        type: 'value' as const,
        name: '温度异常 (°C)',
        position: 'left' as const,
      },
      {
        ...axisConfig.yAxis,
        type: 'value' as const,
        name: 'CO₂浓度 (ppm)',
        position: 'right' as const,
      },
    ],
    series: [
      {
        ...getLineSeriesConfig('温度异常 (°C)', tempData, colors.accent, false),
        yAxisIndex: 0,
      },
      {
        ...getLineSeriesConfig('CO₂浓度 (ppm)', co2Data, colors.glacier, false),
        yAxisIndex: 1,
      },
    ],
  };

  const dataUrl = createChartCanvas(option, 1400, 800);
  downloadDataUrl(dataUrl, `${filename}.png`);
};

export const exportRegionChartAsPNG = (filename: string = 'regional-temperature') => {
  const regions = regionTemperatures.slice(0, 10);
  const latestYear = 2024;
  
  const barData: [string, number][] = regions.map(r => [r.regionName, r.temperatureAnomalies[latestYear] || 0]);

  const option: EChartsOption = {
    ...chartBaseConfig,
    title: {
      text: '各地区温度异常 (2024年)',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: "'Space Grotesk', sans-serif",
      },
    },
    tooltip: {
      ...tooltipConfig,
      trigger: 'axis' as const,
    },
    grid: {
      left: 80,
      right: 40,
      top: 70,
      bottom: 60,
    },
    xAxis: {
      ...axisConfig.xAxis,
      type: 'category' as const,
      data: regions.map(r => r.regionName),
      axisLabel: {
        rotate: 30,
        color: '#94A3B8',
        fontSize: 12,
      },
    },
    yAxis: {
      ...axisConfig.yAxis,
      type: 'value' as const,
      name: '温度异常 (°C)',
    },
    series: [
      getBarSeriesConfig('温度异常', barData, colors.accent),
    ],
  };

  const dataUrl = createChartCanvas(option, 1400, 800);
  downloadDataUrl(dataUrl, `${filename}.png`);
};

export const exportExtremeWeatherChartAsPNG = (filename: string = 'extreme-weather') => {
  const decades = extremeWeatherData.map(d => d.decade);
  const heatwavesData: [string, number][] = extremeWeatherData.map(d => [d.decade, d.heatwaves]);
  const heavyRainData: [string, number][] = extremeWeatherData.map(d => [d.decade, d.heavyRain]);
  const hurricanesData: [string, number][] = extremeWeatherData.map(d => [d.decade, d.hurricanes]);
  const droughtsData: [string, number][] = extremeWeatherData.map(d => [d.decade, d.droughts]);

  const option: EChartsOption = {
    ...chartBaseConfig,
    title: {
      text: '极端天气事件频率变化 (1950s-2020s)',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: "'Space Grotesk', sans-serif",
      },
    },
    tooltip: {
      ...tooltipConfig,
      trigger: 'axis' as const,
    },
    legend: {
      ...legendConfig,
      data: ['极端高温', '暴雨事件', '飓风/台风', '严重干旱'],
      top: 40,
    },
    grid: {
      left: 60,
      right: 40,
      top: 90,
      bottom: 60,
    },
    xAxis: {
      ...axisConfig.xAxis,
      type: 'category' as const,
      data: decades,
    },
    yAxis: {
      ...axisConfig.yAxis,
      type: 'value' as const,
      name: '事件次数',
    },
    series: [
      getBarSeriesConfig('极端高温', heatwavesData, extremeWeatherTypes[0].color),
      getBarSeriesConfig('暴雨事件', heavyRainData, extremeWeatherTypes[1].color),
      getBarSeriesConfig('飓风/台风', hurricanesData, extremeWeatherTypes[2].color),
      getBarSeriesConfig('严重干旱', droughtsData, extremeWeatherTypes[3].color),
    ],
  };

  const dataUrl = createChartCanvas(option, 1400, 800);
  downloadDataUrl(dataUrl, `${filename}.png`);
};

export const exportScenarioChartAsPNG = (filename: string = 'scenario-predictions') => {
  const historicalData = climateData
    .filter(d => d.year >= 1950)
    .map(d => [d.year, d.temperature] as [number, number]);

  const series: any[] = [
    {
      name: '历史观测数据',
      type: 'line',
      data: historicalData,
      smooth: true,
      lineStyle: { width: 3, color: colors.accent },
      itemStyle: { color: colors.accent },
      showSymbol: false,
    },
  ];

  scenarioPredictions.forEach((scenario) => {
    const stackId = `stack_${scenario.scenarioCode}`;
    
    const lowerData = scenario.data.map(d => [d.year, d.lowerBound] as [number, number]);
    const rangeData = scenario.data.map(d => [d.year, d.upperBound - d.lowerBound] as [number, number]);
    const midData = scenario.data.map(d => [d.year, d.temperature] as [number, number]);

    series.push(
      {
        name: `${scenario.scenario}_lower`,
        type: 'line',
        data: lowerData,
        stack: stackId,
        lineStyle: { width: 0 },
        showSymbol: false,
        color: 'transparent',
        areaStyle: { opacity: 0 },
        tooltip: { show: false },
      },
      {
        name: `${scenario.scenario}_range`,
        type: 'line',
        data: rangeData,
        stack: stackId,
        lineStyle: { width: 0 },
        showSymbol: false,
        color: 'transparent',
        areaStyle: { color: `${scenario.color}30` },
        tooltip: { show: false },
      },
      {
        name: scenario.scenario,
        type: 'line',
        data: midData,
        smooth: true,
        lineStyle: {
          width: 3,
          color: scenario.color,
          type: 'dashed' as const,
        },
        itemStyle: { color: scenario.color },
        showSymbol: false,
      }
    );
  });

  const markLines = [
    targetLineConfig(1.5, '1.5°C 目标', colors.forest),
    targetLineConfig(2.0, '2.0°C 上限', colors.warning),
  ];

  const option: EChartsOption = {
    ...chartBaseConfig,
    title: {
      text: 'IPCC排放情景温升预测 (2024-2100)',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: "'Space Grotesk', sans-serif",
      },
    },
    tooltip: {
      ...tooltipConfig,
      trigger: 'axis' as const,
    },
    legend: {
      ...legendConfig,
      data: ['历史观测数据', ...scenarioPredictions.map(s => s.scenario)],
      top: 40,
    },
    grid: {
      left: 60,
      right: 40,
      top: 90,
      bottom: 60,
    },
    xAxis: {
      ...axisConfig.xAxis,
      type: 'value' as const,
      min: 1950,
      max: 2100,
    },
    yAxis: {
      ...axisConfig.yAxis,
      type: 'value' as const,
      name: '温度异常 (°C)',
      min: 0,
      max: 7,
    },
    series: series.map(s => ({
      ...s,
      markLine: s.name === '历史观测数据' ? { data: markLines.flatMap(m => m.data) } : undefined,
    })),
  };

  const dataUrl = createChartCanvas(option, 1400, 800);
  downloadDataUrl(dataUrl, `${filename}.png`);
};
