import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[]; // Roles permitidos para acceder a esta ruta
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles específicos permitidos, verificar que el usuario tenga uno de ellos
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      // Usuario no tiene permiso, redirigir a su dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Usuario autenticado y con permiso
  return <>{children}</>;
}

export default ProtectedRoute;
