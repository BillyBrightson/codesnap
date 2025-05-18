import React from "react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, disabled, className }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`inline-flex items-center w-10 h-6 rounded-full transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
      onClick={() => !disabled && onCheckedChange(!checked)}
      tabIndex={0}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}; 