// scripts/pages/inventory.js
import PermissionsManager from '../utils/permissions.js';
import Alert from '../components/Alert.js';

class InventoryPage {
    constructor() {
        this.setupUI();
    }

    setupUI() {
        // Botón de Agregar Producto
        const addButton = document.getElementById('addProductBtn');
        if (addButton) {
            if (!PermissionsManager.hasPermission('CREATE_PRODUCT')) {
                addButton.style.display = 'none';
            }
        }

        // Configurar columnas de la tabla según permisos
        const columns = [
            { field: 'name', label: 'Nombre del Producto' },
            { field: 'category', label: 'Categoría' },
            { field: 'quantity', label: 'Cantidad' },
            { field: 'location', label: 'Ubicación' }
        ];

        // Solo mostrar ciertas columnas según el rol
        if (PermissionsManager.hasPermission('VIEW_MOVEMENTS')) {
            columns.push({ field: 'lastMovement', label: 'Último Movimiento' });
        }

        // Opciones avanzadas para admin y super_admin
        if (PermissionsManager.hasPermission('EDIT_PRODUCT')) {
            columns.push({ field: 'minStock', label: 'Stock Mínimo' });
            columns.push({ field: 'status', label: 'Estado' });
        }

        // Columna de acciones
        if (PermissionsManager.hasPermission('EDIT_PRODUCT') || 
            PermissionsManager.hasPermission('DELETE_PRODUCT')) {
            columns.push({ field: 'actions', label: 'Acciones' });
        }

        this.initializeTable(columns);
    }

    async handleAction(action, productId) {
        switch (action) {
            case 'edit':
                if (!PermissionsManager.hasPermission('EDIT_PRODUCT')) {
                    Alert.error('No tienes permisos para editar productos');
                    return;
                }
                this.openEditModal(productId);
                break;

            case 'delete':
                if (!PermissionsManager.hasPermission('DELETE_PRODUCT')) {
                    Alert.error('No tienes permisos para eliminar productos');
                    return;
                }
                this.confirmDelete(productId);
                break;

            case 'move':
                if (!PermissionsManager.hasPermission('CREATE_MOVEMENT')) {
                    Alert.error('No tienes permisos para realizar movimientos');
                    return;
                }
                this.openMoveModal(productId);
                break;
        }
    }

    async createMovement(data) {
        if (!PermissionsManager.hasPermission('CREATE_MOVEMENT')) {
            Alert.error('No tienes permisos para realizar esta acción');
            return;
        }

        try {
            const response = await API.post('/movements', data);
            if (response.success) {
                Alert.success('Movimiento registrado correctamente');
                // Si es usuario normal, requerir aprobación
                if (!PermissionsManager.hasPermission('APPROVE_MOVEMENT')) {
                    Alert.info('El movimiento está pendiente de aprobación');
                }
            }
        } catch (error) {
            Alert.error('Error al registrar el movimiento');
        }
    }
}