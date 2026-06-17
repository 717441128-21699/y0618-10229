import { create } from 'zustand';
import type { AppState } from '../data/types';

interface AppStore extends AppState {
  setCurrentView: (view: string) => void;
  setSelectedMetrics: (metrics: string[]) => void;
  toggleMetric: (metric: string) => void;
  setTimeGranularity: (granularity: 'yearly' | 'decadal') => void;
  setTimeRange: (range: [number, number]) => void;
  setShowBaseline: (show: boolean) => void;
  setSelectedScenario: (scenarios: string[]) => void;
  toggleScenario: (scenario: string) => void;
  resetState: () => void;
}

const defaultState: AppState = {
  currentView: 'dashboard',
  selectedMetrics: ['temperature', 'co2'],
  timeGranularity: 'yearly',
  timeRange: [1850, 2024],
  showBaseline: true,
  selectedScenario: ['SSP1-2.6', 'SSP2-4.5', 'SSP5-8.5'],
};

export const useAppStore = create<AppStore>((set) => ({
  ...defaultState,
  
  setCurrentView: (view) => set({ currentView: view }),
  
  setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
  
  toggleMetric: (metric) => set((state) => ({
    selectedMetrics: state.selectedMetrics.includes(metric)
      ? state.selectedMetrics.filter(m => m !== metric)
      : [...state.selectedMetrics, metric],
  })),
  
  setTimeGranularity: (granularity) => set({ timeGranularity: granularity }),
  
  setTimeRange: (range) => set({ timeRange: range }),
  
  setShowBaseline: (show) => set({ showBaseline: show }),
  
  setSelectedScenario: (scenarios) => set({ selectedScenario: scenarios }),
  
  toggleScenario: (scenario) => set((state) => ({
    selectedScenario: state.selectedScenario.includes(scenario)
      ? state.selectedScenario.filter(s => s !== scenario)
      : [...state.selectedScenario, scenario],
  })),
  
  resetState: () => set(defaultState),
}));
