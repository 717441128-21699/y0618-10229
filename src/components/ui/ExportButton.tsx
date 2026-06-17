import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Image, FileText, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import * as echarts from 'echarts';
import { colors } from '../../utils/colors';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement> | (() => HTMLElement | null);
  title?: string;
  className?: string;
  showSVG?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  targetRef,
  title = 'chart',
  className = '',
  showSVG = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [supportsSVG, setSupportsSVG] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getTargetElement = (): HTMLElement | null => {
    if (typeof targetRef === 'function') {
      return targetRef();
    }
    return targetRef.current;
  };

  useEffect(() => {
    const checkSVGSupport = (): boolean => {
      const element = getTargetElement();
      if (!element) return false;
      
      if (element.querySelector('svg')) {
        return true;
      }
      
      const chartInstance = echarts.getInstanceByDom(element);
      if (chartInstance) {
        return true;
      }
      
      const childElements = element.querySelectorAll('div');
      for (let i = 0; i < childElements.length; i++) {
        const child = childElements[i] as HTMLElement;
        const innerInstance = echarts.getInstanceByDom(child);
        if (innerInstance) {
          return true;
        }
      }
      
      return false;
    };
    
    const checkWithRetries = (attempts: number = 0) => {
      const supported = checkSVGSupport();
      if (supported) {
        setSupportsSVG(true);
      } else if (attempts < 5) {
        setTimeout(() => checkWithRetries(attempts + 1), 300);
      } else {
        setSupportsSVG(false);
      }
    };
    
    const timer = setTimeout(() => checkWithRetries(), 400);
    
    return () => clearTimeout(timer);
  }, [targetRef]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const exportAsPNG = async () => {
    const element = getTargetElement();
    if (!element) return;

    setExporting(true);
    setIsOpen(false);
    
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0F172A',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const link = document.createElement('a');
      link.download = `${title}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (error) {
      console.error('PNG export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const findEChartsInstance = (element: HTMLElement): echarts.ECharts | null => {
    const instance = echarts.getInstanceByDom(element);
    if (instance) return instance;
    
    const childElements = element.querySelectorAll('div');
    for (let i = 0; i < childElements.length; i++) {
      const child = childElements[i] as HTMLElement;
      const childInstance = echarts.getInstanceByDom(child);
      if (childInstance) return childInstance;
    }
    
    return null;
  };

  const exportEChartsAsSVG = (chartInstance: echarts.ECharts): boolean => {
    try {
      const option = chartInstance.getOption();
      const width = chartInstance.getWidth() || 1200;
      const height = chartInstance.getHeight() || 700;
      
      const div = document.createElement('div');
      div.style.width = `${width}px`;
      div.style.height = `${height}px`;
      div.style.position = 'absolute';
      div.style.left = '-9999px';
      div.style.top = '-9999px';
      document.body.appendChild(div);
      
      const svgChart = echarts.init(div, undefined, { renderer: 'svg' });
      svgChart.setOption(option, true);
      
      const svgElement = div.querySelector('svg');
      if (!svgElement) {
        svgChart.dispose();
        document.body.removeChild(div);
        return false;
      }
      
      if (!svgElement.getAttribute('xmlns')) {
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      }
      if (!svgElement.getAttribute('width')) {
        svgElement.setAttribute('width', String(width));
      }
      if (!svgElement.getAttribute('height')) {
        svgElement.setAttribute('height', String(height));
      }
      svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      const svgData = '<?xml version="1.0" encoding="UTF-8"?>\n' + 
        '<!-- Generated by Climate Data Visualization Platform -->\n' +
        new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.download = `${title}-${new Date().toISOString().split('T')[0]}.svg`;
      link.href = URL.createObjectURL(svgBlob);
      link.click();
      
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 1000);
      
      svgChart.dispose();
      document.body.removeChild(div);
      
      return true;
    } catch (error) {
      console.error('ECharts SVG export failed:', error);
      return false;
    }
  };

  const exportNativeSVG = (element: HTMLElement): boolean => {
    try {
      const svgElements = element.querySelectorAll('svg');
      if (svgElements.length === 0) return false;
      
      const svgElement = svgElements[0];
      const width = svgElement.clientWidth || svgElement.getBoundingClientRect().width || 1200;
      const height = svgElement.clientHeight || svgElement.getBoundingClientRect().height || 700;
      
      if (!svgElement.getAttribute('xmlns')) {
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      }
      if (!svgElement.getAttribute('width')) {
        svgElement.setAttribute('width', String(width));
      }
      if (!svgElement.getAttribute('height')) {
        svgElement.setAttribute('height', String(height));
      }
      
      const svgData = '<?xml version="1.0" encoding="UTF-8"?>\n' + 
        '<!-- Generated by Climate Data Visualization Platform -->\n' +
        new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.download = `${title}-${new Date().toISOString().split('T')[0]}.svg`;
      link.href = URL.createObjectURL(svgBlob);
      link.click();
      
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Native SVG export failed:', error);
      return false;
    }
  };

  const exportAsSVG = () => {
    const element = getTargetElement();
    if (!element) return;

    setExporting(true);
    setIsOpen(false);
    
    setTimeout(() => {
      try {
        let success = false;
        
        const chartInstance = findEChartsInstance(element);
        if (chartInstance) {
          success = exportEChartsAsSVG(chartInstance);
        }
        
        if (!success) {
          success = exportNativeSVG(element);
        }
        
        if (success) {
          setExportSuccess(true);
          setTimeout(() => setExportSuccess(false), 2000);
        } else {
          console.warn('SVG export not supported for this element');
        }
      } catch (error) {
        console.error('SVG export failed:', error);
      } finally {
        setExporting(false);
      }
    }, 100);
  };

  const displaySVG = showSVG && supportsSVG;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium transition-all duration-200 hover:scale-105"
      >
        {exportSuccess ? (
          <>
            <Check size={16} style={{ color: colors.forest }} />
            <span>导出成功</span>
          </>
        ) : exporting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>导出中...</span>
          </>
        ) : (
          <>
            <Download size={16} />
            <span>导出图表</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 z-50 min-w-[180px] rounded-xl bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <button
              onClick={exportAsPNG}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Image size={16} style={{ color: colors.accent }} />
              <span>导出为 PNG 图片</span>
            </button>
            {displaySVG && (
              <button
                onClick={exportAsSVG}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-t border-white/5"
              >
                <FileText size={16} style={{ color: colors.glacier }} />
                <span>导出为 SVG 矢量图</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
