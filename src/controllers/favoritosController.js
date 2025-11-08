const db = require('../services/db.service');

const getMisFavoritos = async (req, res, next) => {
    const id_cliente = req.session.cliente.id_cliente;
    try {
        const query = `
            SELECT p.id_producto, p.nombre, p.precio, p.imagen_url, p.activo 
            FROM productos p
            JOIN favoritos f ON p.id_producto = f.id_producto
            WHERE f.id_cliente = ? AND p.activo = TRUE
        `;
        const [rows] = await db.query(query, [id_cliente]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
};

const addFavorito = async (req, res, next) => {
    const id_cliente = req.session.cliente.id_cliente;
    const { id_producto } = req.body;
    try {
        await db.query(
            'INSERT INTO favoritos (id_cliente, id_producto) VALUES (?, ?)',
            [id_cliente, id_producto]
        );
        res.status(201).json({ success: true, message: 'Producto añadido a favoritos.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Este producto ya está en tus favoritos.' });
        }
        next(error);
    }
};

const removeFavorito = async (req, res, next) => {
    const id_cliente = req.session.cliente.id_cliente;
    const { id } = req.params;
    try {
        const [result] = await db.query(
            'DELETE FROM favoritos WHERE id_cliente = ? AND id_producto = ?',
            [id_cliente, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Favorito no encontrado.' });
        }
        res.status(200).json({ success: true, message: 'Producto eliminado de favoritos.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMisFavoritos,
    addFavorito,
    removeFavorito
};