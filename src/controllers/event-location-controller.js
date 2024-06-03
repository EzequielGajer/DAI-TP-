import express from 'express';
import {
    getAllEventLocations,
    getEventLocationById,
    createEventLocation,
    updateEventLocation,
    deleteEventLocation
} from '../services/event-location-service.js';
import { authenticateToken } from '../middlewares/auth-middleware.js';

const router = express.Router();

// Obtener todas las ubicaciones de eventos del usuario autenticado
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;

    try {
        const { eventLocations, total } = await getAllEventLocations(userId, limit, offset);
        res.status(200).json({
            collection: eventLocations,
            pagination: {
                limit,
                offset,
                total,
                nextPage: offset + limit < total ? `/api/event-location?limit=${limit}&offset=${offset + limit}` : null
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener una ubicación de evento por ID
router.get('/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;

    try {
        const eventLocation = await getEventLocationById(id, userId);
        if (!eventLocation) {
            return res.status(404).json({ message: 'Event location not found or not authorized.' });
        }
        res.status(200).json(eventLocation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear una nueva ubicación de evento
router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { name, full_address, id_location, max_capacity } = req.body;

    if (!name || name.length < 3 || !full_address || full_address.length < 3) {
        return res.status(400).json({ message: 'Name or full address is invalid.' });
    }
    if (max_capacity <= 0) {
        return res.status(400).json({ message: 'Max capacity must be greater than zero.' });
    }

    try {
        const newEventLocation = await createEventLocation({ name, full_address, id_location, max_capacity, id_creator_user: userId });
        res.status(201).json(newEventLocation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar una ubicación de evento
router.put('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { id, name, full_address, id_location, max_capacity } = req.body;

    if (!name || name.length < 3 || !full_address || full_address.length < 3) {
        return res.status(400).json({ message: 'Name or full address is invalid.' });
    }
    if (max_capacity <= 0) {
        return res.status(400).json({ message: 'Max capacity must be greater than zero.' });
    }

    try {
        const updatedEventLocation = await updateEventLocation({ id, name, full_address, id_location, max_capacity, id_creator_user: userId });
        if (!updatedEventLocation) {
            return res.status(404).json({ message: 'Event location not found or not authorized.' });
        }
        res.status(200).json(updatedEventLocation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Eliminar una ubicación de evento
router.delete('/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;

    try {
        const deletedEventLocation = await deleteEventLocation(id, userId);
        if (!deletedEventLocation) {
            return res.status(404).json({ message: 'Event location not found or not authorized.' });
        }
        res.status(200).json(deletedEventLocation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
