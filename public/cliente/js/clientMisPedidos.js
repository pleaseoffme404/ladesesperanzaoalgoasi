document.addEventListener('DOMContentLoaded', () => {

    const ordersContainer = document.getElementById('orders-list-container');
    const noOrdersMessage = document.getElementById('no-orders-message');
    
    const ticketModal = document.getElementById('ticket-modal');
    const ticketCloseBtn = document.getElementById('ticket-close-button');
    const ticketArea = document.getElementById('ticket-printable-area');

    async function loadMisPedidos() {
        try {
            const response = await apiFetch('/api/pedidos/mis-pedidos', 'GET');
            
            if (response.success) {
                renderPedidos(response.data);
            }
        } catch (error) {
            console.error('Error cargando pedidos:', error);
            if (error.status === 401) {
                window.location.href = '/cliente/';
            }
        }
    }

    function renderPedidos(pedidos) {
        ordersContainer.innerHTML = '';
        
        if (pedidos.length === 0) {
            noOrdersMessage.style.display = 'block';
            return;
        }

        noOrdersMessage.style.display = 'none';

        pedidos.forEach(order => {
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
    }

    ordersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('order-details-toggle')) {
            handleShowDetails(e.target);
        } else if (e.target.classList.contains('order-ticket-btn')) {
            handleViewTicket(e.target);
        }
    });

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
                    html += `
                        <p>
                            (${item.cantidad}x) <span>${item.nombre}</span> 
                            - $${sub.toFixed(2)}
                        </p>
                    `;
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
                    <tbody>
                        ${itemsHtml}
                    </tbody>
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

        const ticketArea = document.getElementById('ticket-printable-area');
        if (ticketArea) {
            ticketArea.innerHTML = html;
        }
    }

    if (ticketCloseBtn) {
        ticketCloseBtn.addEventListener('click', () => {
            ticketModal.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === ticketModal) ticketModal.style.display = 'none';
    });

    loadMisPedidos();
});