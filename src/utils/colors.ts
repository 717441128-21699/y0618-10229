export const colors = {
  primary: '#0F172A',
  primaryLight: '#1E293B',
  primaryDark: '#020617',
  
  accent: '#F97316',
  accentLight: '#FDBA74',
  accentDark: '#EA580C',
  
  glacier: '#38BDF8',
  glacierLight: '#7DD3FC',
  forest: '#10B981',
  forestLight: '#34D399',
  warning: '#EF4444',
  warningLight: '#F87171',
  
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  temperatureScale: [
    '#1D4ED8',
    '#3B82F6',
    '#60A5FA',
    '#93C5FD',
    '#BFDBFE',
    '#FDE68A',
    '#FCD34D',
    '#F59E0B',
    '#F97316',
    '#EA580C',
    '#DC2626',
    '#991B1B',
  ],
  
  metrics: {
    temperature: '#F97316',
    co2: '#38BDF8',
    seaLevel: '#10B981',
    seaIce: '#8B5CF6',
  },
  
  scenarios: {
    'SSP1-2.6': '#10B981',
    'SSP2-4.5': '#F59E0B',
    'SSP3-7.0': '#F97316',
    'SSP5-8.5': '#EF4444',
  },
  
  extremeWeather: {
    heatwaves: '#EF4444',
    heavyRain: '#3B82F6',
    hurricanes: '#8B5CF6',
    droughts: '#F59E0B',
  },
  
  glass: {
    bg: 'rgba(15, 23, 42, 0.6)',
    border: 'rgba(148, 163, 184, 0.2)',
    shadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
  },
} as const;

export type ColorKey = keyof typeof colors;
