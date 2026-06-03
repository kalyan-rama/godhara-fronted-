const API_URL = (import.meta as any).env?.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'godhara-backend-production.up.railway.app');
export default API_URL;
