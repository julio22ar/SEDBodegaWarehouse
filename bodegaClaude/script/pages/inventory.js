// scripts/pages/inventory.js
import Table from '../components/Table.js';
import Modal from '../components/Modal.js';
import Form from '../components/Form.js';
import API from '../utils/api.js';

class InventoryPage {
    constructor() {
        this.table = null;
        this.modal = null;
        this.setupComponents();
        this.loadProducts();
    }

    setupComponents() {
        // Configurar tabla
        this.table = new Table({
            columns: [
                { field: 'id', label: 'ID', width: '80px' },
                { field: 'name', label: 'Nombre del Producto' },
                { field: 'category', label: 'Categoría' },
                { field: 'quantity', label: 'Cantidad', type: 'status' },
                { field: 'location', label: 'Ubicación' },
                { field: 'lastUpdated', label: 'Última Actualización', 
                  formatter: (value) => new Date(value).toLocaleDateString() },
                { type: 'actions', label: 'Acciones', width: '150px' }
            ],
            onEdit: (item) => this.openEditModal(item),
            onDelete: (item) => this.deleteProduct(item),
            itemsPerPage: 10
        });

        // Configurar modal
        this.modal = new Modal({
            title: 'Agregar Producto',
            onClose: () => this.resetForm()
        });

        // Configurar eventos
        document.getElementById('addProductBtn').addEventListener(
            'click', 
            () => this.openAddModal()
        );

        document.getElementById('searchInput').addEventListener(
            'input', 
            (e) => this.handleSearch(e.target.value)
        );

        // Renderizar tabla
        const tableContainer = document.getElementById('productsTable');
        tableContainer.appendChild(this.table.render());
    }

    async loadProducts() {
        try {
            const response = await API.get('/products');
            if (response.success) {
                this.table.setData(response.data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            // Aquí podrías mostrar un mensaje de error al usuario
        }
    }

    getProductForm(data = {}) {
        return new Form({
            fields: [
                {
                    id: 'productName',
                    name: 'name',
                    label: 'Nombre del Producto',
                    type: 'text',
                    value: data.name || '',
                    validations: [
                        { type: 'required', message: 'El nombre es requerido' }
                    ]
                },
                {
                    id: 'productCategory',
                    name: 'category',
                    label: 'Categoría',
                    type: 'select',
                    options: [
                        { value: 'electronics', label: 'Electrónicos' },
                        { value: 'furniture', label: 'Muebles' },
                        { value: 'clothing', label: 'Ropa' }
                    ],
                    value: data.category || ''
                },
                {
                    id: 'productQuantity',
                    name: 'quantity',
                    label: 'Cantidad',
                    type: 'number',
                    value: data.quantity || '',
                    validations: [
                        { type: 'required', message: 'La cantidad es requerida' },
                        { type: 'numeric', message: 'Debe ser un número válido' }
                    ]
                },
                {
                    id: 'productLocation',
                    name: 'location',
                    label: 'Ubicación',
                    type: 'text',
                    value: data.location || ''
                }
            ],
            submitText: data.id ? 'Actualizar' : 'Agregar',
            onSubmit: async (formData) => {
                if (data.id) {
                    await this.updateProduct(data.id, formData);
                } else {
                    await this.createProduct(formData);
                }
            }
        });
    }

    openAddModal() {
        this.modal.setTitle('Agr