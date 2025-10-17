const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseService {
    constructor() {
        if (DatabaseService.instance) {
            return DatabaseService.instance;
        }

        this.config = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'panaderia_desesperanza',
            port: process.env.DB_PORT || 3306
        };
        this.verificarConexion();

        DatabaseService.instance = this;
    }

    async verificarConexion() {
        try {
            const connection = await mysql.createConnection(this.config);
            console.log(' Conexión a la base de datos exitosa');
            console.log(`Base de datos: ${process.env.DB_NAME}`);
            await connection.end();
        } catch (error) {
            console.error(' Error al conectar con la base de datos:');
            console.error(`   Host: ${process.env.DB_HOST}`);
            console.error(`   Usuario: ${process.env.DB_USER}`);
            console.error(`   Base de datos: ${process.env.DB_NAME}`);
            console.error(`   Error: ${error.message}`);
            console.warn(' El servidor continuará pero las operaciones de BD fallarán');
        }
    }

    async createConnection() {
        try {
            return await mysql.createConnection(this.config);
        } catch (error) {
            console.error('Error al crear conexión:', error.message);
            throw error;
        }
    }

    async query(sql, params = []) {
        let connection;
        try {
            connection = await this.createConnection();
            const [results] = await connection.execute(sql, params);
            return results;
        } catch (error) {
            console.error('   Error en query:', error.message);
            console.error('   SQL:', sql);
            console.error('   Params:', params);
            throw error;
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
}
const dbService = new DatabaseService();

module.exports = dbService;