const API_URL = (import.meta as any).env?.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://godhara-backend.onrender.com');
export default API_URL;
