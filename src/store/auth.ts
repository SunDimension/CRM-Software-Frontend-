import { defineStore } from 'pinia'
import AuthService from '../services/auth.service'

// Define the state interface for type safety
interface AuthState {
  status: {
    loggedIn: boolean
  }
  user: {
    id: number
    name: string
    email: string
    store_id: number
    branch_id: number
    branch: any
    store: any
    roles: Array<{ id: number; name: string }> | [] // Refined type for roles
  } | null // Replace with the actual user object type
}

const savedUser = localStorage.getItem('user')
const parsedUser = savedUser ? JSON.parse(atob(savedUser)) : null

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    status: {
      // loggedIn: JSON.parse(localStorage.getItem('user'))?.loggedIn as boolean ?? false, // Check localStorage for initial state
      loggedIn: parsedUser?.loggedIn ?? false,
    },
    user: parsedUser ?? null, // Hydrate user from localStorage
  }),
  getters: {
    isLoggedIn(): boolean {
      return this.status.loggedIn
    },
    getUserDetails: (state: any) => {
      return state.user // Adjust this according to your state structure
    },
  },
  actions: {
    async login(user: any) { // Replace 'any' with actual user type
      try {
        const authService = new AuthService()// !potential issues, revisit
        const response = await authService.login(user)

        this.user = response.data // Update state directly (no mutations)
        this.$patch({ status: { loggedIn: true } }) // Patch only changed property for efficiency

        return response
      }
      catch (error) {
        throw error // Re-throw for component handling
      }
    },
    async logout() {
      const authService = new AuthService()// !potential issues, revisit

      await authService.logout()
      this.user = null
      this.$patch({ status: { loggedIn: false } })
    },
    async register(user: any) { // Replace 'any' with actual user type
      try {
        const authService = new AuthService()// !potential issues, revisit
        const response = await authService.register(user)

        // Handle registration logic (e.g., potentially log in the user)
        return response.data
      }
      catch (error) {
        throw error // Re-throw for component handling
      }
    },
    checkLocalStorage() {
      const savedUser = localStorage.getItem('user')
      const parsedUser = savedUser ? JSON.parse(atob(savedUser)) : null

      // console.log(savedUser)
      if (parsedUser) {
        this.user = parsedUser
        this.$patch({ status: { loggedIn: true } })
      }
      else {
        this.user = null
        this.$patch({ status: { loggedIn: false } })
      }
    },
  },

  // No mutations needed with direct state updates in actions
  // Optionally, for complex state updates:
  // mutations: {
  //   setUser(state, user: any) {
  //     state.user = user;
  //   },
  // },
})
