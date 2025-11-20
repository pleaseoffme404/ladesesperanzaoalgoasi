document.addEventListener('DOMContentLoaded', () => {

    const itemsContainer = document.getElementById('cart-items-container');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');
    const checkoutButton = document.getElementById('checkout-button');
    const emptyMessage = document.getElementById('cart-empty-message');
    const successMessage = document.getElementById('checkout-success-message');
    const cartGrid = document.getElementById('cart-grid');
    const checkoutError = document.getElementById('checkout-error');
    const direccionInput = document.getElementById('direccion-texto');
    const latDisplay = document.getElementById('lat-display');
    const lngDisplay = document.getElementById('lng-display');
    const locateBtn = document.getElementById('locate-me-btn');

    let currentCart = [];
    let map, marker;
    let selectedLat = 19.4326; 
    let selectedLng = -99.1332;

    function initMap() {
        if (map) return; 

        map = L.map('map').setView([selectedLat, selectedLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        marker = L.marker([selectedLat, selectedLng], {
            draggable: true
        }).addTo(map);

        marker.on('dragend', function(event) {
            const position = marker.getLatLng();
            updatePosition(position.lat, position.lng);
        });

        map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            updatePosition(e.latlng.lat, e.latlng.lng);
        });

        updatePosition(selectedLat, selectedLng);
        
        setTimeout(() => {
            map.invalidateSize();
            locateUser();
        }, 500);
    }

    function locateUser() {
        if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            return;
        }

        locateBtn.textContent = "📍 Buscando...";
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                map.setView([lat, lng], 16);
                marker.setLatLng([lat, lng]);
                updatePosition(lat, lng);
                locateBtn.textContent = "📍 Usar mi ubicación actual";
            },
            (error) => {
                console.error("Error de geolocalización:", error);
                locateBtn.textContent = "📍 Usar mi ubicación actual";
            }
        );
    }

    function updatePosition(lat, lng) {
        selectedLat = lat;
        selectedLng = lng;
        latDisplay.textContent = lat.toFixed(5);
        lngDisplay.textContent = lng.toFixed(5);
    }

    async function loadCart() {
        try {
            const response = await apiFetch('/api/pedidos/carrito', 'GET');
            if (response.success) {
                currentCart = response.data;
                renderCart();
                if (currentCart.length > 0) {
                    initMap(); 
                }
            }
        } catch (error) {
            console.error('Error al cargar carrito:', error);
            if (error.status === 401) {
                window.location.href = '/cliente/';
            }
        }
    }

    function renderCart() {
        itemsContainer.innerHTML = '';
        
        if (currentCart.length === 0) {
            emptyMessage.style.display = 'block';
            checkoutButton.disabled = true;
            if(document.getElementById('map')) document.getElementById('map').style.display = 'none';
        } else {
            emptyMessage.style.display = 'none';
            checkoutButton.disabled = false;
            if(document.getElementById('map')) document.getElementById('map').style.display = 'block';
        }

        let subtotal = 0;

        currentCart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            
            const price = parseFloat(item.precio_unitario);
            const itemTotal = price * item.cantidad;
            subtotal += itemTotal;

            itemElement.innerHTML = `
                <div class="cart-item-details">
                    <h3>${item.nombre}</h3>
                    <p class="cart-item-price">$${price.toFixed(2)}</p>
                    <div class="cart-item-actions">
                        <span class="cart-item-quantity">Cantidad: ${item.cantidad}</span>
                        <button class="remove-item-btn" data-id="${item.id_producto}">Eliminar</button>
                    </div>
                </div>
            `;
            
            itemElement.querySelector('.remove-item-btn').addEventListener('click', handleRemoveItem);
            itemsContainer.appendChild(itemElement);
        });

        summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
        summaryTotal.textContent = `$${subtotal.toFixed(2)}`;
    }

    async function handleRemoveItem(event) {
        const button = event.target;
        const productId = button.getAttribute('data-id');
        
        button.disabled = true;
        
        try {
            const response = await apiFetch(`/api/pedidos/carrito/${productId}`, 'DELETE');
            if (response.success) {
                currentCart = response.data;
                renderCart();
                const cartBadge = document.getElementById('cart-badge');
                if(cartBadge) {
                    const totalItems = currentCart.reduce((sum, item) => sum + item.cantidad, 0);
                    cartBadge.textContent = totalItems > 0 ? totalItems : 0;
                    if(totalItems > 0) cartBadge.classList.add('visible');
                    else cartBadge.classList.remove('visible');
                }
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert(error.message || 'No se pudo eliminar el producto.');
            button.disabled = false;
        }
    }

    async function handleCheckout() {
        const direccion = direccionInput.value.trim();
        
        if (!direccion) {
            checkoutError.textContent = 'Por favor, escribe la calle y número para facilitar la entrega.';
            checkoutError.style.display = 'block';
            direccionInput.focus();
            return;
        }

        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Procesando...';
        checkoutError.style.display = 'none';

        const payload = {
            direccion_entrega: direccion,
            latitud: selectedLat,
            longitud: selectedLng
        };

        try {
            const response = await apiFetch('/api/pedidos/checkout', 'POST', payload);
            if (response.success) {
                currentCart = [];
                cartGrid.style.display = 'none';
                successMessage.style.display = 'block';
                const cartBadge = document.getElementById('cart-badge');
                if(cartBadge) {
                    cartBadge.textContent = '0';
                    cartBadge.classList.remove('visible');
                }
            }
        } catch (error) {
            console.error('Error en checkout:', error);
            checkoutError.textContent = error.message || 'Error al procesar el pedido.';
            checkoutError.style.display = 'block';
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Finalizar Compra';
        }
    }
    
    locateBtn.addEventListener('click', locateUser);
    checkoutButton.addEventListener('click', handleCheckout);

    loadCart();
});