// scripts/utils/hashHelper.js
class HashHelper {
    // Función para crear un hash simple
    static hashPassword(password) {
        let hash = 0;
        const salt = "inventarioApp2024"; // Salt fijo para desarrollo
        const combinedString = password + salt;
        
        for (let i = 0; i < combinedString.length; i++) {
            const char = combinedString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32-bit integer
        }

        // Convertir a string y asegurar que sea positivo
        return Math.abs(hash).toString(16);
    }

    // Función para verificar la contraseña
    static verifyPassword(password, hashedPassword) {
        const hashedInput = this.hashPassword(password);
        return hashedInput === hashedPassword;
    }

    // Función para generar un salt aleatorio (si quieres añadir más seguridad)
    static generateSalt(length = 16) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let salt = '';
        for (let i = 0; i < length; i++) {
            salt += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return salt;
    }
}

export default HashHelper;