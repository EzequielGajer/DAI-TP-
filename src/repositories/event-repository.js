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

export const getEvents = async (limit, offset) => {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT 
                e.id, e.name, e.description, e.start_date, e.duration_in_minutes, e.price, e.enabled_for_enrollment, el.max_capacity,
                u.id as creator_user_id, u.first_name as creator_user_first_name, u.last_name as creator_user_last_name, u.username as creator_user_username,
                c.id as category_id, c.name as category_name,
                el.id as location_id, el.name as location_name, el.full_address as location_full_address
            FROM events e
            JOIN users u ON e.id_creator_user = u.id
            JOIN event_categories c ON e.id_event_category = c.id
            JOIN event_locations el ON e.id_event_location = el.id
            ORDER BY e.start_date DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const countRes = await client.query('SELECT COUNT(*) FROM events');
        const total = parseInt(countRes.rows[0].count, 10);

        return {
            events: res.rows,
            total
        };
    } finally {
        client.release();
    }
};

export const searchEvents = async (filters) => {
    const client = await pool.connect();
    const { name, category, startdate, tag, limit, offset } = filters;
    const conditions = [];
    const values = [];

    if (name) {
        values.push(`%${name}%`);
        conditions.push(`e.name ILIKE $${values.length}`);
    }
    if (category) {
        values.push(`%${category}%`);
        conditions.push(`c.name ILIKE $${values.length}`);
    }
    if (startdate) {
        values.push(startdate);
        conditions.push(`DATE(e.start_date) = $${values.length}`);
    }
    if (tag) {
        values.push(`%${tag}%`);
        conditions.push(`t.name ILIKE $${values.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
        SELECT 
            e.id, e.name, e.description, e.start_date, e.duration_in_minutes, e.price, e.enabled_for_enrollment, el.max_capacity,
            u.id as creator_user_id, u.first_name as creator_user_first_name, u.last_name as creator_user_last_name, u.username as creator_user_username,
            c.id as category_id, c.name as category_name,
            el.id as location_id, el.name as location_name, el.full_address as location_full_address
        FROM events e
        JOIN users u ON e.id_creator_user = u.id
        JOIN event_categories c ON e.id_event_category = c.id
        JOIN event_locations el ON e.id_event_location = el.id
        LEFT JOIN event_tags et ON e.id = et.id_event
        LEFT JOIN tags t ON et.id_tag = t.id
        ${whereClause}
        ORDER BY e.start_date DESC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(limit, offset);

    try {
        const res = await client.query(query, values);

        const countQuery = `
            SELECT COUNT(*)
            FROM events e
            JOIN event_categories c ON e.id_event_category = c.id
            LEFT JOIN event_tags et ON e.id = et.id_event
            LEFT JOIN tags t ON et.id_tag = t.id
            ${whereClause}
        `;
        const countRes = await client.query(countQuery, values.slice(0, values.length - 2));
        const total = parseInt(countRes.rows[0].count, 10);

        return {
            events: res.rows,
            total
        };
    } finally {
        client.release();
    }
};


export const enrollInEventRepo = async (eventId, userId) => {
    const client = await pool.connect();
    try {
        // Verificar si el evento existe y está habilitado para inscripción
        const eventRes = await client.query('SELECT * FROM events WHERE id = $1', [eventId]);
        const event = eventRes.rows[0];
        
        if (!event) {
            throw { status: 404, message: 'Evento no encontrado.' };
        }
        if (!event.enabled_for_enrollment) {
            throw { status: 400, message: 'Evento no está habilitado para la inscripción.' };
        }
        if (event.start_date <= new Date()) {
            throw { status: 400, message: 'El evento ya ha sucedido o es hoy.' };
        }
        
        // Verificar si el usuario ya está registrado
        const userEnrollmentRes = await client.query('SELECT * FROM event_enrollments WHERE id_event = $1 AND id_user = $2', [eventId, userId]);
        if (userEnrollmentRes.rows.length > 0) {
            throw { status: 400, message: 'El usuario ya está registrado en el evento.' };
        }
        
        // Verificar la capacidad del evento
        const enrollmentsRes = await client.query('SELECT COUNT(*) FROM event_enrollments WHERE id_event = $1', [eventId]);
        const enrolledCount = parseInt(enrollmentsRes.rows[0].count, 10);
        if (enrolledCount >= event.max_assistance) {
            throw { status: 400, message: 'Excedido el límite de asistencia.' };
        }

        // Registrar al usuario
        const registrationDateTime = new Date();
        const res = await client.query(
            'INSERT INTO event_enrollments (id_event, id_user, registration_date_time) VALUES ($1, $2, $3) RETURNING *',
            [eventId, userId, registrationDateTime]
        );
        return res.rows[0];
    } finally {
        client.release();
    }
};

export const removeEnrollmentRepo = async (eventId, userId) => {
    const client = await pool.connect();
    try {
        // Verificar si el evento existe y no ha sucedido aún
        const eventRes = await client.query('SELECT * FROM events WHERE id = $1', [eventId]);
        const event = eventRes.rows[0];

        if (!event) {
            throw { status: 404, message: 'Evento no encontrado.' };
        }
        if (event.start_date <= new Date()) {
            throw { status: 400, message: 'El evento ya ha sucedido o es hoy.' };
        }

        // Verificar si el usuario está registrado
        const userEnrollmentRes = await client.query('SELECT * FROM event_enrollments WHERE id_event = $1 AND id_user = $2', [eventId, userId]);
        if (userEnrollmentRes.rows.length === 0) {
            throw { status: 400, message: 'El usuario no está registrado en el evento.' };
        }

        // Eliminar la inscripción
        await client.query('DELETE FROM event_enrollments WHERE id_event = $1 AND id_user = $2', [eventId, userId]);
    } finally {
        client.release();
    }
};

export const getEventEnrollments = async (eventId, filters) => {
    const client = await pool.connect();
    const { first_name, last_name, username, attended, rating } = filters || {}; // Asegurarse de que los filtros estén definidos o usar un objeto vacío
    const conditions = [];
    const values = [eventId];

    if (first_name) {
        values.push(`%${first_name}%`);
        conditions.push(`u.first_name ILIKE $${values.length}`);
    }
    if (last_name) {
        values.push(`%${last_name}%`);
        conditions.push(`u.last_name ILIKE $${values.length}`);
    }
    if (username) {
        values.push(`%${username}%`);
        conditions.push(`u.username ILIKE $${values.length}`);
    }
    if (attended !== undefined) {
        values.push(attended);
        conditions.push(`e.attended = $${values.length}`);
    }
    if (rating) {
        values.push(rating);
        conditions.push(`e.rating >= $${values.length}`);
    }

    const whereClause = conditions.length ? `AND ${conditions.join(' AND ')}` : '';

    try {
        const res = await client.query(`
            SELECT 
                e.id, e.id_event, e.id_user, e.description, e.registration_date_time, e.attended, e.observations, e.rating,
                u.id as user_id, u.first_name, u.last_name, u.username
            FROM event_enrollments e
            JOIN users u ON e.id_user = u.id
            WHERE e.id_event = $1 ${whereClause}
        `, values);
        return res.rows;
    } finally {
        client.release();
    }
};


export const rateEventRepo = async (eventId, enrollmentId, rating, observations) => {
    const client = await pool.connect();
    try {
        // Verificar si el usuario está registrado al evento
        const enrollmentRes = await client.query('SELECT * FROM event_enrollments WHERE id = $1 AND id_event = $2', [enrollmentId, eventId]);
        if (enrollmentRes.rows.length === 0) {
            throw { status: 400, message: 'El usuario no está registrado al evento.' };
        }

        // Verificar si el evento ha finalizado
        const eventRes = await client.query('SELECT * FROM events WHERE id = $1 AND start_date <= NOW()', [eventId]);
        if (eventRes.rows.length === 0) {
            throw { status: 400, message: 'El evento no ha finalizado aún.' };
        }

        // Verificar que el rating esté en el rango correcto
        if (rating < 1 || rating > 10) {
            throw { status: 400, message: 'El rating debe estar entre 1 y 10 (inclusive).' };
        }

        // Actualizar el rating y las observaciones en la inscripción
        await client.query('UPDATE event_enrollments SET rating = $1, observations = $2 WHERE id = $3', [rating, observations, enrollmentId]);
    } finally {
        client.release();
    }
};