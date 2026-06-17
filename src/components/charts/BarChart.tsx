import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { chartBaseConfig, axisConfig, tooltipConfig, legendConfig, getBarSeriesConfig } from '../../utils/chartConfig';
import { colors } from '../../utils/colors';
import type { ExtremeWeatherDecade } from '../../data/types';
import { extremeWeatherTypes } from '../../data/mockData/extremeWeather';

interface BarChartProps {
  data: ExtremeWeatherDecade[];
  selectedTypes: string[];
  chartRef?: React.RefObject<HTMLDivElement>;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  selectedTypes,
  chartRef,
}) => {
  const option = useMemo<EChartsOption>(() => {
    const xAxisData = data.map(d => d.decade.replace('s', '年代'));
    
    const series = selectedTypes.map(typeKey => {
      const typeConfig = extremeWeatherTypes.find(t => t.key === typeKey);
      if (!typeConfig) return null;

      const barData = data.map(d => ({
        value: d[typeKey as keyof Omit<ExtremeWeatherDecade, 'decade' | 'startYear' | 'endYear'>],
        itemStyle: {
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: typeConfig.color },
              { offset: 1, color: `${typeConfig.color}80` },
            ],
          },
        },
      }));

      return {
        name: typeConfig.name,
        type: 'bar' as const,
        data: barData,
        barGap: '10%',
        barCategoryGap: '30%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: `${typeConfig.color}50`,
          },
        },
      };
    }).filter(Boolean);

    return {
      ...chartBaseConfig,
      tooltip: {
        ...tooltipConfig,
        trigger: 'axis',
        axisPointer: {
          type: 'shadow' as const,
        },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let html = `<div class="font-semibold mb-2">${params[0].axisValue}</div>`;
          params.forEach((param: any) => {
            const typeConfig = extremeWeatherTypes.find(t => t.name === param.seriesName);
            html += `
              <div class="flex items-center gap-2 py-1">
                <span class="w-2 h-2 rounded-full" style="background-color: ${typeConfig?.color || param.color}"></span>
                <span class="text-gray-400">${param.seriesName}:</span>
                <span class="font-mono font-medium" style="color: ${typeConfig?.color || param.color}">${param.value} 次</span>
              </div>
            `;
          });
          return html;
        },
      },
      legend: {
        ...legendConfig,
        data: selectedTypes.map(t => {
          const config = extremeWeatherTypes.find(et => et.key === t);
          return config?.name || '';
        }),
      },
      grid: {
        ...chartBaseConfig.grid,
        left: 60,
        right: 40,
      },
      xAxis: {
        ...axisConfig.xAxis,
        type: 'category' as const,
        data: xAxisData,
        axisLabel: {
          ...axisConfig.xAxis.axisLabel,
          interval: 0,
          rotate: 0,
        },
      },
      yAxis: {
        ...axisConfig.yAxis,
        type: 'value' as const,
        name: '发生次数',
        nameTextStyle: {
          color: '#94A3B8',
          fontSize: 12,
          padding: [0, 0, 0, 10],
        },
        axisLabel: {
          ...axisConfig.yAxis.axisLabel,
          formatter: (value: number) => `${value}`,
        },
      },
      series,
    };
  }, [data, selectedTypes]);

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
