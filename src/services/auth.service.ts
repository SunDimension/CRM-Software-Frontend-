import axios from 'axios';
import { makeApiCall } from './apiService';

interface User {
  email: string;
  password: string;
  username?: string;
  role_id?: number;
}

interface Role {
  id: number;
  name: string; // 'admin' or 'student'
}

interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: Role; // Now an object
  };
  token: string;
}

interface RegistrationResponse {
  data: any;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_ENDPOINT,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default class AuthService {
  async login(user: User): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/login', {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        const userData = {
          ...response.data.user,
          roles: [response.data.user.role], // Convert role object to roles array
          loggedIn: true,
        };
        localStorage.setItem('user', btoa(JSON.stringify(userData)));
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }

  async register(user: User): Promise<RegistrationResponse> {
    try {
      const response = await makeApiCall<RegistrationResponse>('POST', '/signup', {
        username: user.username,
        email: user.email,
        password: user.password,
        role_id: user.role_id,
      });
      return response.data;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw error;
    }
  }
}
