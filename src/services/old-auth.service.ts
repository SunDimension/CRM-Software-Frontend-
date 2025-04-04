import axios from 'axios';
import { makeApiCall } from './apiService';

interface User {
  email: string;
  password: string;
  username?: string; // Optional for login (required for registration)
}

interface LoginResponse {
  user: any;
  token: string;
  // Add other properties you expect in the login response
}

interface RegistrationResponse {
  data: any;
  // Add properties you expect in the registration response 
  // (e.g., success message, user ID)
}

const apiClient = axios.create({
  // baseURL: '/api', // Base URL from environment variable
  baseURL: import.meta.env.VITE_APP_API_ENDPOINT,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
});

export default class AuthService {
  constructor() {
    // You can initialize properties here if needed
  } 
  async login(user: User): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/login', {email: user.email, password: user.password,},)

      // console.log("Login response----->", response.data);
      if (response.data.token) {
       localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data.user));
 
      }
      return response.data;
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  async register(user: User): Promise<RegistrationResponse> {
    try {
      const response = await makeApiCall<RegistrationResponse>('POST', '/signup', {
        username: user.username,
        email: user.email,
        password: user.password
      },)

      return response.data;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  }
}
