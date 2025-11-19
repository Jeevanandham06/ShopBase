// Sample data for the application
const sampleProducts = [
    { id: 1, name: "Wireless Earbuds Pro", category: "electronics", price: 1999, stock: 5, status: "active" },
    { id: 2, name: "Smart Fitness Watch", category: "wearables", price: 12999, stock: 0, status: "out-of-stock" },
    { id: 3, name: "Phone Case - Blue", category: "accessories", price: 199, stock: 3, status: "active" },
    { id: 4, name: "Bluetooth Speaker", category: "electronics", price: 14999, stock: 42, status: "active" },
    { id: 5, name: "USB-C Charging Cable", category: "accessories", price: 1499, stock: 7, status: "active" },
    { id: 6, name: "Wireless Mouse", category: "electronics", price: 899, stock: 15, status: "active" },
    { id: 7, name: "Laptop Stand", category: "accessories", price: 2499, stock: 8, status: "active" },
    { id: 8, name: "Noise Cancelling Headphones", category: "electronics", price: 8999, stock: 0, status: "out-of-stock" }
];

const sampleOrders = [
    { id: "ORD-2456", customer: "John Doe", date: "2023-10-15", amount: 3498, status: "pending" },
    { id: "ORD-2455", customer: "Jane Smith", date: "2023-10-14", amount: 12999, status: "shipped" },
    { id: "ORD-2454", customer: "Bob Johnson", date: "2023-10-13", amount: 16998, status: "delivered" },
    { id: "ORD-2453", customer: "Alice Brown", date: "2023-10-12", amount: 199, status: "cancelled" },
    { id: "ORD-2452", customer: "Charlie Wilson", date: "2023-10-11", amount: 8999, status: "delivered" }
];

// Application state
let currentPage = 'dashboard';
let products = JSON.parse(localStorage.getItem('products')) || sampleProducts;
let currentProductId = null;
let currentPageNumber = 1;
const productsPerPage = 5;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set current date
    document.getElementById('current-date').textContent = new Date().toLocaleDateString();
    
    // Initialize navigation
    setupNavigation();
    
    // Initialize modals
    setupModals();
    
    // Load initial data
    loadProductsTable();
    loadOrdersTable();
    loadAnalytics();
    
    // Set up event listeners
    setupEventListeners();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            switchPage(page);
        });
    });
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            alert('Logged out successfully!');
            // In a real app, you would redirect to login page
        }
    });
}

function switchPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected page and activate nav link
    document.getElementById(`${page}-page`).classList.add('active');
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    currentPage = page;
    
    // Refresh page-specific content
    if (page === 'products') {
        loadProductsTable();
    } else if (page === 'orders') {
        loadOrdersTable();
    } else if (page === 'analytics') {
        loadAnalytics();
    }
}

function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal, #confirm-cancel');
    
    // Close modal when clicking X or cancel button
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Product form submission
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
}

function setupEventListeners() {
    // Add product buttons
    document.getElementById('add-product-btn').addEventListener('click', function() {
        openProductModal();
    });
    
    document.getElementById('add-new-product').addEventListener('click', function() {
        openProductModal();
    });
    
    // Product search and filters
    document.getElementById('product-search').addEventListener('input', function() {
        loadProductsTable();
    });
    
    document.getElementById('category-filter').addEventListener('change', function() {
        loadProductsTable();
    });
    
    document.getElementById('status-filter').addEventListener('change', function() {
        loadProductsTable();
    });
    
    // Order filter
    document.getElementById('order-status-filter').addEventListener('change', function() {
        loadOrdersTable();
    });
    
    // Analytics period
    document.getElementById('analytics-period').addEventListener('change', function() {
        loadAnalytics();
    });
    
    // Pagination
    document.getElementById('prev-page').addEventListener('click', function() {
        if (currentPageNumber > 1) {
            currentPageNumber--;
            loadProductsTable();
        }
    });
    
    document.getElementById('next-page').addEventListener('click', function() {
        const totalPages = Math.ceil(getFilteredProducts().length / productsPerPage);
        if (currentPageNumber < totalPages) {
            currentPageNumber++;
            loadProductsTable();
        }
    });
}

function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    if (productId) {
        // Edit mode
        title.textContent = 'Edit Product';
        currentProductId = productId;
        const product = products.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-description').value = product.description || '';
        }
    } else {
        // Add mode
        title.textContent = 'Add New Product';
        currentProductId = null;
        form.reset();
    }
    
    modal.style.display = 'block';
}

function saveProduct() {
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = parseInt(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const description = document.getElementById('product-description').value;
    
    if (currentProductId) {
        // Update existing product
        const index = products.findIndex(p => p.id === currentProductId);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                name,
                category,
                price,
                stock,
                description,
                status: stock > 0 ? 'active' : 'out-of-stock'
            };
        }
    } else {
        // Add new product
        const newId = Math.max(...products.map(p => p.id)) + 1;
        products.push({
            id: newId,
            name,
            category,
            price,
            stock,
            description,
            status: stock > 0 ? 'active' : 'out-of-stock'
        });
    }
    
    // Save to localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Close modal and refresh tables
    document.getElementById('product-modal').style.display = 'none';
    loadProductsTable();
    
    // If we're on dashboard, refresh the product overview
    if (currentPage === 'dashboard') {
        // In a real app, you might refresh dashboard data here
    }
    
    alert('Product saved successfully!');
}

function deleteProduct(productId) {
    const modal = document.getElementById('confirm-modal');
    const message = document.getElementById('confirm-message');
    const product = products.find(p => p.id === productId);
    
    message.textContent = `Are you sure you want to delete "${product.name}"?`;
    modal.style.display = 'block';
}
    //