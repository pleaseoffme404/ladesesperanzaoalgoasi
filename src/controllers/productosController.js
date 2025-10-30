const db = require('../services/db.service');

const getAllProductos = async (req, res, next) => {
    try {
        const query = `
            SELECT p.*, c.nombre as nombre_categoria 
            FROM productos p
            JOIN categorias c ON p.id_categoria = c.id_categoria
            WHERE p.activo = TRUE
            ORDER BY p.nombre ASC
        `;
        const [rows] = await db.query(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
};

const getProductoById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT p.*, c.nombre as nombre_categoria 
            FROM productos p
            JOIN categorias c ON p.id_categoria = c.id_categoria
            WHERE p.id_producto = ? AND p.activo = TRUE
        `;
        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        next(error);
    }
};

const createProducto = async (req, res, next) => {
    const {
        nombre,
        descripcion,
        precio,
        id_categoria,
        cantidad_disponible,
        cantidad_minima,
        es_temporada,
        temporada,
        imagen_url
    } = req.body;

    const id_admin = req.session.admin.id_administrador;

    if (!nombre || !precio || !id_categoria || !id_admin) {
        return res.status(400).json({ success: false, message: 'Campos requeridos faltantes: nombre, precio, id_categoria.' });
    }

    try {
        const query = `
            INSERT INTO productos 
            (nombre, descripcion, precio, id_categoria, cantidad_disponible, cantidad_minima, es_temporada, temporada, imagen_url, creado_por) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            nombre,
            descripcion,
            precio,
            id_categoria,
            cantidad_disponible || 0,
            cantidad_minima || 5,
            es_temporada || false,
            temporada,
            imagen_url,
            id_admin
        ]);

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente.',
            id_producto: result.insertId
        });
    } catch (error) {
        next(error);
    }
};

const updateProducto = async (req, res, next) => {
    const { id } = req.params;
    const {
        nombre,
        descripcion,
        precio,
        id_categoria,
        cantidad_disponible,
        cantidad_minima,
        es_temporada,
        temporada,
        imagen_url,
        activo
    } = req.body;

    if (!nombre || !precio || !id_categoria) {
        return res.status(400).json({ success: false, message: 'Campos requeridos faltantes: nombre, precio, id_categoria.' });
    }

    try {
        const query = `
            UPDATE productos SET
            nombre = ?,
            descripcion = ?,
            precio = ?,
            id_categoria = ?,
            cantidad_disponible = ?,
            cantidad_minima = ?,
            es_temporada = ?,
            temporada = ?,
            imagen_url = ?,
            activo = ?
            WHERE id_producto = ?
        `;
        const [result] = await db.query(query, [
            nombre,
            descripcion,
            precio,
            id_categoria,
            cantidad_disponible,
            cantidad_minima,
            es_temporada,
            temporada,
            imagen_url,
            (activo === undefined ? true : activo),
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }

        res.status(200).json({ success: true, message: 'Producto actualizado exitosamente.' });
    } catch (error) {
        next(error);
    }
};

const deleteProducto = async (req, res, next) => {
    const { id } = req.params;
    
    try {
        const [result] = await db.query('UPDATE productos SET activo = FALSE WHERE id_producto = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
        }

        res.status(200).json({ success: true, message: 'Producto desactivado (eliminado lógicamente) exitosamente.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto
};