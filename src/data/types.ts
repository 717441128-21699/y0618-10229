export interface ClimateDataPoint {
  year: number;
  temperature: number;
  co2: number;
  seaLevel: number;
  seaIce: number;
}

export interface RegionTemperature {
  regionCode: string;
  regionName: string;
  temperatureAnomalies: Record<number, number>;
  latitude: number;
  longitude: number;
}

export interface ExtremeWeatherDecade {
  decade: string;
  startYear: number;
  endYear: number;
  heatwaves: number;
  heavyRain: number;
  hurricanes: number;
  droughts: number;
}

export interface ScenarioPrediction {
  scenario: string;
  scenarioCode: string;
  description: string;
  color: string;
  data: Array<{
    year: number;
    temperature: number;
    lowerBound: number;
    upperBound: number;
  }>;
}

export interface CorrelationResult {
  pearsonR: number;
  rSquared: number;
  slope: number;
  intercept: number;
  pValue: number;
  regressionEquation: string;
}

export interface ExportConfig {
  format: 'png' | 'svg' | 'csv';
  resolution: 'low' | 'medium' | 'high';
  includeTitle: boolean;
  includeLegend: boolean;
}

export interface AppState {
  currentView: string;
  selectedMetrics: string[];
  timeGranularity: 'yearly' | 'decadal';
  timeRange: [number, number];
  showBaseline: boolean;
  selectedScenario: string[];
}

export type MetricType = 'temperature' | 'co2' | 'seaLevel' | 'seaIce';

export interface MetricConfig {
  key: MetricType;
  name: string;
  unit: string;
  color: string;
  baseline: number;
  description: string;
}
