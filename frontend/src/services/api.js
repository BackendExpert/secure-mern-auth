import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true // important for cookie refresh
});

// interceptor to attach access token to requests and try refresh when 401
let isRefreshing = false;
let refreshPromise = null;

api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    res => res,
    async (err) => {
        const original = err.config;
        if (err.response && err.response.status === 401 && !original._retry) {
            original._retry = true;
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = api.post('/auth/refresh').then(r => {
                    localStorage.setItem('access_token', r.data.access);
                    isRefreshing = false;
                    return r.data.access;
                }).catch(e => {
                    isRefreshing = false;
                    localStorage.removeItem('access_token');
                    throw e;
                });
            }
            try {
                await refreshPromise;
                original.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
                return api(original);
            } catch (e) {
                return Promise.reject(e);
            }
        }
        return Promise.reject(err);
    }
);

export default api;
