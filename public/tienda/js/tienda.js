document.addEventListener('DOMContentLoaded', () => {

    const grid = document.getElementById('product-grid-container');
    const loginLink = document.getElementById('login-link');
    const cartBadge = document.getElementById('cart-badge');
    
    let isUserLoggedIn = false;
    let userType = null;
    let currentCart = [];

    async function initializeShop() {
        await checkAuthStatus();
        await loadProducts();
        
        if (isUserLoggedIn) {
            await loadCart();
        }
    }

    async function checkAuthStatus() {
        try {
            const data = await apiFetch('/api/auth/verificar', 'GET');
            if (data.success && data.autenticado) {
                isUserLoggedIn = true;
                userType = data.tipo;
                if (userType === 'cliente') {
                    loginLink.textContent = 'Mi Cuenta';
                    loginLink.href = '/cliente/dashboard/';
                } else if (userType === 'admin') {
                    loginLink.textContent = 'Admin Panel';
                    loginLink.href = '/admin/dashboard/';
                }
            }
        } catch (error) {
            console.error('Visitante no autenticado');
        }
    }

    async function loadCart() {
        try {
            const response = await apiFetch('/api/pedidos/carrito', 'GET');
            if (response.success) {
                currentCart = response.data;
                updateCartBadge();
            }
        } catch (error) {
            console.error('Error al cargar carrito:', error);
        }
    }

    function updateCartBadge() {
        const totalItems = currentCart.reduce((sum, item) => sum + item.cantidad, 0);
        if (totalItems > 0) {
            cartBadge.textContent = totalItems;
            cartBadge.classList.add('visible');
        } else {
            cartBadge.classList.remove('visible');
        }
    }

    async function loadProducts() {
        try {
            const response = await apiFetch('/api/productos', 'GET');
            grid.innerHTML = '';
            if (response.success) {
                response.data.forEach(product => {
                    grid.appendChild(createProductCard(product));
                });
            }
        } catch (error) {
            console.error('Error cargando productos:', error);
            grid.innerHTML = '<p>Error al cargar los productos. Intente de nuevo.</p>';
        }
    }

    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';

        const price = parseFloat(product.precio).toFixed(2);
        const imageUrl = product.imagen_url || '../assets/images/placeholder.jpg';

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${product.nombre}" class="product-image" onerror="this.src='../assets/images/placeholder.jpg'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.nombre}</h3>
                <p class="product-description">${product.descripcion || ''}</p>
                <div class="product-footer">
                    <span class="product-price">$${price}</span>
                    <button class="add-to-cart-btn" data-id="${product.id_producto}">Añadir al Carrito</button>
                </div>
            </div>
        `;

        card.querySelector('.add-to-cart-btn').addEventListener('click', handleAddToCart);
        return card;
    }

    async function handleAddToCart(event) {
        if (!isUserLoggedIn || userType !== 'cliente') {
            alert('Por favor, inicia sesión como cliente para añadir productos al carrito.');
            window.location.href = '/cliente/';
            return;
        }

        const button = event.target;
        const productId = button.getAttribute('data-id');
        
        button.disabled = true;
        button.textContent = 'Añadiendo...';

        try {
            const response = await apiFetch('/api/pedidos/carrito', 'POST', {
                id_producto: parseInt(productId, 10),
                cantidad: 1
            });
            
            if (response.success) {
                currentCart = response.data;
                updateCartBadge();
                button.textContent = 'Añadido ✓';
                setTimeout(() => {
                    button.disabled = false;
                    button.textContent = 'Añadir al Carrito';
                }, 2000);
            }
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            alert(error.message || 'No se pudo añadir el producto.');
            button.disabled = false;
            button.textContent = 'Añadir al Carrito';
        }
    }

    initializeShop();
});