import axios from 'axios';

// Unified API Service for TicketX Pro Independent Architecture
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Handlers
export const login = (data: any) => api.post('/auth/login', data);
export const register = (data: any) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');

// Inventory Handlers
export const getEvents = (category?: string, city?: string) => 
  api.get('/events', { params: { category, city } });

// Booking Handlers
export const createBooking = (data: any) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my');

// Payment Simulation & Integration
export const verifyPayment = (data: any) => api.post('/pay/verify', data);
export const createPaymentIntent = (bookingId: string) => api.post('/pay/create-intent', { bookingId });

// Notification Handler
export const getNotifications = () => api.get('/notifications');

export default api;
