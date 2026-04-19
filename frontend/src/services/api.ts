import axios from 'axios';

const API = axios.create({
    baseURL: (import.meta as any).env.VITE_API_URL || '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('jp_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth
export const register = (data: object) => API.post('/auth/register', data);
export const login = (data: object) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Jobs
export const getJobs = (params?: object) => API.get('/jobs', { params });
export const getJob = (id: string) => API.get(`/jobs/${id}`);
export const createJob = (data: object) => API.post('/jobs', data);
export const updateJob = (id: string, data: object) => API.put(`/jobs/${id}`, data);
export const deleteJob = (id: string) => API.delete(`/jobs/${id}`);
export const getMyJobs = () => API.get('/jobs/employer/my-jobs');

// Applications
export const applyToJob = (jobId: string, data: object) => API.post(`/applications/${jobId}`, data);
export const getMyApplications = () => API.get('/applications/my');
export const getJobApplications = (jobId: string) => API.get(`/applications/job/${jobId}`);
export const updateApplicationStatus = (id: string, data: object) => API.put(`/applications/${id}/status`, data);

// Users
export const updateProfile = (data: object) => API.put('/users/profile', data);
export const saveJob = (jobId: string) => API.post(`/users/save-job/${jobId}`);
export const getSavedJobs = () => API.get('/users/saved-jobs');

// Admin
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = () => API.get('/admin/users');
export const getAdminJobs = () => API.get('/admin/jobs');
export const deleteUser = (id: string) => API.delete(`/admin/users/${id}`);
export const deleteAdminJob = (id: string) => API.delete(`/admin/jobs/${id}`);

export default API;
