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
    token?: string; // Add token to the user object
    loggedIn?: boolean;
  } | null;
}

// Helper function to safely parse user data from localStorage
const parseUserFromStorage = () => {
  try {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    
    const decodedUser = atob(savedUser);
    const parsedUser = JSON.parse(decodedUser);
    
    // Ensure the user object has the correct structure
    if (parsedUser && typeof parsedUser === 'object') {
      return {
        ...parsedUser,
        roles: Array.isArray(parsedUser.roles) ? parsedUser.roles : [],
        loggedIn: true
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing user from storage:', error);
    localStorage.removeItem('user'); // Clean up potentially corrupted data
    return null;
  }
};

const initialUser = parseUserFromStorage();

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    status: {
      loggedIn: !!initialUser,
    },
    user: initialUser,
  }),

  getters: {
    isLoggedIn(): boolean {
      return this.status.loggedIn && !!this.user;
    },
    getUserDetails: (state: AuthState) => state.user,
    getUserToken(): string | null {
      return this.user?.token || null;
    },
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
        
        // Make sure we have the response and user data
        if (!response || !response.user) {
          throw new Error('Invalid response from login service');
        }

        // Ensure the token is included in the user object for storage
        const formattedUser = {
          ...response.user,
          roles: Array.isArray(response.user.roles) ? response.user.roles : [response.user.role],
          token: response.token || response.user.token, // Include token from response
          loggedIn: true,
        };

        console.log('Saving user data:', formattedUser);

        // Update state
        this.user = formattedUser;
        this.$patch({ status: { loggedIn: true } });

        // Save to localStorage
        const encodedUser = btoa(JSON.stringify(formattedUser));
        localStorage.setItem('user', encodedUser);
        
        // For backward compatibility or as a fallback
        if (formattedUser.token) {
          localStorage.setItem('auth', formattedUser.token);
        }

        return response;
      } catch (error) {
        console.error('Login failed:', error);
        this.logout();
        throw error;
      }
    },

    async logout() {
      try {
        const authService = new AuthService();
        await authService.logout();
      } catch (error) {
        console.error('Error during logout:', error);
      } finally {
        // Clear state and storage regardless of API call success
        this.user = null;
        this.$patch({ status: { loggedIn: false } });
        localStorage.removeItem('user');
        localStorage.removeItem('auth');
      }
    },

    async register(user: any) {
      try {
        const authService = new AuthService();
        const response = await authService.register(user);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    checkLocalStorage() {
      const parsedUser = parseUserFromStorage();
      
      if (parsedUser) {
        this.user = parsedUser;
        this.$patch({ status: { loggedIn: true } });
        console.log('User loaded from localStorage:', parsedUser);
      } else {
        this.user = null;
        this.$patch({ status: { loggedIn: false } });
        console.log('No user found in localStorage');
      }
    },
  },
});
