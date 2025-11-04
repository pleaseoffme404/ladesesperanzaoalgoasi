document.addEventListener('DOMContentLoaded', () => {
    
    const loginLink = document.getElementById('login-link');
    const cartBadge = document.getElementById('cart-badge');
    let isUserLoggedIn = false;
    let userType = null;
    let currentCart = [];

    async function initializeHeader() {
        await checkAuthStatus();
        if (isUserLoggedIn && userType === 'cliente') {
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

    function updateCartBadge() {
        const totalItems = currentCart.reduce((sum, item) => sum + item.cantidad, 0);
        if (totalItems > 0) {
            cartBadge.textContent = totalItems;
            cartBadge.classList.add('visible');
        } else {
            cartBadge.classList.remove('visible');
        }
    }

    initializeHeader();
});