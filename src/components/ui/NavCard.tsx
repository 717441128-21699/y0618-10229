import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { colors } from '../../utils/colors';

interface NavCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  color: string;
  delay?: number;
}

export const NavCard: React.FC<NavCardProps> = ({
  icon: Icon,
  title,
  description,
  to,
  color,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={to} className="block">
        <div 
          className="group relative overflow-hidden rounded-2xl p-6 h-full backdrop-blur-xl border border-white/10 shadow-xl transition-all duration-300 hover:shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${color}10 0%, ${colors.primaryLight}80 100%)`,
          }}
        >
          <div 
            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" 
            style={{ backgroundColor: color }} 
          />
          
          <div className="relative z-10">
            <div 
              className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300"
              style={{ backgroundColor: `${color}30` }}
            >
              <Icon size={24} style={{ color }} />
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
              {title}
            </h3>
            
            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              {description}
            </p>
            
            <div className="mt-4 flex items-center text-sm font-medium" style={{ color }}>
              查看详情
              <svg 
                className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
