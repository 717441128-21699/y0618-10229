export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

export const formatTemperature = (value: number, withSign: boolean = true): string => {
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}°C`;
};

export const formatCO2 = (value: number): string => {
  return `${value.toFixed(1)} ppm`;
};

export const formatSeaLevel = (value: number, withSign: boolean = true): string => {
  const sign = withSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)} mm`;
};

export const formatSeaIce = (value: number): string => {
  return `${value.toFixed(2)} 百万km²`;
};

export const formatYear = (year: number): string => {
  return `${year}年`;
};

export const formatDecade = (startYear: number): string => {
  return `${startYear}年代`;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatCorrelation = (value: number): string => {
  return value.toFixed(3);
};

export const getMetricFormatter = (metric: string): ((value: number) => string) => {
  const formatters: Record<string, (value: number) => string> = {
    temperature: (v) => formatTemperature(v),
    co2: formatCO2,
    seaLevel: (v) => formatSeaLevel(v),
    seaIce: formatSeaIce,
  };
  return formatters[metric] || ((v) => v.toString());
};

export const getTrendDirection = (value: number, isIncreasingBad: boolean = true): 'up' | 'down' | 'stable' => {
  if (Math.abs(value) < 0.01) return 'stable';
  const isIncreasing = value > 0;
  return isIncreasingBad ? (isIncreasing ? 'up' : 'down') : (isIncreasing ? 'down' : 'up');
};
