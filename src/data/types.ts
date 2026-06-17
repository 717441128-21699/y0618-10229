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

export interface TrendsViewConfig {
  selectedMetrics: string[];
  timeGranularity: 'yearly' | 'decadal';
  timeRange: [number, number];
  showBaseline: boolean;
}

export interface MapViewConfig {
  selectedYear: number;
  selectedRegion: string | null;
}

export interface CorrelationViewConfig {
  xMetric: string;
  yMetric: string;
  timeRange: [number, number];
  showRegression: boolean;
}

export interface ExtremeWeatherConfig {
  selectedTypes: string[];
  selectedDecades: string[];
}

export interface ScenariosConfig {
  selectedScenarios: string[];
  showTargets: boolean;
  yearRange: [number, number];
}

export interface ViewConfigs {
  trends: TrendsViewConfig;
  map: MapViewConfig;
  correlation: CorrelationViewConfig;
  extremeWeather: ExtremeWeatherConfig;
  scenarios: ScenariosConfig;
}

export interface ReportSectionConfig {
  id: string;
  title: string;
  enabled: boolean;
  description: string;
  includeChart: boolean;
  includeConclusions: boolean;
}

export interface ReportConfig {
  title: string;
  subtitle: string;
  timeRange: [number, number];
  sections: ReportSectionConfig[];
}

export interface AppState {
  currentView: string;
  selectedMetrics: string[];
  timeGranularity: 'yearly' | 'decadal';
  timeRange: [number, number];
  showBaseline: boolean;
  selectedScenario: string[];
  viewConfigs: ViewConfigs;
  reportConfig: ReportConfig;
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
