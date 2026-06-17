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

  const gridTop = 80;
  const gridBottom = 50;
  const chartHeight = 220;
  const gap = 60;

  const option: EChartsOption = {
    ...chartBaseConfig,
    title: {
      text: '全球气候变化趋势 (1850-2024)',
      subtext: '温度异常 · CO₂浓度 · 海平面变化 · 海冰面积',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: "'Space Grotesk', sans-serif",
      },
      subtextStyle: {
        color: '#94A3B8',
        fontSize: 13,
      },
    },
    tooltip: {
      ...tooltipConfig,
      trigger: 'axis' as const,
    },
    legend: {
      ...legendConfig,
      data: ['温度异常', 'CO₂浓度', '海平面变化', '海冰面积'],
      top: 55,
    },
    grid: [
      {
        left: 80,
        right: 60,
        top: gridTop,
        height: chartHeight,
      },
      {
        left: 80,
        right: 60,
        top: gridTop + chartHeight + gap,
        height: chartHeight,
      },
      {
        left: 80,
        right: 60,
        top: gridTop + 2 * (chartHeight + gap),
        height: chartHeight,
      },
      {
        left: 80,
        right: 60,
        top: gridTop + 3 * (chartHeight + gap),
        height: chartHeight,
      },
    ],
    xAxis: [
      {
        ...axisConfig.xAxis,
        type: 'value' as const,
        gridIndex: 0,
        min: 1850,
        max: 2024,
        axisLabel: { show: false },
      },
      {
        ...axisConfig.xAxis,
        type: 'value' as const,
        gridIndex: 1,
        min: 1850,
        max: 2024,
        axisLabel: { show: false },
      },
      {
        ...axisConfig.xAxis,
        type: 'value' as const,
        gridIndex: 2,
        min: 1850,
        max: 2024,
        axisLabel: { show: false },
      },
      {
        ...axisConfig.xAxis,
        type: 'value' as const,
        gridIndex: 3,
        min: 1850,
        max: 2024,
        name: '年份',
        nameTextStyle: { color: '#94A3B8', fontSize: 12 },
      },
    ],
    yAxis: [
      {
        ...axisConfig.yAxis,
        type: 'value' as const,
        gridIndex: 0,
        name: '温度异常\n(°C)',
        nameTextStyle: { color: colors.accent, fontSize: 11 },
        axisLabel: { color: colors.accent, fontSize: 10 },
      },
      {
        ...axisConfig.yAxis,
        type: 'value' as const,
        gridIndex: 1,
        name: 'CO₂浓度\n(ppm)',
        nameTextStyle: { color: colors.glacier, fontSize: 11 },
        axisLabel: { color: colors.glacier, fontSize: 10 },
      },
      {
        ...axisConfig.yAxis,
        type: 'value' as const,
        gridIndex: 2,
        name: '海平面\n(mm)',
        nameTextStyle: { color: colors.forest, fontSize: 11 },
        axisLabel: { color: colors.forest, fontSize: 10 },
      },
      {
        ...axisConfig.yAxis,
        type: 'value' as const,
        gridIndex: 3,
        name: '海冰面积\n(百万km²)',
        nameTextStyle: { color: colors.scenarios['SSP1-2.6'], fontSize: 11 },
        axisLabel: { color: colors.scenarios['SSP1-2.6'], fontSize: 10 },
        inverse: true,
      },
    ],
    series: [
      {
        ...getLineSeriesConfig('温度异常', tempData, colors.accent, true),
        xAxisIndex: 0,
        yAxisIndex: 0,
        markLine: { data: [baselineMarkLine.data[0]] },
      },
      {
        ...getLineSeriesConfig('CO₂浓度', co2Data, colors.glacier, true),
        xAxisIndex: 1,
        yAxisIndex: 1,
      },
      {
        ...getLineSeriesConfig('海平面变化', seaLevelData, colors.forest, true),
        xAxisIndex: 2,
        yAxisIndex: 2,
      },
      {
        ...getLineSeriesConfig('海冰面积', seaIceData, colors.scenarios['SSP1-2.6'], true),
        xAxisIndex: 3,
        yAxisIndex: 3,
      },
    ],
  };

  const dataUrl = createChartCanvas(option, 1400, 1200);
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
