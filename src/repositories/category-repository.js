import pool from "../configs/db-config.js";

class CategoryRepository {
    async getAll() {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM public.event_categories ');
            return result.rows;
        } finally {
            client.release();
        }
    }

    async getById(id) {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM event_categories WHERE id = $1', [id]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async create(category) {
        const { id , name,display_order } = category;
        const client = await pool.connect();
        try {
            const result = await client.query('INSERT INTO public.event_categories (name, display_order) VALUES ($1, $2) RETURNING *', [name, display_order]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async update(category) {
        let rowCount = 0;
        const { name , display_order,id } = category;
        const client = await pool.connect();
        try {
            const result = await client.query('UPDATE public.event_categories SET name = $1, display_order = $2 WHERE id = $3', [name, display_order, id]);
            console.log('OK', rowCount)
            rowCount = result.rowCount;
        } catch (error) {
            console.log('ERROR', error)
            rowCount = 0;
        } finally {
            client.release();
            
        }
        return  rowCount;
    }

    async delete(id) {
        const client = await pool.connect();
        try {
            const result = await client.query('DELETE FROM public.event_categories WHERE id = $1', [id]);
            return result;
        } finally {
            client.release();
        }
    }
}

export default CategoryRepository;
