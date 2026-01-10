export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  color?: string;
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  size = 'md',
  disabled = false,
  color = 'bg-primary',
}: ToggleSwitchProps) {
  // Tamaños
  const sizeClasses = {
    sm: {
      switch: 'w-9 h-5',
      circle: 'w-4 h-4',
      translate: 'translate-x-4',
    },
    md: {
      switch: 'w-11 h-6',
      circle: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      switch: 'w-14 h-7',
      circle: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className="flex items-start gap-3">
      {/* Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex flex-shrink-0 ${sizes.switch} border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : checked
              ? color
              : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span className="sr-only">{label || 'Toggle'}</span>
        <span
          aria-hidden="true"
          className={`${sizes.circle} inline-block bg-white rounded-full shadow transform ring-0 transition ease-in-out duration-200 ${
            checked ? sizes.translate : 'translate-x-0'
          }`}
        />
      </button>

      {/* Label and Description */}
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
              {label}
            </span>
          )}
          {description && (
            <span className="block text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ToggleSwitch;
