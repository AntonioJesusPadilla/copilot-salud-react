import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bcrypt from 'bcryptjs';
import { User, UserWithoutPassword, UserRole } from '../types';

export interface CreateUserData {
  username: string;
  password: string;
  name: string;
  email?: string;
  role: UserRole;
  organization?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  organization?: string;
  active?: boolean;
  password?: string; // Solo si se quiere cambiar
}

interface UserStore {
  users: Record<string, User>;
  isLoaded: boolean;

  // CRUD operations
  loadUsers: () => Promise<void>;
  getUser: (username: string) => User | undefined;
  getAllUsers: () => UserWithoutPassword[];
  createUser: (data: CreateUserData) => Promise<{ success: boolean; error?: string }>;
  updateUser: (username: string, data: UpdateUserData) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (username: string) => Promise<{ success: boolean; error?: string }>;
  toggleUserActive: (username: string) => Promise<{ success: boolean; error?: string }>;

  // Search & filter
  searchUsers: (query: string) => UserWithoutPassword[];
  filterByRole: (role: UserRole) => UserWithoutPassword[];
  filterByStatus: (active: boolean) => UserWithoutPassword[];
}

const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: {},
      isLoaded: false,

      // Cargar usuarios iniciales desde JSON o localStorage
      loadUsers: async () => {
        const state = get();

        // Si ya están cargados, no recargar
        if (state.isLoaded && Object.keys(state.users).length > 0) {
          return;
        }

        try {
          // Intentar cargar desde el JSON inicial
          const response = await fetch('/data/users.json');
          if (response.ok) {
            const data: Record<string, User> = await response.json();
            set({ users: data, isLoaded: true });
          }
        } catch (error) {
          console.error('Error cargando usuarios:', error);
          set({ isLoaded: true });
        }
      },

      // Obtener un usuario específico
      getUser: (username: string) => {
        return get().users[username];
      },

      // Obtener todos los usuarios (sin contraseña)
      getAllUsers: () => {
        const users = get().users;
        return Object.entries(users).map(([username, user]) => {
          const { password, ...userWithoutPassword } = user;
          return { ...userWithoutPassword, username };
        });
      },

      // Crear nuevo usuario
      createUser: async (data: CreateUserData) => {
        const { users } = get();

        // Validar que el username no exista
        if (users[data.username]) {
          return { success: false, error: 'El nombre de usuario ya existe' };
        }

        try {
          // Hash de la contraseña
          const hashedPassword = await bcrypt.hash(data.password, 10);

          const newUser: User = {
            username: data.username,
            password: hashedPassword,
            name: data.name,
            email: data.email,
            role: data.role,
            organization: data.organization,
            active: true,
            canChangePassword: true,
            created_date: new Date().toISOString(),
            last_login: undefined,
          };

          set({
            users: {
              ...users,
              [data.username]: newUser,
            },
          });

          return { success: true };
        } catch (error) {
          console.error('Error creando usuario:', error);
          return { success: false, error: 'Error al crear el usuario' };
        }
      },

      // Actualizar usuario existente
      updateUser: async (username: string, data: UpdateUserData) => {
        const { users } = get();
        const user = users[username];

        if (!user) {
          return { success: false, error: 'Usuario no encontrado' };
        }

        try {
          const updatedUser: User = {
            ...user,
            ...(data.name && { name: data.name }),
            ...(data.email !== undefined && { email: data.email }),
            ...(data.role && { role: data.role }),
            ...(data.organization !== undefined && { organization: data.organization }),
            ...(data.active !== undefined && { active: data.active }),
          };

          // Si se proporciona nueva contraseña, hashearla
          if (data.password) {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            updatedUser.password = hashedPassword;
            updatedUser.lastPasswordChange = new Date().toISOString();
          }

          set({
            users: {
              ...users,
              [username]: updatedUser,
            },
          });

          return { success: true };
        } catch (error) {
          console.error('Error actualizando usuario:', error);
          return { success: false, error: 'Error al actualizar el usuario' };
        }
      },

      // Eliminar usuario
      deleteUser: async (username: string) => {
        const { users } = get();

        if (!users[username]) {
          return { success: false, error: 'Usuario no encontrado' };
        }

        // No permitir eliminar el último admin
        const allUsers = Object.values(users);
        const adminCount = allUsers.filter((u) => u.role === 'admin' && u.active).length;

        if (users[username].role === 'admin' && adminCount <= 1) {
          return { success: false, error: 'No se puede eliminar el único administrador activo' };
        }

        const { [username]: removed, ...remainingUsers } = users;

        set({ users: remainingUsers });

        return { success: true };
      },

      // Activar/Desactivar usuario
      toggleUserActive: async (username: string) => {
        const { users } = get();
        const user = users[username];

        if (!user) {
          return { success: false, error: 'Usuario no encontrado' };
        }

        // No permitir desactivar el último admin activo
        const allUsers = Object.values(users);
        const activeAdminCount = allUsers.filter(
          (u) => u.role === 'admin' && u.active
        ).length;

        if (user.role === 'admin' && user.active && activeAdminCount <= 1) {
          return { success: false, error: 'No se puede desactivar el único administrador activo' };
        }

        set({
          users: {
            ...users,
            [username]: {
              ...user,
              active: !user.active,
            },
          },
        });

        return { success: true };
      },

      // Buscar usuarios por nombre, email o username
      searchUsers: (query: string) => {
        const allUsers = get().getAllUsers();
        const lowerQuery = query.toLowerCase();

        return allUsers.filter(
          (user) =>
            user.username.toLowerCase().includes(lowerQuery) ||
            user.name.toLowerCase().includes(lowerQuery) ||
            (user.email && user.email.toLowerCase().includes(lowerQuery))
        );
      },

      // Filtrar por rol
      filterByRole: (role: UserRole) => {
        const allUsers = get().getAllUsers();
        return allUsers.filter((user) => user.role === role);
      },

      // Filtrar por estado (activo/inactivo)
      filterByStatus: (active: boolean) => {
        const allUsers = get().getAllUsers();
        return allUsers.filter((user) => user.active === active);
      },
    }),
    {
      name: 'user-management-storage',
      // Solo persistir los usuarios, no isLoaded
      partialize: (state) => ({ users: state.users }),
    }
  )
);

export default useUserStore;
