import axios from 'axios';

/**
 * ============================================================================
 * GLOBAL API CONFIGURATION & AXIOS CLIENT
 * ============================================================================
 * Centralized API endpoint for ZenWA Frontend.
 * Render Backend URL: https://zenwa-polymer-crm.onrender.com
 * Local Override: Set NEXT_PUBLIC_API_URL=http://localhost:5000 in .env.local
 * ============================================================================
 */
export const API_BASE_URL = 
    process.env.NEXT_PUBLIC_API_URL || 'https://zenwa-polymer-crm.onrender.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

export default api;
