import { defineStore } from 'pinia';
import AuthService from '../services/auth.service';

interface AuthState {
  status: {
    loggedIn: boolean;
  };
  user: {
    id: number;
    name: string;
    email: string;
    roles: Array<{ id: number; name: string }>;
    loggedIn?: boolean;
  } | null;
}

const savedUser = localStorage.getItem('user');
const parsedUser = savedUser ? JSON.parse(atob(savedUser)) : null;

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    status: {
      loggedIn: parsedUser?.loggedIn ?? false,
    },
    user: parsedUser ?? null,
  }),

  getters: {
    isLoggedIn(): boolean {
      return this.status.loggedIn;
    },
    getUserDetails: (state: AuthState) => state.user,
    isAdmin(): boolean {
      return this.user?.roles?.some(role => role.name === 'admin') ?? false;
    },
    isStudent(): boolean {
      return this.user?.roles?.some(role => role.name === 'student') ?? false;
    },
  },

  actions: {
    async login(user: any) {
      try {
        const authService = new AuthService();
        const response = await authService.login(user);

        // The AuthService already formats the user data correctly
        this.user = {
          ...response.user,
          roles: [response.user.role], // role is now properly typed as an object
          loggedIn: true,
        };
        this.$patch({ status: { loggedIn: true } });

        // No need to save to localStorage here - AuthService already did it
        return response;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    async logout() {
      const authService = new AuthService();
      await authService.logout();
      this.user = null;
      this.$patch({ status: { loggedIn: false } });
    },

    // ... rest of your actions remain the same
    async register(user: any) {
      try {
        const authService = new AuthService()
        const response = await authService.register(user)
        return response.data
      } catch (error) {
        throw error
      }
    },

    checkLocalStorage() {
      const savedUser = localStorage.getItem('user')
      const parsedUser = savedUser ? JSON.parse(atob(savedUser)) : null

      if (parsedUser) {
        this.user = parsedUser
        this.$patch({ status: { loggedIn: true } })
      } else {
        this.user = null
        this.$patch({ status: { loggedIn: false } })
      }
    },
  },
})

