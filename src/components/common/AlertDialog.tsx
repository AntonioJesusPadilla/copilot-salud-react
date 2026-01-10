import Modal from './Modal';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
}

function AlertDialog({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Entendido',
}: AlertDialogProps) {
  // Estilos por tipo
  const typeStyles = {
    success: {
      icon: '✅',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      buttonBg: 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800',
    },
    error: {
      icon: '❌',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonBg: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
    },
    warning: {
      icon: '⚠️',
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

  const styles = typeStyles[type];

  const footer = (
    <div className="flex justify-end">
      <button
        onClick={onClose}
        className={`px-6 py-2 text-white rounded-lg transition-colors ${styles.buttonBg}`}
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} size="sm">
      <div className="flex items-start gap-4">
        {/* Icono */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${styles.iconBg}`}
        >
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

export default AlertDialog;
