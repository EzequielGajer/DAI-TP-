import express from 'express';
import {
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventDetailsById,
    getEventEnrollments,
    getEvents,
    searchEvents,
    enrollInEvent,
    removeEnrollment,
    rateEvent // Agrega esta línea para importar rateEvent desde event-service.js
} from '../services/event-service.js'; // Asegúrate de que la ruta sea correcta

import { authenticateToken } from '../middlewares/auth-middleware.js';
import { cancelEnrollment } from '../services/event-service.js'; // Asegúrate de que cancelEnrollment esté disponible en event-service.js

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

// Obtener inscripciones de un evento
router.get('/:id/enrollment', async (req, res) => {
    const eventId = req.params.id;
    try {
        const enrollments = await getEventEnrollments(eventId);
        if (!enrollments) {
            return res.status(404).json({ message: 'No se encontraron inscripciones para este evento.' });
        }
        res.status(200).json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener eventos (con filtro de búsqueda)
router.get('/', async (req, res) => {
    const { name, category, startDate, endDate, page, pageSize } = req.query;

    try {
        const events = await searchEvents({ name, category, startDate, endDate, page, pageSize });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Inscribirse en un evento
router.post('/:id/enrollment', authenticateToken, async (req, res) => {
    let respuesta;
    const eventId = req.params.id;
    const userId = req.user.id;
    console.log("aasd")
    try {
        const enrollment = await enrollInEvent(eventId, userId);
        respuesta =res.status(201).json();
    } catch (error) {
        respuesta = res.status(error.status || 500).json({ message: error.message });
    }
    return respuesta;
});

// Cancelar inscripción en un evento
router.delete('/:id/enrollment', authenticateToken, async (req, res) => {
    const eventId = req.params.id;
    const userId = req.user.id;
    let respuesta;

    try {
        await removeEnrollment(eventId, userId);
         respuesta = res.status(200).json({ message: 'Inscripción cancelada correctamente.' });
    } catch (error) {
        respuesta = res.status(error.status || 500).json({ message: error.message });
    }
    return respuesta;
});

// Calificar un evento
router.patch('/:id/enrollment/:rating', authenticateToken, async (req, res) => {
    const eventId = req.params.id;
    const rating = req.params.rating;
    const userId = req.user.id;
    const { observations } = req.body;
    let respuesta;
    try {
        await rateEvent(eventId, userId, rating, observations);
        respuesta = res.status(200).json({ message: 'Evento rankeado correctamente.' });
    } catch (error) {
        respuesta = res.status(error.status || 500).json({ message: error.message });
    }
    return respuesta;
});

export default router;


