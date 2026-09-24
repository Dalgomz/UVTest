import axios, { AxiosInstance } from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: backendUrl,
  timeout: 10 * 1000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

export default apiClient;