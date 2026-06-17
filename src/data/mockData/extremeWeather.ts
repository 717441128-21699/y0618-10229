import type { ExtremeWeatherDecade } from '../types';

export const extremeWeatherData: ExtremeWeatherDecade[] = [
  {
    decade: '1950s',
    startYear: 1950,
    endYear: 1959,
    heatwaves: 12,
    heavyRain: 18,
    hurricanes: 6,
    droughts: 8,
  },
  {
    decade: '1960s',
    startYear: 1960,
    endYear: 1969,
    heatwaves: 15,
    heavyRain: 22,
    hurricanes: 8,
    droughts: 10,
  },
  {
    decade: '1970s',
    startYear: 1970,
    endYear: 1979,
    heatwaves: 18,
    heavyRain: 25,
    hurricanes: 9,
    droughts: 12,
  },
  {
    decade: '1980s',
    startYear: 1980,
    endYear: 1989,
    heatwaves: 22,
    heavyRain: 32,
    hurricanes: 11,
    droughts: 15,
  },
  {
    decade: '1990s',
    startYear: 1990,
    endYear: 1999,
    heatwaves: 28,
    heavyRain: 38,
    hurricanes: 14,
    droughts: 18,
  },
  {
    decade: '2000s',
    startYear: 2000,
    endYear: 2009,
    heatwaves: 35,
    heavyRain: 45,
    hurricanes: 16,
    droughts: 22,
  },
  {
    decade: '2010s',
    startYear: 2010,
    endYear: 2019,
    heatwaves: 48,
    heavyRain: 58,
    hurricanes: 19,
    droughts: 28,
  },
  {
    decade: '2020s',
    startYear: 2020,
    endYear: 2024,
    heatwaves: 62,
    heavyRain: 72,
    hurricanes: 24,
    droughts: 35,
  },
];

export const extremeWeatherTypes = [
  { key: 'heatwaves', name: '极端高温', color: '#EF4444', description: '气温超过历史95百分位的高温事件' },
  { key: 'heavyRain', name: '暴雨事件', color: '#3B82F6', description: '24小时降雨量超过100mm的强降水事件' },
  { key: 'hurricanes', name: '飓风/台风', color: '#8B5CF6', description: '达到萨菲尔-辛普森等级3级及以上的热带气旋' },
  { key: 'droughts', name: '严重干旱', color: '#F59E0B', description: '连续6个月以上降水低于平均水平的气象干旱' },
];

export const getExtremeWeatherByDecade = (decade: string): ExtremeWeatherDecade | undefined => {
  return extremeWeatherData.find(d => d.decade === decade);
};

export const getTotalEventsByType = (type: keyof Omit<ExtremeWeatherDecade, 'decade' | 'startYear' | 'endYear'>): Array<{ decade: string; value: number }> => {
  return extremeWeatherData.map(d => ({
    decade: d.decade,
    value: d[type],
  }));
};
