export const GEO_JSON_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export const countryToRegionMap: Record<string, string> = {
  'China': 'CN',
  'United States of America': 'US',
  'Russia': 'RU',
  'Canada': 'CA',
  'Brazil': 'BR',
  'Australia': 'AU',
  'India': 'IN',
  'Japan': 'JP',
  'Germany': 'DE',
  'France': 'FR',
  'United Kingdom': 'GB',
  'South Africa': 'ZA',
  'Argentina': 'AR',
  'Egypt': 'EG',
  'Greenland': 'GL',
  'Iceland': 'IS',
  'Norway': 'NO',
  'Sweden': 'SE',
  'Finland': 'FI',
  'New Zealand': 'NZ',
};

export const mapColorScale = [
  { value: -2, color: '#1D4ED8', label: '-2.0°C' },
  { value: -1.5, color: '#3B82F6', label: '-1.5°C' },
  { value: -1, color: '#60A5FA', label: '-1.0°C' },
  { value: -0.5, color: '#93C5FD', label: '-0.5°C' },
  { value: 0, color: '#BFDBFE', label: '0°C' },
  { value: 0.5, color: '#FDE68A', label: '+0.5°C' },
  { value: 1, color: '#FCD34D', label: '+1.0°C' },
  { value: 1.5, color: '#F59E0B', label: '+1.5°C' },
  { value: 2, color: '#F97316', label: '+2.0°C' },
  { value: 2.5, color: '#EA580C', label: '+2.5°C' },
  { value: 3, color: '#DC2626', label: '+3.0°C' },
  { value: 4, color: '#991B1B', label: '+4.0°C+' },
];

export const getTemperatureColor = (temp: number): string => {
  const scale = mapColorScale;
  
  if (temp <= scale[0].value) return scale[0].color;
  if (temp >= scale[scale.length - 1].value) return scale[scale.length - 1].color;
  
  for (let i = 0; i < scale.length - 1; i++) {
    if (temp >= scale[i].value && temp < scale[i + 1].value) {
      const t = (temp - scale[i].value) / (scale[i + 1].value - scale[i].value);
      return interpolateColor(scale[i].color, scale[i + 1].color, t);
    }
  }
  
  return scale[scale.length - 1].color;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const interpolateColor = (color1: string, color2: string, t: number): string => {
  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);
  
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  
  return rgbToHex(r, g, b);
};

export const mapYears = [
  1901, 1910, 1920, 1930, 1940, 1950,
  1960, 1970, 1980, 1990, 2000, 2010, 2020, 2024,
];
