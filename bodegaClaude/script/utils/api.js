// scripts/utils/api.js
const API = {
    baseURL: 'http://localhost:3000',
    
    async fetchAPI(endpoint, options = {}) {
        const user = JSON.parse(sessionStorage.getItem('user'));
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': user ? `Bearer ${sessionStorage.getItem('token')}` : ''
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Métodos específicos
    async post(endpoint, data) {
        return this.fetchAPI(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async get(endpoint) {
        return this.fetchAPI(endpoint);
    },

    async put(endpoint, data) {
        return this.fetchAPI(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(endpoint) {
        return this.fetchAPI(endpoint, {
            method: 'DELETE'
        });
    }
};

export default API;