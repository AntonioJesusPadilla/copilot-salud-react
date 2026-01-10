import Modal from './Modal';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  // Colores por variante
  const variantStyles = {
    danger: {
      icon: '⚠️',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonBg: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
    },
    warning: {
      icon: '⚡',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      buttonBg:
        'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800',
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonBg: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800',
    },
  };

  const styles = variantStyles[variant];

  const footer = (
    <div className="flex justify-end gap-3">
      <button
        onClick={onClose}
        disabled={isLoading}
        className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelText}
      </button>
      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles.buttonBg}`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Procesando...
          </span>
        ) : (
          confirmText
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="flex items-start gap-4">
        {/* Icono */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg}`}>
          <span className={`text-2xl ${styles.iconColor}`}>{styles.icon}</span>
        </div>

        {/* Mensaje */}
        <div className="flex-1 pt-1">
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
