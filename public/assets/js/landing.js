document.addEventListener('DOMContentLoaded', () => {

    const grid = document.getElementById('featured-products-grid');

    async function loadFeaturedProducts() {
        try {
            const response = await apiFetch('/api/productos', 'GET');
            if (response.success) {
                const featured = response.data
                    .filter(p => p.es_temporada && p.activo)
                    .slice(0, 3);
                
                if (featured.length === 0) {
                     grid.innerHTML = '<p>Pronto tendremos nuevos productos de temporada.</p>';
                     return;
                }
                
                featured.forEach(product => {
                    grid.appendChild(createProductCard(product));
                });
            }
        } catch (error) {
            console.error('Error cargando productos destacados:', error);
            grid.innerHTML = '<p>Error al cargar productos.</p>';
        }
    }

    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';

        const price = parseFloat(product.precio).toFixed(2);
        const imageUrl = product.imagen_url || 'assets/images/placeholder.jpg';

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${imageUrl}" alt="${product.nombre}" class="product-image" onerror="this.src='assets/images/placeholder.jpg'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.nombre}</h3>
                <p class="product-description">${product.descripcion || ''}</p>
                <div class="product-footer">
                    <span class="product-price">$${price}</span>
                </div>
            </div>
        `;
        return card;
    }

    loadFeaturedProducts();
});