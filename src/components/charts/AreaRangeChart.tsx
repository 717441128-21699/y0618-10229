import React, { useMemo } from 'react';
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

export const AreaRangeChart: React.FC<AreaRangeChartProps> = ({
  scenarios,
  selectedScenarios,
  chartRef,
}) => {
  const option = useMemo<EChartsOption>(() => {
    const filteredScenarios = scenarios.filter(s => selectedScenarios.includes(s.scenarioCode));
    
    const historicalData = climateData
      .filter(d => d.year >= 1950)
      .map(d => [d.year, d.temperature]);

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
            type: 'linear',
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
      },
    ];

    filteredScenarios.forEach(scenario => {
      const midData = scenario.data.map(d => [d.year, d.temperature]);
      const upperData = scenario.data.map(d => [d.year, d.upperBound]);
      const lowerData = scenario.data.map(d => [d.year, d.lowerBound]);

      series.push(
        {
          name: `${scenario.scenario} - 上限`,
          type: 'line',
          data: upperData,
          lineStyle: {
            width: 0,
          },
          stack: scenario.scenarioCode,
          showSymbol: false,
          color: 'transparent',
        },
        {
          name: `${scenario.scenario} - 预测区间`,
          type: 'line',
          data: lowerData.map((d, i) => [d[0], upperData[i][1] - d[1]]),
          lineStyle: {
            width: 0,
          },
          stack: scenario.scenarioCode,
          showSymbol: false,
          color: 'transparent',
          areaStyle: {
            color: `${scenario.color}25`,
          },
          tooltip: {
            show: false,
          },
        },
        {
          name: scenario.scenario,
          type: 'line',
          data: midData,
          smooth: true,
          lineStyle: {
            width: 3,
            color: scenario.color,
            type: 'dashed',
          },
          itemStyle: {
            color: scenario.color,
          },
          showSymbol: false,
          emphasis: {
            focus: 'series',
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
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          const year = params[0].axisValue;
          let html = `<div class="font-semibold mb-2">${year}年</div>`;
          
          params.forEach((param: any) => {
            if (param.seriesName.includes('上限') || param.seriesName.includes('区间')) return;
            
            const scenario = filteredScenarios.find(s => s.scenario === param.seriesName);
            const color = scenario?.color || colors.accent;
            
            html += `
              <div class="flex items-center gap-2 py-1">
                <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
                <span class="text-gray-400">${param.seriesName}:</span>
                <span class="font-mono font-medium" style="color: ${color}">+${param.value.toFixed(2)}°C</span>
              </div>
            `;
          });
          
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

  return (
    <div ref={chartRef} className="w-full h-full min-h-[500px]">
      <ReactECharts
        option={option}
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};
