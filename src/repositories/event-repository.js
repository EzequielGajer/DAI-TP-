import pool from "../configs/db-config.js";

export const createEvent = async (eventData) => {
    const { name, description, max_assistance, max_capacity, price, duration_in_minutes, id_event_location, userId } = eventData;
    const client = await pool.connect();
    try {
        const res = await client.query(
            'INSERT INTO events (name, description, max_assistance, max_capacity, price, duration_in_minutes, id_event_location, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, description, max_assistance, max_capacity, price, duration_in_minutes, id_event_location, userId]
        );
        return res.rows[0];
    } finally {
        client.release();
    }
};

export const updateEvent = async (eventData) => {
    const { id, name, description, max_assistance, max_capacity, price, duration_in_minutes, id_event_location } = eventData;
    const client = await pool.connect();
    try {
        const res = await client.query(
            'UPDATE events SET name = $1, description = $2, max_assistance = $3, max_capacity = $4, price = $5, duration_in_minutes = $6, id_event_location = $7 WHERE id = $8 RETURNING *',
            [name, description, max_assistance, max_capacity, price, duration_in_minutes, id_event_location, id]
        );
        return res.rows[0];
    } finally {
        client.release();
    }
};

export const deleteEvent = async (eventId) => {
    const client = await pool.connect();
    try {
        await client.query('DELETE FROM events WHERE id = $1', [eventId]);
    } finally {
        client.release();
    }
};

export const getEventById = async (eventId) => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM events WHERE id = $1', [eventId]);
        return res.rows[0];
    } finally {
        client.release();
    }
};
