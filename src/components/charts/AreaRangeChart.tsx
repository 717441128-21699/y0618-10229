import React, { useMemo, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { chartBaseConfig, axisConfig, tooltipConfig, legendConfig, targetLineConfig } from '../../utils/chartConfig';
import { colors } from '../../utils/colors';
import type { ScenarioPrediction } from '../../data/types';
import { climateData } from '../../data/mockData/climateGenerator';

interface AreaRangeChartProps {
  scenarios: ScenarioPrediction[];
  selectedScenarios: string[];
  chartRef?: React.RefObject<HTMLDivElement>;
}

const interpolateValue = (data: Array<{ year: number; value: number }>, year: number): number | null => {
  if (data.length === 0) return null;
  
  if (year <= data[0].year) return data[0].value;
  if (year >= data[data.length - 1].year) return data[data.length - 1].value;
  
  for (let i = 0; i < data.length - 1; i++) {
    if (year >= data[i].year && year <= data[i + 1].year) {
      const ratio = (year - data[i].year) / (data[i + 1].year - data[i].year);
      return data[i].value + ratio * (data[i + 1].value - data[i].value);
    }
  }
  
  return null;
};

export const AreaRangeChart: React.FC<AreaRangeChartProps> = ({
  scenarios,
  selectedScenarios,
  chartRef,
}) => {
  const echartsRef = useRef<ReactECharts | null>(null);

  const option = useMemo<EChartsOption>(() => {
    const filteredScenarios = scenarios.filter(s => selectedScenarios.includes(s.scenarioCode));
    
    const historicalData = climateData
      .filter(d => d.year >= 1950)
      .map(d => [d.year, d.temperature] as [number, number]);

    const series: any[] = [
      {
        name: '历史观测数据',
        type: 'line',
        data: historicalData,
        smooth: true,
        lineStyle: {
          width: 3,
          color: colors.accent,
        },
        itemStyle: {
          color: colors.accent,
        },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: `${colors.accent}30` },
              { offset: 1, color: `${colors.accent}05` },
            ],
          },
        },
        showSymbol: false,
        z: 10,
      },
    ];

    filteredScenarios.forEach((scenario) => {
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
          z: 1,
          emphasis: { disabled: true },
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
          areaStyle: {
            color: `${scenario.color}30`,
          },
          z: 2,
          emphasis: { disabled: true },
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
          itemStyle: {
            color: scenario.color,
          },
          showSymbol: false,
          z: 5,
          emphasis: {
            focus: 'series' as const,
          },
        }
      );
    });

    const markLines = [
      targetLineConfig(1.5, '1.5°C 目标', colors.forest),
      targetLineConfig(2.0, '2.0°C 上限', colors.warning),
    ];

    return {
      ...chartBaseConfig,
      tooltip: {
        ...tooltipConfig,
        trigger: 'axis' as const,
        axisPointer: {
          type: 'cross' as const,
          snap: false,
        },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          
          const year = Math.round(params[0].axisValue);
          let html = `<div class="font-semibold mb-2 text-white">${year}年</div>`;
          
          const historicalPoint = climateData.find(d => d.year === year);
          if (historicalPoint) {
            html += `
              <div class="flex items-center gap-2 py-1">
                <span class="w-2 h-2 rounded-full" style="background-color: ${colors.accent}"></span>
                <span class="text-gray-400">历史观测:</span>
                <span class="font-mono font-medium" style="color: ${colors.accent}">+${historicalPoint.temperature.toFixed(2)}°C</span>
              </div>
            `;
          }
          
          filteredScenarios.forEach(scenario => {
            const midPoints = scenario.data.map(d => ({ year: d.year, value: d.temperature }));
            const lowerPoints = scenario.data.map(d => ({ year: d.year, value: d.lowerBound }));
            const upperPoints = scenario.data.map(d => ({ year: d.year, value: d.upperBound }));
            
            const midVal = interpolateValue(midPoints, year);
            const lowerVal = interpolateValue(lowerPoints, year);
            const upperVal = interpolateValue(upperPoints, year);
            
            if (midVal !== null && lowerVal !== null && upperVal !== null) {
              html += `
                <div class="py-1 border-t border-white/10 mt-1 pt-1">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" style="background-color: ${scenario.color}"></span>
                    <span class="text-gray-300 font-medium">${scenario.scenario}</span>
                  </div>
                  <div class="ml-4 text-xs space-y-0.5 mt-1">
                    <div class="flex justify-between gap-4">
                      <span class="text-gray-500">中值:</span>
                      <span class="font-mono" style="color: ${scenario.color}">+${midVal.toFixed(2)}°C</span>
                    </div>
                    <div class="flex justify-between gap-4">
                      <span class="text-gray-500">区间:</span>
                      <span class="font-mono text-gray-400">+${lowerVal.toFixed(2)} ~ +${upperVal.toFixed(2)}°C</span>
                    </div>
                  </div>
                </div>
              `;
            }
          });
          
          if (year > 2024 && filteredScenarios.length === 0) {
            html += `<div class="text-gray-500 text-sm mt-2">请选择至少一个情景</div>`;
          }
          
          return html;
        },
      },
      legend: {
        ...legendConfig,
        data: [
          '历史观测数据',
          ...filteredScenarios.map(s => s.scenario),
        ],
      },
      grid: {
        ...chartBaseConfig.grid,
        left: 80,
        right: 40,
      },
      xAxis: {
        ...axisConfig.xAxis,
        type: 'value' as const,
        min: 1950,
        max: 2100,
        axisLabel: {
          ...axisConfig.xAxis.axisLabel,
          formatter: (value: number) => `${Math.round(value)}`,
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
          formatter: (value: number) => `+${value.toFixed(1)}`,
        },
        min: 0,
        max: 7,
      },
      series: series.map(s => ({
        ...s,
        markLine: s.name === '历史观测数据' ? { data: markLines.flatMap(m => m.data) } : undefined,
      })),
    };
  }, [scenarios, selectedScenarios]);

  const setChartRef = (e: ReactECharts | null) => {
    echartsRef.current = e;
  };

  useEffect(() => {
    if (chartRef && 'current' in chartRef && echartsRef.current) {
      const instance = echartsRef.current.getEchartsInstance();
      if (instance) {
        const dom = instance.getDom();
        if (dom instanceof HTMLElement && chartRef.current !== dom) {
          (chartRef as React.MutableRefObject<HTMLElement>).current = dom;
        }
      }
    }
  }, [chartRef]);

  return (
    <div ref={chartRef} className="w-full h-full min-h-[500px]">
      <ReactECharts
        ref={setChartRef}
        option={option}
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};
