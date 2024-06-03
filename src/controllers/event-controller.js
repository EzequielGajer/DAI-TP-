import express from 'express';
import { createEvent, updateEvent, deleteEvent, getEventById, getEventDetailsById, getEventEnrollments, getEvents, searchEvents } from '../services/event-service.js';
import { authenticateToken } from '../middlewares/auth-middleware.js';

const router = express.Router();

// Crear Evento
router.post('/', authenticateToken, async (req, res) => {
    const { name, description, max_assistance, max_capacity, price, duration_in_minutes, id_event_location } = req.body;
    const userId = req.user.id;

    if (!name || !description || name.length < 3 || description.length < 3) {
        return res.status(400).json({ message: 'El nombre o la descripción son inválidos.' });
    }

    if (max_assistance > max_capacity) {
        return res.status(400).json({ message: 'El max_assistance es mayor que el max_capacity.' });
    }

    if (price < 0 || duration_in_minutes < 0) {
        return res.status(400).json({ message: 'El precio o la duración son inválidos.' });
    }

    try {
        const newEvent = await createEvent({ name, description, max_assistance, max_capacity, price, duration_in_minutes, id_event_location, userId });
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar Evento
router.put('/', authenticateToken, async (req, res) => {
    const { id, name, description, max_assistance, max_capacity, price, duration_in_minutes, id_event_location } = req.body;
    const userId = req.user.id;

    if (!name || !description || name.length < 3 || description.length < 3) {
        return res.status(400).json({ message: 'El nombre o la descripción son inválidos.' });
    }

    if (max_assistance > max_capacity) {
        return res.status(400).json({ message: 'El max_assistance es mayor que el max_capacity.' });
    }

    if (price < 0 || duration_in_minutes < 0) {
        return res.status(400).json({ message: 'El precio o la duración son inválidos.' });
    }

    try {
        const event = await getEventById(id);
        if (!event || event.user_id !== userId) {
            return res.status(404).json({ message: 'Evento no encontrado o no pertenece al usuario.' });
        }

        const updatedEvent = await updateEvent({ id, name, description, max_assistance, max_capacity, price, duration_in_minutes, id_event_location });
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Eliminar Evento
router.delete('/:id', authenticateToken, async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;

    try {
        const event = await getEventById(eventId);
        if (!event || event.user_id !== userId) {
            return res.status(404).json({ message: 'Evento no encontrado o no pertenece al usuario.' });
        }

        // Validar que no haya usuarios registrados al evento
        // Este es un ejemplo y debe ser implementado
        const hasUsersRegistered = false; // Implementar esta lógica
        if (hasUsersRegistered) {
            return res.status(400).json({ message: 'Hay usuarios registrados en el evento.' });
        }

        await deleteEvent(eventId);
        res.status(200).json({ message: 'Evento eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener detalles de un evento
router.get('/:id', async (req, res) => {
    const eventId = req.params.id;

    try {
        const eventDetails = await getEventDetailsById(eventId);
        if (!eventDetails) {
            return res.status(404).json({ message: 'Evento no encontrado.' });
        }
        res.status(200).json(eventDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Búsqueda de eventos con filtros
router.get('/', async (req, res) => {
    const { name, category, startdate, tag } = req.query;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;

    const filters = {
        name,
        category,
        startdate,
        tag,
        limit,
        offset
    };

    try {
        const { events, total } = await searchEvents(filters);
        res.status(200).json({
            collection: events,
            pagination: {
                limit,
                offset,
                total,
                nextPage: offset + limit < total ? `/api/event?${new URLSearchParams({ name, category, startdate, tag, limit, offset: offset + limit }).toString()}` : null
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;