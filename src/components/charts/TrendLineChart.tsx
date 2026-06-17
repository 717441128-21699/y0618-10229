import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { chartBaseConfig, axisConfig, tooltipConfig, legendConfig, getLineSeriesConfig, baselineMarkLine } from '../../utils/chartConfig';
import { colors } from '../../utils/colors';
import type { ClimateDataPoint, MetricType } from '../../data/types';
import { metricConfigs } from '../../data/mockData/climateGenerator';
import { calculateDecadalAverage } from '../../data/statistics';
import { formatTemperature, formatCO2, formatSeaLevel, formatSeaIce } from '../../utils/formatters';

interface TrendLineChartProps {
  data: ClimateDataPoint[];
  selectedMetrics: MetricType[];
  timeGranularity: 'yearly' | 'decadal';
  showBaseline: boolean;
  chartRef?: React.RefObject<HTMLDivElement>;
}

const getMetricConfig = (metric: MetricType) => {
  return metricConfigs.find(m => m.key === metric);
};

const formatValue = (metric: MetricType, value: number): string => {
  const formatters: Record<MetricType, (v: number) => string> = {
    temperature: (v) => formatTemperature(v, true),
    co2: formatCO2,
    seaLevel: (v) => formatSeaLevel(v, true),
    seaIce: formatSeaIce,
  };
  return formatters[metric](value);
};

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  selectedMetrics,
  timeGranularity,
  showBaseline,
  chartRef,
}) => {
  const option = useMemo<EChartsOption>(() => {
    const series = selectedMetrics.map(metric => {
      const config = getMetricConfig(metric);
      if (!config) return null;

      let chartData: Array<[number, number]>;
      
      if (timeGranularity === 'yearly') {
        chartData = data.map(d => [d.year, d[metric]]);
      } else {
        const decadalData = calculateDecadalAverage(data, metric);
        chartData = decadalData.map(d => [parseInt(d.decade), d.value]);
      }

      return {
        ...getLineSeriesConfig(config.name, chartData, config.color, selectedMetrics.length === 1),
        yAxisIndex: selectedMetrics.indexOf(metric),
      };
    }).filter(Boolean);

    const yAxes = selectedMetrics.map(metric => {
      const config = getMetricConfig(metric);
      return {
        ...axisConfig.yAxis,
        type: 'value' as const,
        name: config?.name || '',
        nameTextStyle: {
          color: '#94A3B8',
          fontSize: 11,
          padding: [0, 40, 0, 0],
        },
        axisLabel: {
          ...axisConfig.yAxis.axisLabel,
          formatter: (value: number) => formatValue(metric, value),
        },
        position: selectedMetrics.indexOf(metric) % 2 === 0 ? ('left' as const) : ('right' as const),
        offset: Math.floor(selectedMetrics.indexOf(metric) / 2) * 60,
      };
    });

    const markLines = showBaseline ? { markLine: baselineMarkLine } : {};

    return {
      ...chartBaseConfig,
      tooltip: {
        ...tooltipConfig,
        trigger: 'axis' as const,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let html = `<div class="font-semibold mb-2">${params[0].axisValue}年</div>`;
          params.forEach((param: any) => {
            const metricKey = selectedMetrics[param.seriesIndex];
            html += `
              <div class="flex items-center gap-2 py-1">
                <span class="w-2 h-2 rounded-full" style="background-color: ${param.color}"></span>
                <span class="text-gray-400">${param.seriesName}:</span>
                <span class="font-mono font-medium" style="color: ${param.color}">${formatValue(metricKey, param.value)}</span>
              </div>
            `;
          });
          return html;
        },
      },
      legend: {
        ...legendConfig,
        data: selectedMetrics.map(m => getMetricConfig(m)?.name || ''),
      },
      grid: {
        ...chartBaseConfig.grid,
        left: 80,
        right: 80,
      },
      xAxis: {
        ...axisConfig.xAxis,
        type: 'value' as const,
        min: Math.min(...data.map(d => d.year)),
        max: Math.max(...data.map(d => d.year)),
        axisLabel: {
          ...axisConfig.xAxis.axisLabel,
          formatter: (value: number) => `${value}`,
        },
      },
      yAxis: yAxes.length === 1 ? yAxes[0] : yAxes,
      series: series.map(s => ({
        ...s,
        ...markLines,
      })),
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: 100,
        },
      ],
    };
  }, [data, selectedMetrics, timeGranularity, showBaseline]);

  return (
    <div ref={chartRef} className="w-full h-full min-h-[400px]">
      <ReactECharts
        option={option}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};
