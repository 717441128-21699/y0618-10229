import type { RegionTemperature } from '../types';

const regionData: Omit<RegionTemperature, 'temperatureAnomalies'>[] = [
  { regionCode: 'CN', regionName: '中国', latitude: 35.8617, longitude: 104.1954 },
  { regionCode: 'US', regionName: '美国', latitude: 37.0902, longitude: -95.7129 },
  { regionCode: 'RU', regionName: '俄罗斯', latitude: 61.5240, longitude: 105.3188 },
  { regionCode: 'CA', regionName: '加拿大', latitude: 56.1304, longitude: -106.3468 },
  { regionCode: 'BR', regionName: '巴西', latitude: -14.2350, longitude: -51.9253 },
  { regionCode: 'AU', regionName: '澳大利亚', latitude: -25.2744, longitude: 133.7751 },
  { regionCode: 'IN', regionName: '印度', latitude: 20.5937, longitude: 78.9629 },
  { regionCode: 'JP', regionName: '日本', latitude: 36.2048, longitude: 138.2529 },
  { regionCode: 'DE', regionName: '德国', latitude: 51.1657, longitude: 10.4515 },
  { regionCode: 'FR', regionName: '法国', latitude: 46.2276, longitude: 2.2137 },
  { regionCode: 'GB', regionName: '英国', latitude: 55.3781, longitude: -3.4360 },
  { regionCode: 'ZA', regionName: '南非', latitude: -30.5595, longitude: 22.9375 },
  { regionCode: 'AR', regionName: '阿根廷', latitude: -38.4161, longitude: -63.6167 },
  { regionCode: 'EG', regionName: '埃及', latitude: 26.8206, longitude: 30.8025 },
  { regionCode: 'GL', regionName: '格陵兰', latitude: 71.7069, longitude: -42.6043 },
  { regionCode: 'IS', regionName: '冰岛', latitude: 64.9631, longitude: -19.0208 },
  { regionCode: 'NO', regionName: '挪威', latitude: 60.4720, longitude: 8.4689 },
  { regionCode: 'SE', regionName: '瑞典', latitude: 60.1282, longitude: 18.6435 },
  { regionCode: 'FI', regionName: '芬兰', latitude: 61.9241, longitude: 25.7482 },
  { regionCode: 'NZ', regionName: '新西兰', latitude: -40.9006, longitude: 174.8860 },
];

const generateRegionTemperatureAnomalies = (latitude: number): Record<number, number> => {
  const anomalies: Record<number, number> = {};
  const latFactor = Math.abs(latitude) / 90;
  const amplification = 1 + latFactor * 1.2;

  for (let year = 1901; year <= 2024; year++) {
    const yearsSince1900 = year - 1900;
    
    let baseAnomaly = yearsSince1900 < 50
      ? 0.003 * yearsSince1900
      : 0.012 * (yearsSince1900 - 50) + 0.15;
    
    baseAnomaly *= amplification;
    
    const noise = (Math.random() - 0.5) * 0.2;
    
    anomalies[year] = Math.round((baseAnomaly + noise) * 100) / 100;
  }

  return anomalies;
};

export const regionTemperatures: RegionTemperature[] = regionData.map(region => ({
  ...region,
  temperatureAnomalies: generateRegionTemperatureAnomalies(region.latitude),
}));

export const getRegionTemperature = (regionCode: string): RegionTemperature | undefined => {
  return regionTemperatures.find(r => r.regionCode === regionCode);
};

export const getTemperatureByRegionAndYear = (
  regionCode: string,
  year: number
): number | null => {
  const region = getRegionTemperature(regionCode);
  if (!region) return null;
  return region.temperatureAnomalies[year] ?? null;
};

export const getAllRegions = (): string[] => {
  return regionTemperatures.map(r => r.regionCode);
};
