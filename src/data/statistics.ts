import { linearRegression, linearRegressionLine, sampleCorrelation, sampleStandardDeviation } from 'simple-statistics';
import type { CorrelationResult, ClimateDataPoint } from './types';

export const calculateCorrelation = (
  data: ClimateDataPoint[],
  xKey: keyof ClimateDataPoint,
  yKey: keyof ClimateDataPoint,
  yearRange?: [number, number]
): CorrelationResult => {
  let filteredData = data;
  if (yearRange) {
    filteredData = data.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]);
  }

  const xValues = filteredData.map(d => d[xKey] as number);
  const yValues = filteredData.map(d => d[yKey] as number);

  const pearsonR = sampleCorrelation(xValues, yValues);
  const rSquared = pearsonR * pearsonR;

  const regressionData = filteredData.map(d => [d[xKey] as number, d[yKey] as number] as [number, number]);
  const regression = linearRegression(regressionData);
  const regressionLine = linearRegressionLine(regression);

  const n = filteredData.length;
  const se = Math.sqrt((1 - rSquared) / (n - 2));
  const tStat = Math.abs(pearsonR) / se;
  const pValue = 2 * (1 - tDistributionCDF(tStat, n - 2));

  const regressionEquation = `y = ${regression.m.toFixed(6)}x + ${regression.b.toFixed(4)}`;

  return {
    pearsonR,
    rSquared,
    slope: regression.m,
    intercept: regression.b,
    pValue,
    regressionEquation,
  };
};

const tDistributionCDF = (t: number, df: number): number => {
  if (df <= 0) return 0.5;
  
  const beta = (t / Math.sqrt(df)) * (t / Math.sqrt(df));
  const incompleteBeta = regularizedIncompleteBeta(df / 2, 0.5, beta / (1 + beta));
  
  if (t >= 0) {
    return 0.5 * (1 + incompleteBeta);
  }
  return 0.5 * (1 - incompleteBeta);
};

const regularizedIncompleteBeta = (a: number, b: number, x: number): number => {
  const bt = x === 0 || x === 1 ? 0 :
    Math.exp(gammaLn(a + b) - gammaLn(a) - gammaLn(b) +
      a * Math.log(x) + b * Math.log(1 - x));

  if (x < (a + 1) / (a + b + 2)) {
    return bt * betaCF(a, b, x) / a;
  }
  return 1 - bt * betaCF(b, a, 1 - x) / b;
};

const gammaLn = (xx: number): number => {
  const cof = [
    76.18009172947146, -86.50532032941677,
    24.01409824083091, -1.231739572450155,
    0.1208650973866179e-2, -0.5395239384953e-5
  ];
  
  let y = xx;
  let x = xx;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
};

const betaCF = (a: number, b: number, x: number, maxIter: number = 200): number => {
  const eps = 3e-7;
  let bm = 1.0;
  let az = 1.0;
  let am = 1.0;
  
  for (let m = 1; m <= maxIter; m++) {
    const m2 = 2 * m;
    let aa1 = m * (b - m) * x / ((a - 1 + m2) * (a + m2));
    let bb1 = (a + m) * (a + b + m) * (-x) / ((a + m2) * (a + m2 + 1));
    
    const ap = az + aa1 * am;
    const bp = bm + aa1 * bm;
    const app = ap + bb1 * az;
    const bpp = bp + bb1 * bm;
    
    const aold = az;
    am = ap / bpp;
    bm = bp / bpp;
    az = app / bpp;
    
    if (Math.abs(az - aold) < eps * Math.abs(az)) {
      break;
    }
  }
  return az;
};

export const calculateDecadalAverage = (
  data: ClimateDataPoint[],
  metric: keyof ClimateDataPoint
): Array<{ decade: string; value: number }> => {
  const decadeGroups: Record<string, number[]> = {};

  data.forEach(d => {
    const decadeStart = Math.floor(d.year / 10) * 10;
    const decadeKey = `${decadeStart}s`;
    if (!decadeGroups[decadeKey]) {
      decadeGroups[decadeKey] = [];
    }
    decadeGroups[decadeKey].push(d[metric] as number);
  });

  return Object.entries(decadeGroups).map(([decade, values]) => ({
    decade,
    value: values.reduce((a, b) => a + b, 0) / values.length,
  })).sort((a, b) => parseInt(a.decade) - parseInt(b.decade));
};

export const calculateTrendRate = (
  data: ClimateDataPoint[],
  metric: keyof ClimateDataPoint,
  years: number = 10
): number => {
  const recentData = data.slice(-years * 2);
  const firstHalf = recentData.slice(0, recentData.length / 2);
  const secondHalf = recentData.slice(recentData.length / 2);
  
  const firstAvg = firstHalf.reduce((sum, d) => sum + (d[metric] as number), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, d) => sum + (d[metric] as number), 0) / secondHalf.length;
  
  return (secondAvg - firstAvg) / years;
};

export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length < 2) return 0;
  return sampleStandardDeviation(values);
};

export const filterByYearRange = <T extends { year: number }>(
  data: T[],
  yearRange: [number, number]
): T[] => {
  return data.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]);
};

export const calculateBaseline = (
  data: ClimateDataPoint[],
  metric: keyof ClimateDataPoint,
  baselineStart: number = 1850,
  baselineEnd: number = 1900
): number => {
  const baselineData = data.filter(d => d.year >= baselineStart && d.year <= baselineEnd);
  const values = baselineData.map(d => d[metric] as number);
  return values.reduce((a, b) => a + b, 0) / values.length;
};
