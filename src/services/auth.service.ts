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
      console.log('Attempting login for user:', user.email);
      
      const response = await apiClient.post<LoginResponse>('/login', {
        email: user.email,
        password: user.password,
      });

      console.log('Login response:', response.data);

      if (response.data.token) {
        const userData = {
          ...response.data.user,
          roles: [response.data.user.role],
          loggedIn: true,
          token: response.data.token,
        };

        console.log('Formatted user data:', userData);

        const encodedUserData = btoa(JSON.stringify(userData));
        console.log('Encoded user data:', encodedUserData);
        
        localStorage.setItem('user', encodedUserData);
        
        // Verify storage
        const storedData = localStorage.getItem('user');
        console.log('Stored user data:', storedData);
        
        // Decode and verify
        const decodedData = JSON.parse(atob(storedData || ''));
        console.log('Decoded stored data:', decodedData);
      }
      return response.data;
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    }
  }

  logout(): void {
    console.log('Logging out user');
    localStorage.removeItem('user');
    console.log('User data cleared from storage');
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
