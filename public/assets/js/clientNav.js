document.addEventListener('DOMContentLoaded', () => {
    
    const header = document.querySelector('.client-header');
    if (!header) return;

    let isUserLoggedIn = false;
    let userType = null;
    let currentCart = [];
    let userData = null;

    async function initializeHeader() {
        try {
            const data = await apiFetch('/api/auth/verificar', 'GET');
            if (data.success && data.autenticado) {
                isUserLoggedIn = true;
                userType = data.tipo;
                userData = data.usuario;
                
                if (userType === 'cliente') {
                    await loadCart();
                    await loadProfileData();
                }
            } else {
                handleNotAuthenticated();
            }
            renderHeader();
        } catch (error) {
            console.log('Visitante no autenticado.');
            handleNotAuthenticated();
            renderHeader();
        }
    }

    async function loadProfileData() {
        try {
            const data = await apiFetch('/api/clientes/perfil', 'GET');
            if (data.success) {
                userData = data.data;
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
        }
    }

    function renderHeader() {
        let navHtml = `
            <a href="/" class="header-logo">La Desesperanza</a>
            <nav class="client-nav">
                <a href="/">Inicio</a>
                <a href="/tienda/">Tienda</a>
        `;

        if (isUserLoggedIn && userType === 'cliente') {
            navHtml += `
                <a href="/cliente/cuenta/?view=pedidos">Mis Pedidos</a>
                <a href="/cliente/cuenta/?view=favoritos">Favoritos</a>
                
                <a href="/cliente/carrito/" class="cart-icon" id="cart-link">
                    <svg class="cart-icon-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.656-.414 1.243-1.067 1.243H4.51c-.653 0-1.137-.587-1.067-1.243L4.707 8.507c.072-.656.596-1.144 1.253-1.144h.211a.75.75 0 0 1 .75.75v.003a.75.75 0 0 1-.75.75H5.961l-.91 8.107h13.916l-.91-8.107h-.211a.75.75 0 0 1-.75-.75v-.003a.75.75 0 0 1 .75.75h.211c.657 0 1.18.487 1.253 1.144Z" />
                    </svg>
                    <span class="cart-badge" id="cart-badge">0</span>
                </a>
                
                <div class="profile-menu">
                    <img src="${userData.imagen_perfil_url || '/assets/images/perfil/default-avatar.png'}" alt="Foto de perfil" class="profile-pic" id="profile-pic-btn">
                    <div class="profile-dropdown" id="profile-dropdown">
                        <div class="dropdown-header">
                            <p>${userData.nombre}</p>
                            <span>${userData.email}</span>
                        </div>
                        <a href="/cliente/cuenta/?view=perfil" class="dropdown-item">Mi Perfil</a>
                        <a href="/cliente/cuenta/?view=pedidos" class="dropdown-item">Mis Pedidos</a>
                        <a href="#" class="dropdown-item logout" id="logout-button">Cerrar Sesión</a>
                    </div>
                </div>
            `;
        } else if (isUserLoggedIn && userType === 'admin') {
            navHtml += `<a href="/admin/dashboard/">Panel Admin</a>`;
        } else {
            navHtml += `<a href="/cliente/" id="login-link">Iniciar Sesión</a>`;
        }

        navHtml += `
                <div id="client-theme-switcher" class="theme-switcher" title="Cambiar Tema">
                    <label class="switch" title="Cambiar Tema">
                        <input type="checkbox" id="client-theme-checkbox">
                        <span class="slider"></span>
                    </label>
                </div>
            </nav>
        `;
        
        header.innerHTML = navHtml;
        setupHeaderListeners();
    }

    function setupHeaderListeners() {
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await apiFetch('/api/auth/logout', 'POST');
                    window.location.href = '/cliente/';
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                }
            });
        }
        
        const profilePicBtn = document.getElementById('profile-pic-btn');
        const profileDropdown = document.getElementById('profile-dropdown');
        if (profilePicBtn) {
            profilePicBtn.addEventListener('click', () => {
                profileDropdown.classList.toggle('visible');
            });
            
            document.addEventListener('click', (e) => {
                if (!profilePicBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                    profileDropdown.classList.remove('visible');
                }
            });
        }

        const cartBadge = document.getElementById('cart-badge');
        if (cartBadge) {
            updateCartBadge();
        }
    }

    function handleNotAuthenticated() {
        const pathname = window.location.pathname;

        const isPublicClientPage = 
            pathname === '/cliente/' || 
            pathname === '/cliente/index.html' ||
            pathname.startsWith('/cliente/recuperar-password') ||
            pathname.startsWith('/cliente/reset-password');

        const isProtectedPage = pathname.startsWith('/cliente/') && !isPublicClientPage;

        if (isProtectedPage) {
            window.location.href = '/cliente/';
        }
    }

    async function loadCart() {
        try {
            const response = await apiFetch('/api/pedidos/carrito', 'GET');
            if (response.success) {
                currentCart = response.data;
            }
        } catch (error) {
        }
    }

    function updateCartBadge() {
        const cartBadge = document.getElementById('cart-badge');
        const totalItems = currentCart.reduce((sum, item) => sum + item.cantidad, 0);
        if (cartBadge) {
            if (totalItems > 0) {
                cartBadge.textContent = totalItems;
                cartBadge.classList.add('visible');
            } else {
                cartBadge.classList.remove('visible');
            }
        }
    }

    initializeHeader();
});