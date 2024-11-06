// scripts/utils/api.js
const API = {
    baseURL: 'http://localhost:3000',
    
    // Método genérico para hacer peticiones
    async fetchAPI(endpoint, options = {}) {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            // En producción, aquí iría el token JWT
            'Authorization': user ? `Bearer ${user.token}` : ''
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Métodos específicos para cada tipo de petición
    get(endpoint) {
        return this.fetchAPI(endpoint, { method: 'GET' });
    },

    post(endpoint, data) {
        return this.fetchAPI(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put(endpoint, data) {
        return this.fetchAPI(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete(endpoint) {
        return this.fetchAPI(endpoint, { method: 'DELETE' });
    }
};

export default API;