import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Menu, X } from 'lucide-react';
import { colors } from '../../utils/colors';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-40 h-16 px-6 flex items-center justify-between backdrop-blur-xl border-b border-white/10"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all lg:hidden"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colors.accent}25` }}>
            <Globe size={22} style={{ color: colors.accent }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              气候数据可视化平台
            </h1>
            <p className="text-xs text-gray-400">
              全球气候变化历史数据与预测分析
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-full text-xs font-medium text-gray-400 bg-white/5 border border-white/10">
          数据来源: NASA, NOAA, IPCC AR6
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ color: colors.forest, backgroundColor: `${colors.forest}15`, border: `1px solid ${colors.forest}30` }}>
          模拟演示数据
        </div>
      </div>
    </motion.header>
  );
};
