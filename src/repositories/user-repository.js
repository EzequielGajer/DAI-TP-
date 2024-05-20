// src/repositories/user-repository.js
import pool from '../configs/db-config.js';

export const getUserByUsername = async (username) => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        console.log('User from DB:', res.rows[0]);
        return res.rows[0];
    } finally {
        client.release();
    }
};

export const createUser = async (userData) => {
    const { first_name, last_name, username, password } = userData;
    const client = await pool.connect();
    try {
        const res = await client.query(
            'INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4) RETURNING *',
            [first_name, last_name, username, password]
        );
        console.log('New User:', res.rows[0]);
        return res.rows[0];
    } finally {
        client.release();
    }
};
