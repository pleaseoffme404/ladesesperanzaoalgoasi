document.addEventListener('DOMContentLoaded', () => {

    const totalIngresosEl = document.getElementById('total-ingresos-stat');
    const totalPendientesEl = document.getElementById('total-pendientes-stat');
    const totalPedidosEl = document.getElementById('total-pedidos-stat');
    const totalClientesEl = document.getElementById('total-clientes-stat');
    const recentOrdersList = document.getElementById('recent-orders-list');
    const lowStockList = document.getElementById('low-stock-list');

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = '#334155';

    async function loadDashboardData() {
        try {
            const [pedidosData, clientesData, productosData] = await Promise.all([
                apiFetch('/api/pedidos/admin/todos', 'GET'),
                apiFetch('/api/clientes/admin/todos', 'GET'),
                apiFetch('/api/productos', 'GET')
            ]);

            const pedidos = pedidosData.data;
            const clientes = clientesData.data;
            const productos = productosData.data;

            renderSummaryCards(pedidos, clientes);
            
            renderRecentOrders(pedidos);
            renderLowStock(productos);

            renderCharts(pedidos, productos);

        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    }

    function renderSummaryCards(pedidos, clientes) {
        const ingresos = pedidos
            .filter(p => p.estado === 'Completado')
            .reduce((sum, p) => sum + parseFloat(p.total), 0);
            
        const pendientes = pedidos.filter(p => p.estado === 'Pendiente').length;

        totalIngresosEl.textContent = `$${ingresos.toFixed(2)}`;
        totalPendientesEl.textContent = pendientes;
        totalPedidosEl.textContent = pedidos.length;
        totalClientesEl.textContent = clientes.length;
    }

    function renderRecentOrders(pedidos) {
        recentOrdersList.innerHTML = '';
        if (pedidos.length === 0) {
            recentOrdersList.innerHTML = '<tr><td colspan="4">No hay pedidos recientes.</td></tr>';
            return;
        }
        pedidos.slice(0, 5).forEach(order => {
            const row = document.createElement('tr');
            const total = parseFloat(order.total).toFixed(2);
            const statusClass = order.estado.toLowerCase().replace(' ', '-');
            
            row.innerHTML = `
                <td><span style="font-family:monospace; color:var(--admin-text-main);">#${order.id_pedido}</span></td>
                <td>${order.nombre} ${order.apellido}</td>
                <td><strong>$${total}</strong></td>
                <td><span class="status-badge status-${statusClass}">${order.estado}</span></td>
            `;
            recentOrdersList.appendChild(row);
        });
    }

    function renderLowStock(productos) {
        lowStockList.innerHTML = '';
        const lowStockItems = productos.filter(p => p.activo && p.cantidad_disponible <= p.cantidad_minima);

        if (lowStockItems.length === 0) {
            lowStockList.innerHTML = '<li style="color:var(--admin-text-muted);">Todo el inventario está saludable.</li>';
            return;
        }

        lowStockItems.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.nombre}</span>
                <span class="stock-low">Quedan: ${item.cantidad_disponible}</span>
            `;
            lowStockList.appendChild(li);
        });
    }

    function renderCharts(pedidos, productos) {
        
        const estados = {};
        pedidos.forEach(p => {
            estados[p.estado] = (estados[p.estado] || 0) + 1;
        });

        const ctxOrders = document.getElementById('ordersChart').getContext('2d');
        new Chart(ctxOrders, {
            type: 'doughnut',
            data: {
                labels: Object.keys(estados),
                datasets: [{
                    label: 'Cantidad de Pedidos',
                    data: Object.values(estados),
                    backgroundColor: [
                        '#f59e0b', 
                        '#3b82f6', 
                        '#10b981', 
                        '#ef4444'  
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });


        const topStock = productos
            .sort((a, b) => b.cantidad_disponible - a.cantidad_disponible)
            .slice(0, 5);

        const ctxStock = document.getElementById('stockChart').getContext('2d');
        new Chart(ctxStock, {
            type: 'bar',
            data: {
                labels: topStock.map(p => p.nombre.substring(0, 10) + '...'), 
                datasets: [{
                    label: 'Unidades en Stock',
                    data: topStock.map(p => p.cantidad_disponible),
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#334155' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    loadDashboardData();
});