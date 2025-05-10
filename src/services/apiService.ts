import type { GenericSetUp } from '@/types/globalTypes'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'

// Safer way to retrieve and parse user token
const getUserToken = () => {
  try {
    const tempStorage = localStorage.getItem('user')
    
    // Log for debugging
    console.log('Raw tempStorage:', tempStorage)
    
    if (tempStorage) {
      const decodedData = atob(tempStorage)
      const userData = JSON.parse(decodedData)
      
      // Log parsed user data
      // console.log('Parsed user data:', userData)
      
      // Check if token exists and has the expected format
      if (userData && userData.token) {
        if (typeof userData.token === 'string' && userData.token.includes('|')) {
          const tokenParts = userData.token.split('|')
          return tokenParts[1]
        } else {
          // If token exists but doesn't have the expected format
          // console.log('Token found but in unexpected format:', userData.token)
          return userData.token // Return the token as is
        }
      }
    }
    
    // Fallback to 'auth' if 'user' data doesn't exist or doesn't contain a token
    const authToken = localStorage.getItem('auth')
    // console.log('Using auth token:', authToken)
    return authToken
  } catch (error) {
    console.error('Error parsing user token:', error)
    // Fallback to 'auth' in case of errors
    return localStorage.getItem('auth')
  }
}

// Get the token
const userToken = getUserToken()
// console.log('Final userToken:', userToken)

// Create an Axios instance with base configuration
axios.defaults.withCredentials = true

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_ENDPOINT, // Use base URL from environment variable
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    ...(userToken && { Authorization: `Bearer ${userToken}` }), // Conditionally add Authorization header
  },
})

// Generic interface for API response structure
interface ApiResponse<T> {
  data: T
}

// Generic function for making API calls, now with PATCH support
export const makeApiCall = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', // Added 'PATCH'
  url: string,
  data?: any,
  config: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> => {
  try {
    if(!config){
      config = {'Content-Type': 'application/json'}
    }
    
    let response: AxiosResponse<ApiResponse<T>>

    switch (method) {
      case 'GET':
        response = await apiClient.get<ApiResponse<T>>(url,config )
        break;
      case 'POST':
        response = await apiClient.post<ApiResponse<T>>(url, data, config)
        break;
      case 'PUT':
        response = await apiClient.put<ApiResponse<T>>(url, data,config )
        break;
      case 'DELETE':
        response = await apiClient.delete<ApiResponse<T>>(url,config )
        break;
      case 'PATCH': // Handling PATCH method
        response = await apiClient.patch<ApiResponse<T>>(url, data, )
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`)
    }

    // Handle status codes like 201 (Created)
    if (response.status === 201)
      console.log('Resource created successfully.')

    return response.data
  }
  catch (error: any) {
    console.error(`Error making API call to ${url}:`, error.message)

    if (error.response) {
      console.error('Response data:', error.response.data)
      console.error('Response status:', error.response.status)
      console.error('Response headers:', error.response.headers)

      // Handle specific status codes more explicitly if needed
      if (error.response.status === 401) {
        console.error('Authentication error: Token may be invalid or expired')
      } else if (error.response.status === 404) {
        console.error('Resource not found.')
      } else if (error.response.status === 500) {
        console.error('Internal server error.')
      }
    }
    else if (error.request) {
      console.error('Request made but no response received:', error.request)
    }
    else {
      console.error('Error setting up the request:', error.message)
    }
    throw error
  }
}

export const assignRole = async (userId: number, roleId: number) => {
  return makeApiCall('POST', `/users/${userId}/roles/assign`, { role_id: roleId })
}

export const removeRole = async (userId: number, roleId: number) => {
  return makeApiCall('POST', `/users/${userId}/roles/remove`, { role_id: roleId })
}

// Example API utility functions
export const getCountries = async (): Promise<ApiResponse<GenericSetUp[]>> => {
  return makeApiCall<GenericSetUp[]>('GET', '/countries')
}

export const getStates = async (): Promise<ApiResponse<GenericSetUp[]>> => {
  return makeApiCall<GenericSetUp[]>('GET', '/states')
}

export const getCities = async (): Promise<ApiResponse<GenericSetUp[]>> => {
  return makeApiCall<GenericSetUp[]>('GET', '/cities')
}

// Add more utility functions as needed
