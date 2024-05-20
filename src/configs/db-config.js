// src/db-config.js
import pg from 'pg';

const pool = new pg.Pool({
    host: 'localhost',
    database: 'dai-events',
    user: 'postgres',
    password: 'root',
    port: 5432, // Puerto por defecto de PostgreSQL
});

export default pool;
