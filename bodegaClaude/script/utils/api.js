// scripts/utils/api.js
const API = {
    baseURL: 'http://localhost:3000',
    
    async fetchAPI(endpoint, options = {}) {
        try {
            const token = sessionStorage.getItem('token');
            
            const defaultHeaders = {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            };

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                }
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Error en la petición');
            }

            return data.data; // Retornamos directamente data.data
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Métodos específicos para cada entidad
    auth: {
        login: (credentials) => API.fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
    },

    products: {
        getAll: () => API.fetchAPI('/products'),
        getLowStock: () => API.fetchAPI('/products/low-stock'),
        create: (product) => API.fetchAPI('/products', {
            method: 'POST',
            body: JSON.stringify(product)
        }),
        update: (id, product) => API.fetchAPI(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product)
        }),
        delete: (id) => API.fetchAPI(`/products/${id}`, {
            method: 'DELETE'
        })
    },

    categories: {
        getAll: () => API.fetchAPI('/categories')
    },

    dashboard: {
        getStats: () => API.fetchAPI('/dashboard/stats'),
        getRecentActivity: () => API.fetchAPI('/dashboard/recent-activity')
    }
};

export default API;