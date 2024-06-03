import pool from "../configs/db-config.js";

export const getAllEventLocations = async (userId, limit, offset) => {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT * FROM event_locations 
            WHERE id_creator_user = $1 
            LIMIT $2 OFFSET $3`, 
            [userId, limit, offset]);
        
        const countRes = await client.query('SELECT COUNT(*) FROM event_locations WHERE id_creator_user = $1', [userId]);
        const total = parseInt(countRes.rows[0].count, 10);

        return {
            eventLocations: res.rows,
            total
        };
    } finally {
        client.release();
    }
};

export const getEventLocationById = async (id, userId) => {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM event_locations WHERE id = $1 AND id_creator_user = $2', [id, userId]);
        return res.rows[0];
    } finally {
        client.release();
    }
};

export const createEventLocation = async (eventLocation) => {
    const { name, full_address, id_location, max_capacity, id_creator_user } = eventLocation;
    const client = await pool.connect();
    try {
        const res = await client.query(
            'INSERT INTO event_locations (name, full_address, id_location, max_capacity, id_creator_user) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, full_address, id_location, max_capacity, id_creator_user]
        );
        return res.rows[0];
    } finally {
        client.release();
    }
};

export const updateEventLocation = async (eventLocation) => {
    const { id, name, full_address, id_location, max_capacity, id_creator_user } = eventLocation;
    const client = await pool.connect();
    try {
        const res = await client.query(
            'UPDATE event_locations SET name = $1, full_address = $2, id_location = $3, max_capacity = $4 WHERE id = $5 AND id_creator_user = $6 RETURNING *',
            [name, full_address, id_location, max_capacity, id, id_creator_user]
        );
        return res.rows[0];
    } finally {
        client.release();
    }
};

export const deleteEventLocation = async (id, userId) => {
    const client = await pool.connect();
    try {
        const res = await client.query('DELETE FROM event_locations WHERE id = $1 AND id_creator_user = $2 RETURNING *', [id, userId]);
        return res.rows[0];
    } finally {
        client.release();
    }
};
