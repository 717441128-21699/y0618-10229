import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  ViewConfigs,
  ReportConfig,
  ReportSectionConfig,
} from '../data/types';

interface AppStore extends AppState {
  setCurrentView: (view: string) => void;
  setSelectedMetrics: (metrics: string[]) => void;
  toggleMetric: (metric: string) => void;
  setTimeGranularity: (granularity: 'yearly' | 'decadal') => void;
  setTimeRange: (range: [number, number]) => void;
  setShowBaseline: (show: boolean) => void;
  setSelectedScenario: (scenarios: string[]) => void;
  toggleScenario: (scenario: string) => void;
  updateTrendsConfig: (config: Partial<ViewConfigs['trends']>) => void;
  updateMapConfig: (config: Partial<ViewConfigs['map']>) => void;
  updateCorrelationConfig: (config: Partial<ViewConfigs['correlation']>) => void;
  updateExtremeWeatherConfig: (config: Partial<ViewConfigs['extremeWeather']>) => void;
  updateScenariosConfig: (config: Partial<ViewConfigs['scenarios']>) => void;
  updateReportConfig: (config: Partial<ReportConfig>) => void;
  toggleReportSection: (sectionId: string) => void;
  updateReportSection: (sectionId: string, config: Partial<ReportSectionConfig>) => void;
  resetState: () => void;
  resetViewConfigs: () => void;
}

const defaultViewConfigs: ViewConfigs = {
  trends: {
    selectedMetrics: ['temperature', 'co2'],
    timeGranularity: 'yearly',
    timeRange: [1850, 2024],
    showBaseline: true,
  },
  map: {
    selectedYear: 2024,
    selectedRegion: null,
  },
  correlation: {
    xMetric: 'co2',
    yMetric: 'temperature',
    timeRange: [1950, 2024],
    showRegression: true,
  },
  extremeWeather: {
    selectedTypes: ['heatwaves', 'heavyRain', 'hurricanes', 'droughts'],
    selectedDecades: [],
  },
  scenarios: {
    selectedScenarios: ['SSP1-2.6', 'SSP2-4.5', 'SSP5-8.5'],
    showTargets: true,
    yearRange: [1950, 2100],
  },
};

const defaultReportSections: ReportSectionConfig[] = [
  {
    id: 'overview',
    title: '总体概述',
    enabled: true,
    description: '报告概述和主要发现摘要',
    includeChart: true,
    includeConclusions: true,
  },
  {
    id: 'trends',
    title: '趋势分析',
    enabled: true,
    description: '温度、CO₂、海平面、海冰等指标长期趋势',
    includeChart: true,
    includeConclusions: true,
  },
  {
    id: 'map',
    title: '全球升温分布',
    enabled: true,
    description: '各地区温度异常空间分布',
    includeChart: true,
    includeConclusions: true,
  },
  {
    id: 'correlation',
    title: '相关性分析',
    enabled: true,
    description: 'CO₂浓度与温度异常的统计关系',
    includeChart: true,
    includeConclusions: true,
  },
  {
    id: 'extremeWeather',
    title: '极端天气事件',
    enabled: true,
    description: '不同年代极端天气频率变化',
    includeChart: true,
    includeConclusions: true,
  },
  {
    id: 'scenarios',
    title: '未来情景预测',
    enabled: true,
    description: 'IPCC排放情景下的温升预测对比',
    includeChart: true,
    includeConclusions: true,
  },
];

const defaultReportConfig: ReportConfig = {
  title: '全球气候变化分析报告',
  subtitle: '基于历史观测数据与IPCC情景预测',
  timeRange: [1850, 2100],
  sections: defaultReportSections,
};

const defaultState: Omit<AppState, 'viewConfigs' | 'reportConfig'> = {
  currentView: 'dashboard',
  selectedMetrics: ['temperature', 'co2'],
  timeGranularity: 'yearly',
  timeRange: [1850, 2024],
  showBaseline: true,
  selectedScenario: ['SSP1-2.6', 'SSP2-4.5', 'SSP5-8.5'],
};

