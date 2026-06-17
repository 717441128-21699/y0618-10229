import React from 'react';
import { colors } from '../../utils/colors';

interface ToggleButtonProps {
  label: string;
  value: string;
  selected: boolean;
  onClick: () => void;
  color?: string;
  icon?: React.ReactNode;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  label,
  selected,
  onClick,
  color = colors.accent,
  icon,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
        flex items-center gap-2 border
        ${selected 
          ? 'shadow-lg scale-105' 
          : 'hover:bg-white/5 border-white/10 text-gray-400 hover:text-gray-300'
        }
      `}
      style={{
        backgroundColor: selected ? `${color}25` : 'transparent',
        borderColor: selected ? `${color}60` : 'rgba(148, 163, 184, 0.1)',
        color: selected ? color : undefined,
        boxShadow: selected ? `0 0 20px ${color}30` : 'none',
      }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

interface ToggleGroupProps {
  options: Array<{
    value: string;
    label: string;
    color?: string;
    icon?: React.ReactNode;
  }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`inline-flex rounded-xl p-1 bg-white/5 border border-white/10 ${className}`}>
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          label={option.label}
          value={option.value}
          selected={value === option.value}
          onClick={() => onChange(option.value)}
          color={option.color}
          icon={option.icon}
        />
      ))}
    </div>
  );
};

interface MultiToggleGroupProps {
  options: Array<{
    value: string;
    label: string;
    color?: string;
    icon?: React.ReactNode;
  }>;
  values: string[];
  onChange: (values: string[]) => void;
  className?: string;
}

export const MultiToggleGroup: React.FC<MultiToggleGroupProps> = ({
  options,
  values,
  onChange,
  className = '',
}) => {
  const handleToggle = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter(v => v !== optionValue));
    } else {
      onChange([...values, optionValue]);
    }
  };

  return (
    <div className={`inline-flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          label={option.label}
          value={option.value}
          selected={values.includes(option.value)}
          onClick={() => handleToggle(option.value)}
          color={option.color}
          icon={option.icon}
        />
      ))}
    </div>
  );
};
