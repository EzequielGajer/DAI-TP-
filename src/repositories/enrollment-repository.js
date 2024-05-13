import pool from "../configs/db-config.js";

class EnrollmentRepository {
    async enrollUserToEvent(eventId, userId) {
        const client = await pool.connect();
        try {
            await client.query('INSERT INTO event_enrollments (event_id, user_id) VALUES ($1, $2)', [eventId, userId]);
        } finally {
            client.release();
        }
    }

    async removeUserFromEvent(eventId, userId) {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM event_enrollments WHERE event_id = $1 AND user_id = $2', [eventId, userId]);
        } finally {
            client.release();
        }
    }
}

export default EnrollmentRepository;
