import type { ScenarioPrediction } from '../types';

export const scenarioPredictions: ScenarioPrediction[] = [
  {
    scenario: 'SSP1-2.6',
    scenarioCode: 'SSP1-2.6',
    description: '可持续发展路径，严格减排，将温升控制在2°C以内',
    color: '#10B981',
    data: [
      { year: 2024, temperature: 1.2, lowerBound: 1.0, upperBound: 1.4 },
      { year: 2030, temperature: 1.4, lowerBound: 1.2, upperBound: 1.6 },
      { year: 2040, temperature: 1.6, lowerBound: 1.3, upperBound: 1.9 },
      { year: 2050, temperature: 1.7, lowerBound: 1.4, upperBound: 2.0 },
      { year: 2060, temperature: 1.7, lowerBound: 1.3, upperBound: 2.1 },
      { year: 2070, temperature: 1.6, lowerBound: 1.2, upperBound: 2.0 },
      { year: 2080, temperature: 1.5, lowerBound: 1.0, upperBound: 2.0 },
      { year: 2090, temperature: 1.4, lowerBound: 0.8, upperBound: 2.0 },
      { year: 2100, temperature: 1.4, lowerBound: 0.6, upperBound: 2.2 },
    ],
  },
  {
    scenario: 'SSP2-4.5',
    scenarioCode: 'SSP2-4.5',
    description: '中等排放情景，延续当前发展趋势',
    color: '#F59E0B',
    data: [
      { year: 2024, temperature: 1.2, lowerBound: 1.0, upperBound: 1.4 },
      { year: 2030, temperature: 1.5, lowerBound: 1.2, upperBound: 1.8 },
      { year: 2040, temperature: 1.9, lowerBound: 1.5, upperBound: 2.3 },
      { year: 2050, temperature: 2.3, lowerBound: 1.8, upperBound: 2.8 },
      { year: 2060, temperature: 2.6, lowerBound: 2.0, upperBound: 3.2 },
      { year: 2070, temperature: 2.8, lowerBound: 2.1, upperBound: 3.5 },
      { year: 2080, temperature: 3.0, lowerBound: 2.2, upperBound: 3.8 },
      { year: 2090, temperature: 3.1, lowerBound: 2.2, upperBound: 4.0 },
      { year: 2100, temperature: 3.1, lowerBound: 2.1, upperBound: 4.1 },
    ],
  },
  {
    scenario: 'SSP3-7.0',
    scenarioCode: 'SSP3-7.0',
    description: '区域竞争情景，高排放发展路径',
    color: '#F97316',
    data: [
      { year: 2024, temperature: 1.2, lowerBound: 1.0, upperBound: 1.4 },
      { year: 2030, temperature: 1.6, lowerBound: 1.3, upperBound: 1.9 },
      { year: 2040, temperature: 2.2, lowerBound: 1.7, upperBound: 2.7 },
      { year: 2050, temperature: 2.9, lowerBound: 2.2, upperBound: 3.6 },
      { year: 2060, temperature: 3.5, lowerBound: 2.6, upperBound: 4.4 },
      { year: 2070, temperature: 4.0, lowerBound: 2.9, upperBound: 5.1 },
      { year: 2080, temperature: 4.4, lowerBound: 3.1, upperBound: 5.7 },
      { year: 2090, temperature: 4.7, lowerBound: 3.2, upperBound: 6.2 },
      { year: 2100, temperature: 4.9, lowerBound: 3.2, upperBound: 6.6 },
    ],
  },
  {
    scenario: 'SSP5-8.5',
    scenarioCode: 'SSP5-8.5',
    description: '化石燃料为主的发展路径，最高排放情景',
    color: '#EF4444',
    data: [
      { year: 2024, temperature: 1.2, lowerBound: 1.0, upperBound: 1.4 },
      { year: 2030, temperature: 1.7, lowerBound: 1.4, upperBound: 2.0 },
      { year: 2040, temperature: 2.5, lowerBound: 2.0, upperBound: 3.0 },
      { year: 2050, temperature: 3.4, lowerBound: 2.6, upperBound: 4.2 },
      { year: 2060, temperature: 4.2, lowerBound: 3.2, upperBound: 5.2 },
      { year: 2070, temperature: 5.0, lowerBound: 3.7, upperBound: 6.3 },
      { year: 2080, temperature: 5.7, lowerBound: 4.1, upperBound: 7.3 },
      { year: 2090, temperature: 6.3, lowerBound: 4.4, upperBound: 8.2 },
      { year: 2100, temperature: 6.8, lowerBound: 4.5, upperBound: 9.1 },
    ],
  },
];

export const scenarioInfo = [
  {
    code: 'SSP1-2.6',
    name: '可持续发展',
    description: '全球合作，低排放，可持续发展',
    icon: 'leaf',
  },
  {
    code: 'SSP2-4.5',
    name: '中间路径',
    description: '延续当前发展趋势，中等排放',
    icon: 'balance',
  },
  {
    code: 'SSP3-7.0',
    name: '区域竞争',
    description: '区域竞争加剧，高排放',
    icon: 'building',
  },
  {
    code: 'SSP5-8.5',
    name: '化石燃料发展',
    description: '化石燃料驱动的发展，最高排放',
    icon: 'factory',
  },
];

export const getScenarioByCode = (code: string): ScenarioPrediction | undefined => {
  return scenarioPredictions.find(s => s.scenarioCode === code);
};

export const getTemperatureTargets = () => {
  return [
    { target: '1.5°C', description: '《巴黎协定》理想目标', color: '#10B981', probability: '需立即大幅减排', risk: '低风险' },
    { target: '2.0°C', description: '《巴黎协定》上限目标', color: '#F59E0B', probability: '需深度减排', risk: '中度风险' },
    { target: '2.5°C', description: '失控预警线', color: '#F97316', probability: '减排不力则大概率', risk: '高风险' },
  ];
};
