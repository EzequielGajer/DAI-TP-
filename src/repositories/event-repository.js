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


export const getEventDetailsById = async (eventId) => {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT 
                e.id, e.name, e.description, e.id_event_category, e.start_date, e.duration_in_minutes, e.price, e.enabled_for_enrollment, e.max_assistance, e.id_creator_user,
                el.id as event_location_id, el.name as event_location_name, el.full_address as event_location_full_address, el.max_capacity as event_location_max_capacity, el.latitude as event_location_latitude, el.longitude as event_location_longitude,
                l.id as location_id, l.name as location_name, l.latitude as location_latitude, l.longitude as location_longitude,
                p.id as province_id, p.name as province_name, p.full_name as province_full_name, p.latitude as province_latitude, p.longitude as province_longitude,
                u.id as creator_user_id, u.first_name as creator_user_first_name, u.last_name as creator_user_last_name, u.username as creator_user_username,
                c.id as event_category_id, c.name as event_category_name, c.display_order as event_category_display_order,
                COALESCE(json_agg(json_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL), '[]') as tags
            FROM events e
            JOIN event_locations el ON e.id_event_location = el.id
            JOIN locations l ON el.id_location = l.id
            JOIN provinces p ON l.id_province = p.id
            JOIN users u ON e.id_creator_user = u.id
            JOIN event_categories c ON e.id_event_category = c.id
            LEFT JOIN event_tags et ON e.id = et.id_event
            LEFT JOIN tags t ON et.id_tag = t.id
            WHERE e.id = $1
            GROUP BY e.id, el.id, l.id, p.id, u.id, c.id
        `, [eventId]);
        return res.rows[0];
    } finally {
        client.release();
    }
};
