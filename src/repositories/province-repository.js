import pool from "../configs/db-config.js";

class ProvinceRepository {
    async getAll() {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM public.provinces');
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getById(id) {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM public.provinces WHERE id = $1', [id]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async create(province) {
        const { name, full_name, latitude, longitude, display_order } = province;
        const client = await pool.connect();
        try {
            const result = await client.query('INSERT INTO public.provinces (name, full_name, latitude, longitude, display_order) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, full_name, latitude, longitude, display_order]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async update(province) {
        const { id, name, full_name, latitude, longitude, display_order } = province;
        const client = await pool.connect();
        try {
            const result = await client.query('UPDATE public.provinces SET name = $1, full_name = $2, latitude = $3, longitude = $4, display_order = $5 WHERE id = $6', [name, full_name, latitude, longitude, display_order, id]);
            return result;
        } finally {
            client.release();
        }
    }

    async delete(id) {
        const client = await pool.connect();
        try {
            const result = await client.query('DELETE FROM public.provinces WHERE id = $1', [id]);
            return result;
        } finally {
            client.release();
        }
    }
}

export default ProvinceRepository;
