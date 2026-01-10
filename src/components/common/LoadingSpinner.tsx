export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'spinner' | 'dots' | 'pulse' | 'ring';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  color?: string;
}

function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  overlay = false,
  color = 'text-primary',
}: LoadingSpinnerProps) {
  // Tamaños
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  // Variante Spinner (default)
  const SpinnerIcon = () => (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${color}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Variante Dots
  const DotsIcon = () => (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${dotSizeClasses[size]} ${color.replace('text-', 'bg-')} rounded-full animate-bounce`}
          style={{
            animationDelay: `${index * 0.15}s`,
          }}
        />
      ))}
    </div>
  );

  // Variante Pulse
  const PulseIcon = () => (
    <div
      className={`${sizeClasses[size]} ${color.replace('text-', 'bg-')} rounded-full animate-pulse`}
    />
  );

  // Variante Ring
  const RingIcon = () => (
    <div className={`relative ${sizeClasses[size]}`}>
      <div
        className={`absolute inset-0 rounded-full border-4 ${color.replace('text-', 'border-')} opacity-25`}
      />
      <div
        className={`absolute inset-0 rounded-full border-4 ${color.replace('text-', 'border-')} border-t-transparent animate-spin`}
      />
    </div>
  );

  // Seleccionar variante
  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return <DotsIcon />;
      case 'pulse':
        return <PulseIcon />;
      case 'ring':
        return <RingIcon />;
      default:
        return <SpinnerIcon />;
    }
  };

  // Contenido del spinner
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-3">
      {renderVariant()}
      {text && (
        <p className={`${textSizeClasses[size]} font-medium ${color} dark:text-gray-300`}>
          {text}
        </p>
      )}
    </div>
  );

  // Fullscreen mode
  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center ${
          overlay
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm'
            : 'bg-white dark:bg-gray-900'
        }`}
      >
        {spinnerContent}
      </div>
    );
  }

  // Normal mode
  return <div className="flex items-center justify-center p-4">{spinnerContent}</div>;
}

export default LoadingSpinner;
