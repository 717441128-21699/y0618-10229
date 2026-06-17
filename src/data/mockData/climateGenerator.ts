import type { ClimateDataPoint } from '../types';
import { createSeededRandom } from '../../utils/seededRandom';

const generateClimateData = (): ClimateDataPoint[] => {
  const rng = createSeededRandom(12345);
  const data: ClimateDataPoint[] = [];
  const startYear = 1850;
  const endYear = 2024;

  for (let year = startYear; year <= endYear; year++) {
    const yearsSinceIndustrial = year - 1850;
    
    const preIndustrialTemp = -0.3 + rng.noise(0.15);
    const tempTrend = yearsSinceIndustrial < 50 
      ? 0.004 * yearsSinceIndustrial 
      : 0.012 * (yearsSinceIndustrial - 50) + 0.2;
    const temperature = preIndustrialTemp + tempTrend + rng.noise(0.12);

    const preIndustrialCO2 = 280 + rng.noise(2);
    const co2Trend = yearsSinceIndustrial < 100
      ? 0.25 * yearsSinceIndustrial
      : 0.8 * (yearsSinceIndustrial - 100) + 25;
    const co2 = preIndustrialCO2 + co2Trend + rng.noise(0.8);

    const seaLevelTrend = yearsSinceIndustrial < 100
      ? 0.012 * yearsSinceIndustrial
      : 0.04 * (yearsSinceIndustrial - 100) + 1.2;
    const seaLevel = seaLevelTrend + rng.noise(3);

    const maxSeaIce = 7.5;
    const seaIceDecline = yearsSinceIndustrial < 100
      ? 0.003 * yearsSinceIndustrial
      : 0.012 * (yearsSinceIndustrial - 100) + 0.3;
    const seaIce = Math.max(3.5, maxSeaIce - seaIceDecline + rng.noise(0.15));

    data.push({
      year,
      temperature: Math.round(temperature * 100) / 100,
      co2: Math.round(co2 * 10) / 10,
      seaLevel: Math.round(seaLevel * 10) / 10,
      seaIce: Math.round(seaIce * 100) / 100,
    });
  }

  return data;
};

export const climateData = generateClimateData();

export const getClimateDataByYearRange = (startYear: number, endYear: number): ClimateDataPoint[] => {
  return climateData.filter(d => d.year >= startYear && d.year <= endYear);
};

export const getLatestDataPoint = (): ClimateDataPoint => {
  return climateData[climateData.length - 1];
};

export const getBaselineValue = (metric: keyof ClimateDataPoint, baselineStart: number = 1850, baselineEnd: number = 1900): number => {
  const baselineData = climateData.filter(d => d.year >= baselineStart && d.year <= baselineEnd);
  const values = baselineData.map(d => d[metric] as number);
  return values.reduce((a, b) => a + b, 0) / values.length;
};

export const INDUSTRIAL_BASELINE = {
  startYear: 1850,
  endYear: 1900,
};

export const metricConfigs = [
  {
    key: 'temperature' as const,
    name: '全球平均温度异常',
    unit: '°C',
    color: '#F97316',
    baseline: getBaselineValue('temperature'),
    description: '相对于1850-1900年基线的温度变化',
  },
  {
    key: 'co2' as const,
    name: '大气CO₂浓度',
    unit: 'ppm',
    color: '#38BDF8',
    baseline: getBaselineValue('co2'),
    description: '莫纳罗亚观测站测量的大气二氧化碳浓度',
  },
  {
    key: 'seaLevel' as const,
    name: '海平面变化',
    unit: 'mm',
    color: '#10B981',
    baseline: 0,
    description: '相对于1900年基线的全球平均海平面高度变化',
  },
  {
    key: 'seaIce' as const,
    name: '北极海冰面积',
    unit: '百万km²',
    color: '#8B5CF6',
    baseline: getBaselineValue('seaIce'),
    description: '9月份北极海冰最小覆盖面积',
  },
];
