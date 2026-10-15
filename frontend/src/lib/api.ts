import axios from 'axios'
export const api = axios.create({
    baseURL:process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
    withCredentials:true,
})

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("gd_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


