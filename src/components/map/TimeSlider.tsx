import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { colors } from '../../utils/colors';

interface TimeSliderProps {
  years: number[];
  selectedYear: number;
  onChange: (year: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({
  years,
  selectedYear,
  onChange,
  isPlaying,
  onPlayToggle,
}) => {
  const currentIndex = years.indexOf(selectedYear);
  const progress = (currentIndex / (years.length - 1)) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    onChange(years[index]);
  };

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    onChange(years[newIndex]);
  };

  const handleNext = () => {
    const newIndex = Math.min(years.length - 1, currentIndex + 1);
    onChange(years[newIndex]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-slate-800/90 backdrop-blur-xl border border-white/10 shadow-xl"
    >
      <button
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <SkipBack size={18} />
      </button>

      <button
        onClick={onPlayToggle}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: colors.accent }}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <button
        onClick={handleNext}
        disabled={currentIndex === years.length - 1}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <SkipForward size={18} />
      </button>

      <div className="flex-1">
        <div className="relative">
          <input
            type="range"
            min={0}
            max={years.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${colors.accent} 0%, ${colors.accent} ${progress}%, rgba(148, 163, 184, 0.2) ${progress}%, rgba(148, 163, 184, 0.2) 100%)`,
              WebkitAppearance: 'none',
            }}
          />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${colors.accent};
            cursor: pointer;
            border: 3px solid ${colors.primary};
            box-shadow: 0 0 15px ${colors.accent}80;
            transition: all 0.2s ease;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 0 25px ${colors.accent}CC;
          }
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${colors.accent};
            cursor: pointer;
            border: 3px solid ${colors.primary};
            box-shadow: 0 0 15px ${colors.accent}80;
          }
        `}</style>
        </div>
      </div>

      <div className="text-center min-w-[100px]">
        <div className="text-2xl font-bold font-mono" style={{ color: colors.accent }}>
          {selectedYear}年
        </div>
      </div>
    </motion.div>
  );
};
