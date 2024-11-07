// scripts/pages/login.js
import Validator from '../utils/validators.js';
import Auth from '../auth.js';
import { ROUTES } from '../utils/constants.js';

class LoginPage {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.setupEventListeners();
        
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        const username = document.getElementById('username');
        const password = document.getElementById('password');

        username.addEventListener('input', () => {
            this.validateField(username, 'username');
        });

        password.addEventListener('input', () => {
            this.validateField(password, 'password');
        });
    }

    validateField(field, fieldName) {
        const error = document.getElementById(`${fieldName}-error`);
        error.textContent = '';
        field.classList.remove('invalid');

        if (!field.value.trim()) {
            error.textContent = 'Este campo es requerido';
            field.classList.add('invalid');
            return false;
        }

        if (fieldName === 'username') {
            if (!Validator.username(field.value)) {
                error.textContent = 'Usuario inválido';
                field.classList.add('invalid');
                return false;
            }
        }

        if (fieldName === 'password') {
            if (!Validator.password(field.value)) {
                error.textContent = 'La contraseña debe tener al menos 6 caracteres';
                field.classList.add('invalid');
                return false;
            }
        }

        return true;
    }

    validateForm() {
        const username = document.getElementById('username');
        const password = document.getElementById('password');

        const isUsernameValid = this.validateField(username, 'username');
        const isPasswordValid = this.validateField(password, 'password');

        return isUsernameValid && isPasswordValid;
    }

    clearErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.textContent = '');
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.form.insertBefore(errorDiv, this.form.firstChild);
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        this.clearErrors();

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.form.username.value,
                    password: this.form.password.value
                })
            });

            const data = await response.json();

            if (data.success) {
                Auth.login(data.data); // Usar el método de Auth para guardar los datos
                
                // Redirigir según el rol
                if (data.data.user.role === 'super_admin') {
                    window.location.href = '/pages/index.html';
                } else {
                    window.location.href = '/pages/inventory.html';
                }
            } else {
                this.showError(data.error || 'Error al iniciar sesión');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('Error de conexión al servidor');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
});

export default LoginPage;