import { createPortal } from 'react-dom';
import useToastStore, { ToastPosition } from '../../store/toastStore';
import Toast from './Toast';

function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  // Agrupar toasts por posición
  const toastsByPosition: Record<ToastPosition, typeof toasts> = {
    'top-left': [],
    'top-center': [],
    'top-right': [],
    'bottom-left': [],
    'bottom-center': [],
    'bottom-right': [],
  };

  toasts.forEach((toast) => {
    const position = toast.position || 'top-right';
    toastsByPosition[position].push(toast);
  });

  // Clases de posicionamiento
  const positionClasses: Record<ToastPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  const content = (
    <>
      {(Object.keys(toastsByPosition) as ToastPosition[]).map((position) => {
        const positionToasts = toastsByPosition[position];

        if (positionToasts.length === 0) return null;

        return (
          <div
            key={position}
            className={`fixed z-50 flex flex-col gap-2 ${positionClasses[position]}`}
          >
            {positionToasts.map((toast) => (
              <Toast key={toast.id} toast={toast} onClose={removeToast} />
            ))}
          </div>
        );
      })}
    </>
  );

  return createPortal(content, document.body);
}

export default ToastContainer;
