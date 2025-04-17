import { defineStore } from 'pinia'
import AuthService from '../services/auth.service'

// Define the state interface
interface AuthState {
  status: {
    loggedIn: boolean
  }
  user: {
    id: number
    name: string
    email: string
    roles: Array<{ id: number; name: string }>
    loggedIn?: boolean // Optional to match what's stored in localStorage
  } | null
}

// Load user from localStorage (decode and parse)
const savedUser = localStorage.getItem('user')
const parsedUser = savedUser ? JSON.parse(atob(savedUser)) : null

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    status: {
      loggedIn: parsedUser?.loggedIn ?? false,
    },
    user: parsedUser ?? null,
  }),

  getters: {
    isLoggedIn(): boolean {
      return this.status.loggedIn
    },
    getUserDetails: (state: AuthState) => state.user,
  },

  actions: {
    async login(user: any) {
      try {
        const authService = new AuthService()
        const response = await authService.login(user)

      
        const userToSave = {
          ...response.data.user,
          roles: [{ id: 2, name: response.data.role }],
          loggedIn: true,
        }

        this.user = userToSave
        this.$patch({ status: { loggedIn: true } })

        // Save to localStorage
        localStorage.setItem('user', btoa(JSON.stringify(userToSave)))

        return response
      } catch (error) {
        throw error
      }
    },

    async logout() {
      const authService = new AuthService()
      await authService.logout()

      this.user = null
      this.$patch({ status: { loggedIn: false } })

      // Clear localStorage
      localStorage.removeItem('user')
    },

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
