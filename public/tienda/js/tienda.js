document.addEventListener('DOMContentLoaded', () => {

    const grid = document.getElementById('product-grid-container');
    const loginLink = document.getElementById('login-link');
    const cartBadge = document.getElementById('cart-badge');
    
    let isUserLoggedIn = false;
    let userType = null;
    let currentCart = [];
    let currentFavorites = [];

    async function initializeShop() {
        await checkAuthStatus();
        
        if (isUserLoggedIn && userType === 'cliente') {
            await Promise.all([
                loadCart(),
                loadFavorites()
            ]);
        }
        
        await loadProducts();
    }

    async function checkAuthStatus() {
        try {
            const data = await apiFetch('/api/auth/verificar', 'GET');
            if (data.success && data.autenticado) {
                isUserLoggedIn = true;
                userType = data.tipo;
            }
        } catch (error) {
            console.log('Visitante no autenticado');
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
    
    async function loadFavorites() {
        try {
            const response = await apiFetch('/api/favoritos', 'GET');
            if (response.success) {
                currentFavorites = response.data.map(fav => fav.id_producto);
            }
        } catch (error) {
            console.error('Error al cargar favoritos:', error);
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
            
            if (!response.success || response.data.length === 0) {
                grid.innerHTML = '<p>No hay productos disponibles por el momento.</p>';
                return;
            }
            
            response.data.forEach(product => {
                grid.appendChild(createProductCard(product));
            });
            
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

        let favoriteButtonHtml = '';
        if (isUserLoggedIn && userType === 'cliente') {
            const isFavorited = currentFavorites.includes(product.id_producto);
            const checked = isFavorited ? 'checked="checked"' : '';
            favoriteButtonHtml = `
                <div class="fav-container">
                    <input type="checkbox" ${checked} id="favorite-${product.id_producto}" data-id="${product.id_producto}" class="favorite-checkbox" value="favorite-button">
                    <label for="favorite-${product.id_producto}" class="favorite-label">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <div class="action">
                            <span class="option-1"></span>
                            <span class="option-2"></span>
                        </div>
                    </label>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${product.nombre}" class="product-image" onerror="this.src='../assets/images/placeholder.jpg'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.nombre}</h3>
                <p class="product-description">${product.descripcion || ''}</p>
                <div class="product-footer">
                    <span class="product-price">$${price}</span>
                    <div class="product-actions-row">
                        <div class="quantity-selector">
                            <button class="quantity-btn" data-action="decrease">-</button>
                            <input class="quantity-input" type="number" value="1" min="1" max="99">
                            <button class="quantity-btn" data-action="increase">+</button>
                        </div>
                        ${favoriteButtonHtml}
                    </div>
                    <button class="add-to-cart-btn" data-id="${product.id_producto}">Agregar al Carrito</button>
                </div>
            </div>
        `;

        const qtyInput = card.querySelector('.quantity-input');
        card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => handleAddToCart(e, qtyInput));
        
        card.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                let currentValue = parseInt(qtyInput.value, 10);
                if (action === 'increase') {
                    currentValue++;
                } else if (action === 'decrease' && currentValue > 1) {
                    currentValue--;
                }
                qtyInput.value = currentValue;
            });
        });

        const favCheckbox = card.querySelector('.favorite-checkbox');
        if (favCheckbox) {
            favCheckbox.addEventListener('change', handleFavoriteToggle);
        }

        return card;
    }

    async function handleFavoriteToggle(event) {
        const checkbox = event.target;
        const productId = checkbox.getAttribute('data-id');
        const isChecked = checkbox.checked;

        try {
            if (isChecked) {
                await apiFetch('/api/favoritos', 'POST', { id_producto: productId });
                currentFavorites.push(parseInt(productId, 10));
            } else {
                await apiFetch(`/api/favoritos/${productId}`, 'DELETE');
                currentFavorites = currentFavorites.filter(id => id !== parseInt(productId, 10));
            }
        } catch (error) {
            console.error('Error actualizando favorito:', error);
            checkbox.checked = !isChecked;
        }
    }

    async function handleAddToCart(event, quantityInput) {
        if (!isUserLoggedIn || userType !== 'cliente') {
            alert('Por favor, inicia sesión como cliente para añadir productos al carrito.');
            window.location.href = '/cliente/';
            return;
        }

        const button = event.target;
        const productId = button.getAttribute('data-id');
        const quantity = parseInt(quantityInput.value, 10);
        
        if (quantity <= 0) {
            alert('Seleccione una cantidad válida.');
            return;
        }

        button.disabled = true;
        button.textContent = 'Añadiendo...';

        try {
            const response = await apiFetch('/api/pedidos/carrito', 'POST', {
                id_producto: parseInt(productId, 10),
                cantidad: quantity
            });
            
            if (response.success) {
                currentCart = response.data;
                updateCartBadge();
                button.textContent = 'Añadido ✓';
                setTimeout(() => {
                    button.disabled = false;
                    button.textContent = 'Agregar al Carrito';
                }, 2000);
            }
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            alert(error.message || 'No se pudo añadir el producto.');
            button.disabled = false;
            button.textContent = 'Agregar al Carrito';
        }
    }

    initializeShop();
});