import { GenericSetUp } from '@/types/globalTypes';
import axios, { AxiosResponse } from 'axios';

// Retrieve the user token from localStorage
let userToken: string | null = null;
try {
  const tempStorage = localStorage.getItem('user');
  userToken = tempStorage ? JSON.parse(atob(tempStorage)).token : null;
} catch (error) {
  console.error('Error parsing user token from localStorage:', error);
}

// Create an Axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_ENDPOINT, // Use base URL from environment variable
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    ...(userToken && { 'Authorization': `Bearer ${userToken}` }), // Conditionally add Authorization header
  },
});

// Generic interface for API response structure
interface ApiResponse<T> {
  data: T;
}

// Generic function for making API calls
export const makeApiCall = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<ApiResponse<T>> => {
  try {
    let response: AxiosResponse<ApiResponse<T>>;

    switch (method) {
      case 'GET':
        response = await apiClient.get<ApiResponse<T>>(url);
        break;
      case 'POST':
        response = await apiClient.post<ApiResponse<T>>(url, data);
        break;
      case 'PUT':
        response = await apiClient.put<ApiResponse<T>>(url, data);
        break;
      case 'DELETE':
        response = await apiClient.delete<ApiResponse<T>>(url);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return response.data;
  } catch (error: any) {
    // Improved error handling
    console.error(`Error making API call to ${url}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request made but no response received:', error.request);
    } else {
      console.error('Error setting up the request:', error.message);
    }
    throw error;
  }
};

// Example API utility functions

export const getCountries = async (): Promise<ApiResponse<GenericSetUp[]>> => {
  return makeApiCall<GenericSetUp[]>('GET', '/countries');
};

export const getStates = async (): Promise<ApiResponse<GenericSetUp[]>> => {
  return makeApiCall<GenericSetUp[]>('GET', '/states');
};

export const getCities = async (): Promise<ApiResponse<GenericSetUp[]>> => {
  return makeApiCall<GenericSetUp[]>('GET', '/cities');
};

// Add more utility functions as needed

