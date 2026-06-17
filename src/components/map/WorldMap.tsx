import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { getTemperatureColor, GEO_JSON_URL, countryToRegionMap, mapColorScale } from '../../data/mockData/mapData';
import { regionTemperatures } from '../../data/mockData/regionTemps';
import { formatTemperature } from '../../utils/formatters';
import { colors } from '../../utils/colors';
import { RegionInfo } from './RegionInfo';
import type { RegionTemperature } from '../../data/types';

interface WorldMapProps {
  selectedYear: number;
  chartRef?: React.RefObject<HTMLDivElement>;
}

export const WorldMap: React.FC<WorldMapProps> = ({ selectedYear, chartRef }) => {
  const [selectedRegion, setSelectedRegion] = useState<RegionTemperature | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const getRegionTemp = (regionCode: string): number | null => {
    const region = regionTemperatures.find(r => r.regionCode === regionCode);
    if (!region) return null;
    return region.temperatureAnomalies[selectedYear] ?? null;
  };

  const handleRegionClick = (regionCode: string) => {
    const region = regionTemperatures.find(r => r.regionCode === regionCode);
    if (region) {
      setSelectedRegion(region);
    }
  };

  const colorScaleWithValues = useMemo(() => {
    return mapColorScale.map(item => ({
      ...item,
      active: true,
    }));
  }, []);

  return (
    <div ref={chartRef} className="relative w-full h-full min-h-[500px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: 160,
            center: [10, 20],
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            minZoom={1}
            maxZoom={4}
            center={[10, 20]}
          >
            <Geographies geography={GEO_JSON_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const regionCode = countryToRegionMap[geo.properties.name];
                  const temp = regionCode ? getRegionTemp(regionCode) : null;
                  const fillColor = temp !== null ? getTemperatureColor(temp) : '#1E293B';
                  const isHovered = hoveredRegion === regionCode;
                  const isSelected = selectedRegion?.regionCode === regionCode;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => regionCode && handleRegionClick(regionCode)}
                      onMouseEnter={() => regionCode && setHoveredRegion(regionCode)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      style={{
                        default: {
                          fill: fillColor,
                          stroke: isSelected ? colors.accent : 'rgba(148, 163, 184, 0.2)',
                          strokeWidth: isSelected ? 2 : 0.5,
                          outline: 'none',
                          cursor: regionCode ? 'pointer' : 'default',
                          transition: 'all 0.2s ease',
                        },
                        hover: {
                          fill: fillColor,
                          stroke: colors.accent,
                          strokeWidth: 2,
                          outline: 'none',
                          filter: 'brightness(1.2)',
                        },
                        pressed: {
                          fill: fillColor,
                          stroke: colors.accent,
                          strokeWidth: 3,
                          outline: 'none',
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <AnimatePresence>
        {hoveredRegion && !selectedRegion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-4 left-4 px-4 py-3 rounded-xl bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <div className="text-sm font-medium text-white mb-1">
              {regionTemperatures.find(r => r.regionCode === hoveredRegion)?.regionName || hoveredRegion}
            </div>
            <div className="text-xs text-gray-400">
              {selectedYear}年温度异常: 
              <span 
                className="ml-2 font-mono font-semibold"
                style={{ 
                  color: getTemperatureColor(getRegionTemp(hoveredRegion) || 0) 
                }}
              >
                {getRegionTemp(hoveredRegion) !== null 
                  ? formatTemperature(getRegionTemp(hoveredRegion)!, true)
                  : '暂无数据'
                }
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRegion && (
          <RegionInfo
            region={selectedRegion}
            selectedYear={selectedYear}
            onClose={() => setSelectedRegion(null)}
          />
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 left-4 right-4 flex justify-center">
        <div className="px-6 py-4 rounded-xl bg-slate-800/90 backdrop-blur-xl border border-white/10">
          <div className="text-xs text-gray-400 mb-2 text-center">温度异常幅度（相对于1951-1980年基线）</div>
          <div className="flex items-center gap-1">
            {colorScaleWithValues.map((item, index) => (
              <React.Fragment key={index}>
                <div
                  className="w-8 h-3 first:rounded-l last:rounded-r"
                  style={{ backgroundColor: item.color }}
                />
                {index < colorScaleWithValues.length - 1 && (
                  <div className="w-px h-3 bg-gray-700" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {colorScaleWithValues.filter((_, i) => i % 2 === 0).map((item, index) => (
              <span key={index} className="text-[10px] text-gray-500 font-mono w-12 text-center">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
