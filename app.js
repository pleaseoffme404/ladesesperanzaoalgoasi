const express = require('express');

const path = require('path');
require('dotenv').config();
const PORT = process.env.PORT ;


//const corsMiddleware = require('./src/middleware/cors');
//const sessionMiddleware = require('./src/middleware/session');

const productsRoutes = require('./src/routes/products');
const categoriesRoutes = require('./src/routes/categories');
const authRoutes = require('./src/routes/auth');
const app = express();
//app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
/*
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
*/
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        mensaje: err.message 
    });
});
app.listen(PORT, () => {
    console.log(`🍞 Servidor de Panadería "La Desesperanza" corriendo en http://localhost:${PORT}`);
});