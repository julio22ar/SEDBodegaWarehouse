// auth.js
const Auth = {
    // Almacenamiento temporal de usuarios (en producción esto estaría en la base de datos)
    users: [
        {
            id: 1,
            username: 'admin',
            password: 'hash_here', // En producción usar bcrypt o similar
            role: 'super_admin',
            name: 'Administrador Principal'
        }
    ],

    // Función de inicio de sesión
    login: function(username, password) {
        return new Promise((resolve, reject) => {
            // Simulando una llamada al servidor
            setTimeout(() => {
                const user = this.users.find(u => 
                    u.username === username && u.password === password
                );

                if (user) {
                    // En producción, usar JWT o sesiones seguras
                    sessionStorage.setItem('currentUser', JSON.stringify({
                        id: user.id,
                        username: user.username,
                        role: user.role,
                        name: user.name
                    }));
                    resolve(user);
                } else {
                    reject(new Error('Credenciales inválidas'));
                }
            }, 300);
        });
    },

    // Verificar si el usuario está autenticado
    isAuthenticated: function() {
        return sessionStorage.getItem('currentUser') !== null;
    },

    // Obtener el usuario actual
    getCurrentUser: function() {
        const userStr = sessionStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Verificar permisos
    hasPermission: function(requiredRole) {
        const user = this.getCurrentUser();
        if (!user) return false;

        const roleHierarchy = {
            'super_admin': 3,
            'admin': 2,
            'user': 1
        };

        return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    },

    // Cerrar sesión
    logout: function() {
        sessionStorage.removeItem('currentUser');
        window.location.href = '/login.html';
    }
};

// Middleware para proteger rutas
function requireAuth(requiredRole) {
    if (!Auth.isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }

    if (requiredRole && !Auth.hasPermission(requiredRole)) {
        window.location.href = '/unauthorized.html';
        return false;
    }

    return true;
}