import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Map,
  ScatterChart,
  CloudLightning,
  Globe2,
  FileBarChart,
  Download,
  CircleDot,
} from 'lucide-react';
import { colors } from '../../utils/colors';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', label: '总览仪表板', icon: LayoutDashboard, color: colors.accent },
  { to: '/trends', label: '趋势分析', icon: TrendingUp, color: colors.accent },
  { to: '/map', label: '全球分布', icon: Map, color: colors.glacier },
  { to: '/correlation', label: '相关性分析', icon: ScatterChart, color: colors.forest },
  { to: '/extreme-weather', label: '极端天气', icon: CloudLightning, color: colors.warning },
  { to: '/scenarios', label: '情景预测', icon: Globe2, color: colors.warning },
  { to: '/export', label: '数据导出', icon: Download, color: colors.glacier },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed left-0 top-16 bottom-0 w-64 z-30 lg:translate-x-0 border-r border-white/10 overflow-y-auto"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}
      >
        <div className="p-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            数据视图
          </p>
          
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              end={item.to === '/'}
              className={({ isActive }) => `
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
              style={({ isActive }) => ({
                backgroundColor: isActive ? `${item.color}15` : undefined,
                boxShadow: isActive ? `inset 2px 0 0 ${item.color}` : undefined,
              })}
            >
              {({ isActive }) => (
                <>
                  <motion.span
                    initial={false}
                    animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                    style={{ color: isActive ? item.color : undefined }}
                  >
                    <item.icon size={18} />
                  </motion.span>
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="p-4 rounded-xl" style={{ backgroundColor: `${colors.accent}10`, border: `1px solid ${colors.accent}20` }}>
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={14} style={{ color: colors.accent }} />
              <span className="text-xs font-medium" style={{ color: colors.accent }}>
                关于数据
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              本平台使用基于真实气候趋势的模拟数据，用于演示目的。实际研究请参考官方数据源。
            </p>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
