document.addEventListener('DOMContentLoaded', () => {

    const tabs = document.querySelectorAll('.cuenta-tab');
    const views = document.querySelectorAll('.cuenta-view');

    const ticketModal = document.getElementById('ticket-modal');
    const ticketCloseBtn = document.getElementById('ticket-close-button');
    const ticketArea = document.getElementById('ticket-printable-area');

    function switchView(viewId) {
        views.forEach(view => {
            view.classList.remove('active');
        });
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        document.getElementById(viewId).classList.add('active');
        document.querySelector(`.cuenta-tab[data-view="${viewId}"]`).classList.add('active');
        
        window.history.pushState(null, '', `?view=${viewId.replace('view-', '')}`);
        
        if (viewId === 'view-pedidos') loadMisPedidos();
        if (viewId === 'view-perfil') loadProfile();
        if (viewId === 'view-favoritos') loadFavoritos();
        if (viewId === 'view-fondos') loadProfile();
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const viewId = e.target.getAttribute('data-view');
            switchView(viewId);
        });
    });

    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const fondosForm = document.getElementById('fondos-form');
    
    const usuarioInput = document.getElementById('usuario');
    const emailInput = document.getElementById('email');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const telefonoInput = document.getElementById('telefono');
    const direccionInput = document.getElementById('direccion');
    const profilePicPreview = document.getElementById('profile-pic-preview');
    const profilePicInput = document.getElementById('imagen_perfil');
    const profilePicUrlActual = document.getElementById('imagen_perfil_url_actual');
    
    const saldoDisplay = document.getElementById('saldo-display');
    const montoInput = document.getElementById('monto-recarga');
    
    const saveProfileButton = document.getElementById('save-profile-button');
    const savePasswordButton = document.getElementById('save-password-button');
    const btnRecargar = document.getElementById('btn-recargar');
    
    const profileMessage = document.getElementById('profile-message');
    const passwordMessage = document.getElementById('password-message');
    const fondosMessage = document.getElementById('fondos-message');

    async function loadProfile() {
        try {
            const response = await apiFetch('/api/clientes/perfil', 'GET');
            if (response.success) {
                const user = response.data;
                if (usuarioInput) usuarioInput.value = user.usuario;
                if (emailInput) emailInput.value = user.email;
                if (nombreInput) nombreInput.value = user.nombre;
                if (apellidoInput) apellidoInput.value = user.apellido;
                if (telefonoInput) telefonoInput.value = user.telefono || '';
                if (direccionInput) direccionInput.value = user.direccion || '';
                if (profilePicPreview) profilePicPreview.src = user.imagen_perfil_url || '/assets/images/perfil/default-avatar.png';
                if (profilePicUrlActual) profilePicUrlActual.value = user.imagen_perfil_url || '';
                
                if (saldoDisplay) {
                    saldoDisplay.textContent = parseFloat(user.saldo || 0).toFixed(2);
                }
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
            if (error.status === 401) window.location.href = '/cliente/';
        }
    }
    
    if (profilePicInput) {
        profilePicInput.addEventListener('change', () => {
            const file = profilePicInput.files[0];
            if (file) {
                profilePicPreview.src = URL.createObjectURL(file);
            }
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const v1 = window.validateInput(emailInput, window.validationRegex.email, 'Email inválido.');
            const v2 = window.validateInput(nombreInput, window.validationRegex.name, 'Nombre inválido.');
            const v3 = window.validateInput(apellidoInput, window.validationRegex.name, 'Apellido inválido.');
            const v4 = window.validateInput(telefonoInput, window.validationRegex.phone, 'Deben ser 10 dígitos.', true);
            if (!v1 || !v2 || !v3 || !v4) return;
            
            saveProfileButton.disabled = true;
            saveProfileButton.textContent = 'Guardando...';
            profileMessage.textContent = '';
            profileMessage.className = 'form-message';

            const formData = new FormData();
            formData.append('email', emailInput.value);
            formData.append('nombre', nombreInput.value);
            formData.append('apellido', apellidoInput.value);
            formData.append('telefono', telefonoInput.value);
            formData.append('direccion', direccionInput.value);
            formData.append('imagen_perfil_url_actual', profilePicUrlActual.value);
            
            if (profilePicInput.files[0]) {
                formData.append('imagen_perfil', profilePicInput.files[0]);
            }

            try {
                const response = await fetch('/api/clientes/perfil', {
                    method: 'PUT',
                    body: formData,
                    credentials: 'include'
                });
                const data = await response.json();
                if (!response.ok) throw data;

                if (data.success) {
                    profileMessage.textContent = '¡Perfil actualizado con éxito!';
                    profileMessage.className = 'form-message success';
                    if (data.nuevaImagenUrl) {
                        profilePicUrlActual.value = data.nuevaImagenUrl;
                        const navProfilePic = document.getElementById('profile-pic-btn');
                        if(navProfilePic) navProfilePic.src = data.nuevaImagenUrl;
                    }
                }
            } catch (error) {
                profileMessage.textContent = error.message || 'Error al actualizar.';
                profileMessage.className = 'form-message error';
            } finally {
                saveProfileButton.disabled = false;
                saveProfileButton.textContent = 'Guardar Cambios';
            }
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const v1 = window.validateInput(document.getElementById('oldPassword'), window.validationRegex.text, 'Campo obligatorio.');
            const v2 = window.validateInput(document.getElementById('newPassword'), window.validationRegex.password, 'Mínimo 8 caracteres.');
            if (!v1 || !v2) return;
            
            savePasswordButton.disabled = true;
            savePasswordButton.textContent = 'Actualizando...';
            passwordMessage.textContent = '';
            passwordMessage.className = 'form-message';

            const data = {
                oldPassword: document.getElementById('oldPassword').value,
                newPassword: document.getElementById('newPassword').value
            };

            try {
                const response = await apiFetch('/api/clientes/cambiar-password', 'POST', data);
                if (response.success) {
                    passwordMessage.textContent = '¡Contraseña actualizada con éxito!';
                    passwordMessage.className = 'form-message success';
                    passwordForm.reset();
                }
            } catch (error) {
                passwordMessage.textContent = error.message || 'Error al cambiar la contraseña.';
                passwordMessage.className = 'form-message error';
            } finally {
                savePasswordButton.disabled = false;
                savePasswordButton.textContent = 'Actualizar Contraseña';
            }
        });
    }

    if (fondosForm) {
        fondosForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            btnRecargar.disabled = true;
            btnRecargar.textContent = 'Procesando...';
            fondosMessage.textContent = '';
            fondosMessage.className = 'form-message';

            const monto = parseFloat(montoInput.value);
            try {
                const response = await apiFetch('/api/clientes/fondos', 'POST', { cantidad: monto });
                if (response.success) {
                    fondosMessage.textContent = response.message;
                    fondosMessage.className = 'form-message success';
                    montoInput.value = '';
                    loadProfile();
                }
            } catch (error) {
                fondosMessage.textContent = error.message;
                fondosMessage.className = 'form-message error';
            } finally {
                btnRecargar.disabled = false;
                btnRecargar.textContent = 'Recargar Ahora';
            }
        });
    }

    async function loadMisPedidos() {
        const ordersContainer = document.getElementById('orders-list-container');
        const noOrdersMessage = document.getElementById('no-orders-message');
        
        try {
            const response = await apiFetch('/api/pedidos/mis-pedidos', 'GET');
            ordersContainer.innerHTML = '';
            
            if (response.success && response.data.length > 0) {
                noOrdersMessage.style.display = 'none';
                response.data.forEach(order => {
                    const orderElement = document.createElement('div');
                    orderElement.className = 'order-item';
                    const fecha = new Date(order.fecha_pedido).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });
                    const total = parseFloat(order.total).toFixed(2);
                    const statusClass = order.estado.toLowerCase().replace(' ', '-');

                    orderElement.innerHTML = `
                        <div class="order-header">
                            <h3>Pedido #${order.id_pedido}</h3>
                            <span class="status-badge status-${statusClass}">${order.estado}</span>
                        </div>
                        <div class="order-details">
                            <span><strong>Fecha:</strong> ${fecha}</span>
                            <span><strong>Total:</strong> $${total}</span>
                        </div>
                        <div style="margin-top: 10px;">
                            <button class="order-details-toggle" data-id="${order.id_pedido}">Ver Detalles</button>
                            <button class="order-ticket-btn action-button" data-id="${order.id_pedido}" style="background-color: #333; color: white; border:none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; margin-left: 10px;">📄 Ver Ticket</button>
                        </div>
                        <div class="order-details-content" id="details-${order.id_pedido}"></div>
                    `;
                    ordersContainer.appendChild(orderElement);
                });
            } else {
                noOrdersMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error cargando pedidos:', error);
            noOrdersMessage.textContent = 'Error al cargar pedidos.';
            noOrdersMessage.style.display = 'block';
        }
    }

    const ordersList = document.getElementById('orders-list-container');
    if(ordersList) {
        ordersList.addEventListener('click', (e) => {
            if (e.target.classList.contains('order-details-toggle')) {
                handleShowDetails(e.target);
            } else if (e.target.classList.contains('order-ticket-btn')) {
                handleViewTicket(e.target);
            }
        });
    }

    async function handleShowDetails(button) {
        const id = button.getAttribute('data-id');
        const detailsContainer = document.getElementById(`details-${id}`);

        if (detailsContainer.classList.contains('visible')) {
            detailsContainer.classList.remove('visible');
            detailsContainer.style.display = 'none';
            button.textContent = 'Ver Detalles';
            return;
        }

        button.textContent = 'Cargando...';
        button.disabled = true;

        try {
            const response = await apiFetch(`/api/pedidos/${id}`, 'GET');
            if (response.success) {
                let html = '<h4>Productos:</h4>';
                response.data.detalles.forEach(item => {
                    const sub = parseFloat(item.precio_unitario) * item.cantidad;
                    html += `<p>(${item.cantidad}x) <span>${item.nombre}</span> - $${sub.toFixed(2)}</p>`;
                });
                detailsContainer.innerHTML = html;
                detailsContainer.classList.add('visible');
                detailsContainer.style.display = 'block';
                button.textContent = 'Ocultar Detalles';
            }
        } catch (error) {
            console.error('Error cargando detalles:', error);
        } finally {
            button.disabled = false;
        }
    }

    async function handleViewTicket(button) {
        const id = button.getAttribute('data-id');
        button.textContent = 'Generando...';
        button.disabled = true;

        try {
            const response = await apiFetch(`/api/pedidos/${id}`, 'GET');
            if (response.success) {
                generateTicketHTML(response.data);
                ticketModal.style.display = 'block';
            }
        } catch (error) {
            console.error('Error cargando ticket:', error);
            alert('No se pudo cargar el ticket.');
        } finally {
            button.textContent = '📄 Ver Ticket';
            button.disabled = false;
        }
    }

    function generateTicketHTML(data) {
        const { pedido, detalles } = data;
        const fecha = new Date(pedido.fecha_pedido).toLocaleString('es-MX');
        
        let itemsHtml = '';
        detalles.forEach(item => {
            const precio = parseFloat(item.precio_unitario).toFixed(2);
            const subtotal = parseFloat(item.subtotal).toFixed(2);
            itemsHtml += `
                <tr>
                    <td class="col-cant">${item.cantidad}</td>
                    <td class="col-desc">${item.nombre}</td>
                    <td class="col-importe">$${subtotal}</td>
                </tr>
            `;
        });

        const html = `
            <div class="ticket-header">
                <h2>La Desesperanza</h2>
                <p>Panadería Artesanal</p>
                <p>ladesesperanza.bullnodes.com</p>
                <p>Tel: 55 6969 6969</p>
            </div>
            <div class="ticket-info">
                <p><span>Folio Venta:</span> <strong>#${pedido.id_pedido}</strong></p>
                <p><span>Fecha:</span> ${fecha}</p>
                <br>
                <p style="border-bottom: 1px dashed #000; padding-bottom: 5px; margin-bottom: 5px;"><strong>DATOS DEL CLIENTE:</strong></p>
                <p><span>Cliente:</span> ${pedido.cliente_nombre} ${pedido.cliente_apellido}</p>
                <p><span>Email:</span> ${pedido.cliente_email}</p>
                <br>
                <p><span>Entrega en:</span> <span style="text-align:right; max-width:60%;">${pedido.direccion_entrega}</span></p>
            </div>
            <div class="ticket-items">
                <table class="ticket-table">
                    <thead>
                        <tr>
                            <th class="col-cant">CANT</th>
                            <th class="col-desc">DESCRIPCION</th>
                            <th class="col-importe">IMPORTE</th>
                        </tr>
                    </thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
            </div>
            <div class="ticket-totals">
                <div class="total-row">
                    <span>TOTAL:</span> <span>$${parseFloat(pedido.total).toFixed(2)}</span>
                </div>
                <p style="font-size: 0.9rem; margin-top: 5px;">(Pagado con Saldo de Cuenta)</p>
            </div>
            <div class="ticket-footer">
                <p>¡Gracias por su compra!</p>
                <p>ladesesperanza.bullnodes.com</p>
            </div>
        `;
        
        if(ticketArea) ticketArea.innerHTML = html;
    }

    if (ticketCloseBtn) {
        ticketCloseBtn.addEventListener('click', () => {
            ticketModal.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === ticketModal) ticketModal.style.display = 'none';
    });

    async function loadFavoritos() {
        const grid = document.getElementById('favoritos-grid-container');
        const noFavoritosMessage = document.getElementById('no-favoritos-message');

        try {
            const response = await apiFetch('/api/favoritos', 'GET');
            grid.innerHTML = '';
            
            if(response.success && response.data.length > 0) {
                noFavoritosMessage.style.display = 'none';
                response.data.forEach(product => {
                    grid.appendChild(createProductCard(product));
                });
            } else {
                noFavoritosMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error cargando favoritos:', error);
            noFavoritosMessage.textContent = 'Error al cargar favoritos.';
            noFavoritosMessage.style.display = 'block';
        }
    }
    
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        const price = parseFloat(product.precio).toFixed(2);
        const imageUrl = product.imagen_url || '/assets/images/placeholder.jpg';

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${product.nombre}" class="product-image" onerror="this.src='/assets/images/placeholder.jpg'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.nombre}</h3>
                <div class="product-footer" style="align-items: center;">
                    <span class="product-price">$${price}</span>
                    <button class="remove-favorito-btn" data-id="${product.id_producto}" style="background:none; border:none; cursor:pointer; color: #e74c3c; font-weight:bold;">Eliminar</button>
                </div>
            </div>
        `;
        
        card.querySelector('.remove-favorito-btn').addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            if (!confirm('¿Eliminar de favoritos?')) return;
            
            try {
                await apiFetch(`/api/favoritos/${id}`, 'DELETE');
                loadFavoritos();
            } catch (error) {
                alert('Error al eliminar favorito');
            }
        });
        return card;
    }

    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || 'perfil';
    const tabButton = document.querySelector(`.cuenta-tab[data-view="view-${view}"]`);
    
    if (tabButton) {
        switchView(`view-${view}`);
    } else {
        switchView('view-perfil');
    }
});