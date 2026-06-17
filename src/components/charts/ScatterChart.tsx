import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { chartBaseConfig, axisConfig, tooltipConfig, legendConfig } from '../../utils/chartConfig';
import { colors } from '../../utils/colors';
import type { ClimateDataPoint, CorrelationResult } from '../../data/types';
import { formatTemperature, formatCO2 } from '../../utils/formatters';

interface ScatterChartProps {
  data: ClimateDataPoint[];
  correlationResult: CorrelationResult;
  yearRange?: [number, number];
  chartRef?: React.RefObject<HTMLDivElement>;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  correlationResult,
  yearRange,
  chartRef,
}) => {
  const option = useMemo<EChartsOption>(() => {
    const filteredData = yearRange
      ? data.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1])
      : data;

    const scatterData = filteredData.map(d => ({
      value: [d.co2, d.temperature, d.year],
      itemStyle: {
        color: d.year < 1950 
          ? colors.glacier 
          : d.year < 2000 
            ? colors.forest 
            : colors.accent,
        opacity: 0.7,
      },
    }));

    const minCO2 = Math.min(...filteredData.map(d => d.co2));
    const maxCO2 = Math.max(...filteredData.map(d => d.co2));
    
    const regressionLine = [
      [minCO2, correlationResult.slope * minCO2 + correlationResult.intercept],
      [maxCO2, correlationResult.slope * maxCO2 + correlationResult.intercept],
    ];

    return {
      ...chartBaseConfig,
      tooltip: {
        ...tooltipConfig,
        trigger: 'item' as const,
        formatter: (params: any) => {
          const [co2, temp, year] = params.value;
          return `
            <div class="font-semibold mb-2">${year}年</div>
            <div class="flex items-center gap-2 py-1">
              <span class="text-gray-400">CO₂浓度:</span>
              <span class="font-mono font-medium" style="color: ${colors.glacier}">${formatCO2(co2)}</span>
            </div>
            <div class="flex items-center gap-2 py-1">
              <span class="text-gray-400">温度异常:</span>
              <span class="font-mono font-medium" style="color: ${colors.accent}">${formatTemperature(temp, true)}</span>
            </div>
          `;
        },
      },
      legend: {
        ...legendConfig,
        data: ['观测数据', '回归趋势线'],
      },
      grid: {
        ...chartBaseConfig.grid,
        left: 80,
        right: 40,
      },
      xAxis: {
        ...axisConfig.xAxis,
        type: 'value' as const,
        name: 'CO₂浓度 (ppm)',
        nameTextStyle: {
          color: '#94A3B8',
          fontSize: 12,
          padding: [10, 0, 0, 0],
        },
        axisLabel: {
          ...axisConfig.xAxis.axisLabel,
          formatter: (value: number) => `${value}`,
        },
      },
      yAxis: {
        ...axisConfig.yAxis,
        type: 'value' as const,
        name: '温度异常 (°C)',
        nameTextStyle: {
          color: '#94A3B8',
          fontSize: 12,
          padding: [0, 0, 0, 10],
        },
        axisLabel: {
          ...axisConfig.yAxis.axisLabel,
          formatter: (value: number) => formatTemperature(value, true),
        },
      },
      series: [
        {
          name: '观测数据',
          type: 'scatter',
          data: scatterData,
          symbolSize: 8,
          emphasis: {
            focus: 'series',
            itemStyle: {
              opacity: 1,
              borderWidth: 2,
              borderColor: '#fff',
            },
          },
        },
        {
          name: '回归趋势线',
          type: 'line',
          data: regressionLine,
          smooth: false,
          lineStyle: {
            color: colors.warning,
            width: 3,
            type: 'solid',
          },
          symbol: 'none',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              color: '#94A3B8',
              type: 'dashed',
              width: 1,
            },
            data: [{ yAxis: 0 }],
          },
        },
      ],
    };
  }, [data, correlationResult, yearRange]);

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
