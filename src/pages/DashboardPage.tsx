import useAuthStore from '../store/authStore';
import DashboardAdmin from '../components/dashboard/DashboardAdmin';
import DashboardGestor from '../components/dashboard/DashboardGestor';
import DashboardAnalista from '../components/dashboard/DashboardAnalista';
import DashboardInvitado from '../components/dashboard/DashboardInvitado';

function DashboardPage() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  // Renderizar el dashboard específico según el rol
  switch (user.role) {
    case 'admin':
      return <DashboardAdmin />;
    case 'gestor':
      return <DashboardGestor />;
    case 'analista':
      return <DashboardAnalista />;
    case 'invitado':
      return <DashboardInvitado />;
    default:
      return <DashboardAdmin />;
  }
}

export default DashboardPage;
