import { ReactNode } from 'react';

export type CardVariant = 'default' | 'outlined' | 'elevated';

export interface CardProps {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  actions?: ReactNode;
  variant?: CardVariant;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

function Card({
  children,
  title,
  subtitle,
  footer,
  actions,
  variant = 'default',
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  onClick,
  hoverable = false,
}: CardProps) {
  // Estilos base
  const baseStyles = 'rounded-lg transition-all duration-200';

  // Estilos por variante
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl',
  };

  // Estilos de hover si es clickeable
  const hoverStyles = hoverable || onClick ? 'cursor-pointer hover:scale-[1.02]' : '';

  // Clases combinadas
  const cardClasses = `${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Header */}
      {(title || subtitle || actions) && (
        <div
          className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${headerClassName}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && <div className="ml-4 flex-shrink-0">{actions}</div>}
          </div>
        </div>
      )}

      {/* Body */}
      {children && (
        <div className={`px-6 py-4 ${bodyClassName}`}>
          <div className="text-gray-700 dark:text-gray-300">{children}</div>
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div
          className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg ${footerClassName}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export default Card;
