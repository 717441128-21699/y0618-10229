import type { EChartsOption } from 'echarts';
import { colors } from './colors';

export const chartBaseConfig: Partial<EChartsOption> = {
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#E2E8F0',
  },
  grid: {
    top: 40,
    right: 40,
    bottom: 60,
    left: 60,
  },
  animationDuration: 1000,
  animationEasing: 'cubicOut',
};

export const axisConfig = {
  xAxis: {
    axisLine: {
      lineStyle: {
        color: 'rgba(148, 163, 184, 0.3)',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#94A3B8',
      fontSize: 12,
    },
    splitLine: {
      show: false,
    },
  },
  yAxis: {
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#94A3B8',
      fontSize: 12,
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(148, 163, 184, 0.1)',
        type: 'dashed' as const,
      },
    },
  },
};

export const tooltipConfig = {
  trigger: 'axis',
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  borderColor: 'rgba(148, 163, 184, 0.3)',
  borderWidth: 1,
  padding: [12, 16],
  textStyle: {
    color: '#E2E8F0',
    fontSize: 13,
  },
  axisPointer: {
    type: 'cross' as const,
    lineStyle: {
      color: 'rgba(148, 163, 184, 0.5)',
    },
    crossStyle: {
      color: 'rgba(148, 163, 184, 0.5)',
    },
  },
};

export const legendConfig = {
  top: 0,
  right: 0,
  icon: 'circle',
  itemWidth: 8,
  itemHeight: 8,
  itemGap: 16,
  textStyle: {
    color: '#94A3B8',
    fontSize: 12,
  },
};

export const getLineSeriesConfig = (
  name: string,
  data: Array<[number, number]>,
  color: string,
  showArea: boolean = false
) => ({
  name,
  type: 'line' as const,
  data,
  smooth: true,
  symbol: 'circle',
  symbolSize: 6,
  showSymbol: false,
  lineStyle: {
    width: 3,
    color,
  },
  itemStyle: {
    color,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  emphasis: {
    focus: 'series' as const,
    itemStyle: {
      symbolSize: 10,
      borderWidth: 3,
    },
  },
  areaStyle: showArea
    ? {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: `${color}40` },
            { offset: 1, color: `${color}05` },
          ],
        },
      }
    : undefined,
});

export const getBarSeriesConfig = (
  name: string,
  data: Array<[string, number]>,
  color: string
) => ({
  name,
  type: 'bar' as const,
  data,
  barWidth: '60%',
  itemStyle: {
    color: {
      type: 'linear' as const,
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color },
        { offset: 1, color: `${color}80` },
      ],
    },
    borderRadius: [4, 4, 0, 0],
  },
  emphasis: {
    itemStyle: {
      color: {
        type: 'linear' as const,
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: `${color}FF` },
          { offset: 1, color: `${color}AA` },
        ],
      },
    },
  },
});

export const baselineMarkLine = {
  symbol: 'none' as const,
  lineStyle: {
    color: '#94A3B8',
    type: 'dashed' as const,
    width: 2,
  },
  label: {
    show: true,
    position: 'end' as const,
    formatter: '工业化前基线',
    color: '#94A3B8',
    fontSize: 11,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    padding: [4, 8],
    borderRadius: 4,
  },
  data: [
    {
      yAxis: 0,
    },
  ],
};

export const targetLineConfig = (value: number, label: string, color: string) => ({
  symbol: 'none' as const,
  lineStyle: {
    color,
    type: 'dotted' as const,
    width: 2,
  },
  label: {
    show: true,
    position: 'end' as const,
    formatter: label,
    color,
    fontSize: 11,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    padding: [4, 8],
    borderRadius: 4,
  },
  data: [{ yAxis: value }],
});
