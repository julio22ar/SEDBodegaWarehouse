
import API from '../utils/api.js';
import Alert from '../components/Alert.js';

class DashboardPage {
    constructor() {
        this.stats = {
            totalProducts: 0,
            lowStock: 0,
            totalCategories: 0
        };
        this.init();
    }

    async init() {
        // Verificar autenticación
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) {
            window.location.href = '/pages/login.html';
            return;
        }

        // Mostrar nombre de usuario
        document.getElementById('userName').textContent = user.name;

        // Cargar datos del dashboard
        await this.loadDashboardData();
        this.setupEventListeners();
    }

    async loadDashboardData() {
        try {
            // Cargar estadísticas básicas
            const stats = await API.get('/dashboard/stats');
            this.updateStats(stats.data);

            // Cargar productos con bajo stock
            const lowStock = await API.get('/products/low-stock');
            this.updateLowStockTable(lowStock.data);

            // Cargar actividad reciente
            const activity = await API.get('/dashboard/recent-activity');
            this.updateActivityFeed(activity.data);

        } catch (error) {
            Alert.error('Error al cargar los datos del dashboard');
            console.error('Error loading dashboard:', error);
        }
    }

    updateStats(stats) {
        // Actualizar las tarjetas de estadísticas
        const statsElements = {
            totalProducts: document.querySelector('[data-stat="total-products"]'),
            lowStock: document.querySelector('[data-stat="low-stock"]'),
            totalCategories: document.querySelector('[data-stat="total-categories"]')
        };

        for (const [key, element] of Object.entries(statsElements)) {
            if (element && stats[key] !== undefined) {
                element.textContent = stats[key].toLocaleString();
            }
        }
    }

    updateLowStockTable(products) {
        const tableBody = document.getElementById('lowStockTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = products.map(product => `
            <tr>
                <td>${product.name}</td>
                <td>${product.quantity}</td>
                <td>${product.minimum_stock}</td>
                <td>
                    <span class="status-badge ${this.getStockStatusClass(product)}">
                        ${this.getStockStatusText(product)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm" 
                            onclick="window.location.href='/pages/inventory.html?id=${product.id}'">
                        Ver Detalles
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateActivityFeed(activities) {
        const feedContainer = document.getElementById('activityFeed');
        if (!feedContainer) return;

        feedContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${this.getActivityIconClass(activity.type)}">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.description}</div>
                    <div class="activity-time">${this.formatDate(activity.created_at)}</div>
                </div>
            </div>
        `).join('');
    }

    getStockStatusClass(product) {
        const ratio = product.quantity / product.minimum_stock;
        if (ratio <= 0.5) return 'danger';
        if (ratio <= 0.75) return 'warning';
        return 'success';
    }

    getStockStatusText(product) {
        const ratio = product.quantity / product.minimum_stock;
        if (ratio <= 0.5) return 'Crítico';
        if (ratio <= 0.75) return 'Bajo';
        return 'Normal';
    }

    getActivityIconClass(type) {
        const icons = {
            'create': 'success',
            'update': 'warning',
            'delete': 'danger',
            'login': 'info'
        };
        return icons[type] || 'info';
    }

    getActivityIcon(type) {
        const icons = {
            'create': '➕',
            'update': '🔄',
            'delete': '❌',
            'login': '👤'
        };
        return icons[type] || '📝';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    setupEventListeners() {
        // Actualizar datos cada 5 minutos
        setInterval(() => this.loadDashboardData(), 5 * 60 * 1000);

        // Manejar filtros si existen
        const filterSelect = document.getElementById('timeFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => this.handleFilterChange());
        }
    }

    async handleFilterChange() {
        const filterSelect = document.getElementById('timeFilter');
        const timeRange = filterSelect.value;

        try {
            const stats = await API.get(`/dashboard/stats?timeRange=${timeRange}`);
            this.updateStats(stats.data);
        } catch (error) {
            Alert.error('Error al actualizar las estadísticas');
            console.error('Error updating stats:', error);
        }
    }

    // Métodos para exportar datos si se necesitan
    async exportDashboardData() {
        try {
            const response = await API.get('/dashboard/export');
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dashboard-report.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            Alert.error('Error al exportar los datos');
            console.error('Error exporting data:', error);
        }
    }
}

// Inicializar la página cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DashboardPage();
});

export default DashboardPage;