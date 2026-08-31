import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
  withCredentials: true,
})

API.interceptors.request.use(async (config) => {
  try {
    if (window.Clerk?.session) {
      const token = await window.Clerk.session.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch (error) {
    console.error(error)
  }
  return config
})

export default API