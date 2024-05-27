// src/repositories/user-repository.js
import pool from '../configs/db-config.js';

export const getUserByUsername = async (username, password) => {
    let respuesta = null;
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
        //console.log('User from DB:', res.rows[0]);
        if (res.rows.length > 0 ){
            respuesta = res.rows[0];
        }
    } finally {
        client.release();
    }
    return respuesta;
};

export const createUser = async (userData) => {
    //const { first_name, last_name, username, password } = userData;
    const client = await pool.connect();
    try {
        const res = await client.query(
            'INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [userData.first_name, userData.last_name, userData.username, userData.password]
        );
        console.log('New User:', res.rows[0]);
        return res.rows[0];
    } finally {
        client.release();
    }
};
