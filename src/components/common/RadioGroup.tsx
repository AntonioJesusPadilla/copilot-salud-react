export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  name: string;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
}

function RadioGroup({
  options,
  value,
  onChange,
  label,
  name,
  direction = 'vertical',
  disabled = false,
}: RadioGroupProps) {
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {label}
        </label>
      )}

      {/* Options */}
      <div className={`flex ${direction === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'} gap-3`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-3 px-4 py-3 border-2 rounded-lg transition-all cursor-pointer ${
              option.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-primary hover:bg-primary/5'
            } ${
              value === option.value
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => !option.disabled && onChange(option.value)}
              disabled={disabled || option.disabled}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
            />
            <div className="flex-1">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                {option.label}
              </span>
              {option.description && (
                <span className="block text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

export default RadioGroup;
