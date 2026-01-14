import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import useAuthStore from '../../store/authStore';
import { UserWithoutPassword, UserRole, ROLE_CONFIGS } from '../../types';
import UserTable from './UserTable';
import UserForm, { UserFormData } from './UserForm';
import ConfirmDialog from '../common/ConfirmDialog';
import { toast } from '../../store/toastStore';
import DashboardHeader from '../dashboard/DashboardHeader';

function UserManagement() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuthStore();
  const {
    loadUsers,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    searchUsers,
  } = useUserStore();

  const roleConfig = currentUser ? ROLE_CONFIGS[currentUser.role] : ROLE_CONFIGS.admin;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  // Estados
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithoutPassword[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal de formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | undefined>();
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Modal de confirmación de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar usuarios al montar
  useEffect(() => {
    loadUsers().then(() => {
      const allUsers = getAllUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    });
  }, [loadUsers, getAllUsers]);

  // Aplicar filtros
  useEffect(() => {
    let result = users;

    // Búsqueda
    if (searchQuery.trim()) {
      result = searchUsers(searchQuery);
    }

    // Filtro por rol
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Filtro por estado
    if (statusFilter === 'active') {
      result = result.filter((u) => u.active === true);
    } else if (statusFilter === 'inactive') {
      result = result.filter((u) => u.active === false);
    }

    setFilteredUsers(result);
  }, [searchQuery, roleFilter, statusFilter, users, searchUsers]);

  // Refrescar lista de usuarios
  const refreshUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  // Abrir formulario para crear
  const handleCreate = () => {
    setEditingUser(undefined);
    setIsFormOpen(true);
  };

  // Abrir formulario para editar
  const handleEdit = (user: UserWithoutPassword) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  // Submit del formulario
  const handleFormSubmit = async (data: UserFormData) => {
    setIsFormLoading(true);

    try {
      if (editingUser) {
        // Actualizar usuario existente
        const result = await updateUser(editingUser.username, {
          name: data.name,
          email: data.email,
          role: data.role,
          organization: data.organization,
          password: data.password,
        });

        if (result.success) {
          toast.success('Usuario actualizado correctamente');
          setIsFormOpen(false);
          refreshUsers();
        } else {
          toast.error(result.error || 'Error al actualizar usuario');
        }
      } else {
        // Crear nuevo usuario
        const result = await createUser({
          username: data.username,
          password: data.password || '',
          name: data.name,
          email: data.email,
          role: data.role,
          organization: data.organization,
        });

        if (result.success) {
          toast.success('Usuario creado correctamente');
          setIsFormOpen(false);
          refreshUsers();
        } else {
          toast.error(result.error || 'Error al crear usuario');
        }
      }
    } catch (error) {
      console.error('Error en formulario:', error);
      toast.error('Error inesperado al guardar usuario');
    } finally {
      setIsFormLoading(false);
    }
  };

  // Confirmar eliminación
  const handleDeleteClick = (username: string) => {
    setUserToDelete(username);
    setDeleteConfirmOpen(true);
  };

  // Eliminar usuario
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);

    try {
      const result = await deleteUser(userToDelete);

      if (result.success) {
        toast.success('Usuario eliminado correctamente');
        setDeleteConfirmOpen(false);
        refreshUsers();
      } else {
        toast.error(result.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      toast.error('Error inesperado al eliminar usuario');
    } finally {
      setIsDeleting(false);
      setUserToDelete('');
    }
  };

  // Toggle activo/inactivo
  const handleToggleActive = async (username: string) => {
    try {
      const result = await toggleUserActive(username);

      if (result.success) {
        const user = users.find((u) => u.username === username);
        const newStatus = !user?.active;
        toast.success(`Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`);
        refreshUsers();
      } else {
        toast.error(result.error || 'Error al cambiar estado del usuario');
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
      toast.error('Error inesperado al cambiar estado');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader
        user={currentUser}
        roleConfig={roleConfig}
        onLogout={handleLogout}
        onSettings={handleSettings}
      />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título de sección con botón de volver */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Volver al Dashboard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              👥 Gestión de Usuarios
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Administrar usuarios del sistema
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {users.length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Activos</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {users.filter((u) => u.active).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Inactivos</div>
            <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
              {users.filter((u) => !u.active).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Administradores</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {users.filter((u) => u.role === 'admin').length}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por usuario, nombre o email..."
                className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>

            {/* Filtro por Rol */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">👨‍💼 Administrador</option>
              <option value="gestor">📊 Gestor</option>
              <option value="analista">📈 Analista</option>
              <option value="invitado">👤 Invitado</option>
            </select>

            {/* Filtro por Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            >
              <option value="all">Todos los estados</option>
              <option value="active">✅ Activos</option>
              <option value="inactive">❌ Inactivos</option>
            </select>

            {/* Botón Crear */}
            <button
              onClick={handleCreate}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Crear Usuario
            </button>
          </div>
        </div>

        {/* Tabla */}
        <UserTable
          users={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onToggleActive={handleToggleActive}
        />
      </main>

      {/* Modals */}
      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={editingUser}
        isLoading={isFormLoading}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar el usuario "${userToDelete}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default UserManagement;
