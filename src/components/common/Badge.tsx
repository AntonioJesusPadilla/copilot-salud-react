import { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default' | 'primary';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  outline?: boolean;
  icon?: ReactNode;
  onClose?: () => void;
  className?: string;
}

function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  outline = false,
  icon,
  onClose,
  className = '',
}: BadgeProps) {
  // Tamaños
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  // Colores por variante
  const variantClasses = {
    success: outline
      ? 'border-2 border-green-500 text-green-700 dark:text-green-400 bg-transparent'
      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    error: outline
      ? 'border-2 border-red-500 text-red-700 dark:text-red-400 bg-transparent'
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    warning: outline
      ? 'border-2 border-yellow-500 text-yellow-700 dark:text-yellow-400 bg-transparent'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    info: outline
      ? 'border-2 border-blue-500 text-blue-700 dark:text-blue-400 bg-transparent'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    primary: outline
      ? 'border-2 border-primary text-primary bg-transparent'
      : 'bg-primary/10 text-primary dark:bg-primary/20',
    default: outline
      ? 'border-2 border-gray-500 text-gray-700 dark:text-gray-400 bg-transparent'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${sizeClasses[size]} ${
        variantClasses[variant]
      } ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
    >
      {/* Icon */}
      {icon && <span className="flex-shrink-0">{icon}</span>}

      {/* Content */}
      <span>{children}</span>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-1 hover:opacity-70 transition-opacity"
          aria-label="Eliminar badge"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

export default Badge;