const fullDefaultState: AppState = {
  ...defaultState,
  viewConfigs: defaultViewConfigs,
  reportConfig: defaultReportConfig,
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...fullDefaultState,

      setCurrentView: (view) => set({ currentView: view }),

      setSelectedMetrics: (metrics) =>
        set((state) => ({
          selectedMetrics: metrics,
          viewConfigs: {
            ...state.viewConfigs,
            trends: { ...state.viewConfigs.trends, selectedMetrics: metrics },
          },
        })),

      toggleMetric: (metric) =>
        set((state) => {
          const newMetrics = state.selectedMetrics.includes(metric)
            ? state.selectedMetrics.filter((m) => m !== metric)
            : [...state.selectedMetrics, metric];
          return {
            selectedMetrics: newMetrics,
            viewConfigs: {
              ...state.viewConfigs,
              trends: { ...state.viewConfigs.trends, selectedMetrics: newMetrics },
            },
          };
        }),

      setTimeGranularity: (granularity) =>
        set((state) => ({
          timeGranularity: granularity,
          viewConfigs: {
            ...state.viewConfigs,
            trends: { ...state.viewConfigs.trends, timeGranularity: granularity },
          },
        })),

      setTimeRange: (range) =>
        set((state) => ({
          timeRange: range,
          viewConfigs: {
            ...state.viewConfigs,
            trends: { ...state.viewConfigs.trends, timeRange: range },
          },
        })),

      setShowBaseline: (show) =>
        set((state) => ({
          showBaseline: show,
          viewConfigs: {
            ...state.viewConfigs,
            trends: { ...state.viewConfigs.trends, showBaseline: show },
          },
        })),

      setSelectedScenario: (scenarios) =>
        set((state) => ({
          selectedScenario: scenarios,
          viewConfigs: {
            ...state.viewConfigs,
            scenarios: { ...state.viewConfigs.scenarios, selectedScenarios: scenarios },
          },
        })),

      toggleScenario: (scenario) =>
        set((state) => {
          const newScenarios = state.selectedScenario.includes(scenario)
            ? state.selectedScenario.filter((s) => s !== scenario)
            : [...state.selectedScenario, scenario];
          return {
            selectedScenario: newScenarios,
            viewConfigs: {
              ...state.viewConfigs,
              scenarios: {
                ...state.viewConfigs.scenarios,
                selectedScenarios: newScenarios,
              },
            },
          };
        }),

      updateTrendsConfig: (config) =>
        set((state) => ({
          viewConfigs: {
            ...state.viewConfigs,
            trends: { ...state.viewConfigs.trends, ...config },
          },
          ...(config.selectedMetrics ? { selectedMetrics: config.selectedMetrics } : {}),
          ...(config.timeGranularity ? { timeGranularity: config.timeGranularity } : {}),
          ...(config.timeRange ? { timeRange: config.timeRange } : {}),
          ...(config.showBaseline !== undefined ? { showBaseline: config.showBaseline } : {}),
        })),

      updateMapConfig: (config) =>
        set((state) => ({
          viewConfigs: {
            ...state.viewConfigs,
            map: { ...state.viewConfigs.map, ...config },
          },
        })),

      updateCorrelationConfig: (config) =>
        set((state) => ({
          viewConfigs: {
            ...state.viewConfigs,
            correlation: { ...state.viewConfigs.correlation, ...config },
          },
        })),

      updateExtremeWeatherConfig: (config) =>
        set((state) => ({
          viewConfigs: {
            ...state.viewConfigs,
            extremeWeather: { ...state.viewConfigs.extremeWeather, ...config },
          },
        })),

      updateScenariosConfig: (config) =>
        set((state) => ({
          viewConfigs: {
            ...state.viewConfigs,
            scenarios: { ...state.viewConfigs.scenarios, ...config },
          },
          ...(config.selectedScenarios ? { selectedScenario: config.selectedScenarios } : {}),
        })),

      updateReportConfig: (config) =>
        set((state) => ({
          reportConfig: { ...state.reportConfig, ...config },
        })),

      toggleReportSection: (sectionId) =>
        set((state) => ({
          reportConfig: {
            ...state.reportConfig,
            sections: state.reportConfig.sections.map((s) =>
              s.id === sectionId ? { ...s, enabled: !s.enabled } : s
            ),
          },
        })),

      updateReportSection: (sectionId, config) =>
        set((state) => ({
          reportConfig: {
            ...state.reportConfig,
            sections: state.reportConfig.sections.map((s) =>
              s.id === sectionId ? { ...s, ...config } : s
            ),
          },
        })),

      resetState: () => set(fullDefaultState),

      resetViewConfigs: () =>
        set((state) => ({
          viewConfigs: defaultViewConfigs,
          selectedMetrics: defaultViewConfigs.trends.selectedMetrics,
          timeGranularity: defaultViewConfigs.trends.timeGranularity,
          timeRange: defaultViewConfigs.trends.timeRange,
          showBaseline: defaultViewConfigs.trends.showBaseline,
          selectedScenario: defaultViewConfigs.scenarios.selectedScenarios,
        })),
    }),
    {
      name: 'climate-viz-store',
      partialize: (state) => ({
        selectedMetrics: state.selectedMetrics,
        timeGranularity: state.timeGranularity,
        timeRange: state.timeRange,
        showBaseline: state.showBaseline,
        selectedScenario: state.selectedScenario,
        viewConfigs: state.viewConfigs,
        reportConfig: state.reportConfig,
      }),
    }
  )
);
