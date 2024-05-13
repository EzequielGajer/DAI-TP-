import express from "express";
import EnrollmentService from "../services/enrollment-service.js";
const router = express.Router();

const enrollmentService = new EnrollmentService();

// Endpoint POST /api/event/:id/enrollment
router.post("/:id/enrollment", async (req, res) => {
    const eventId = req.params.id;
    const userId = req.body.userId; // Suponiendo que el ID del usuario se envía en el cuerpo de la solicitud
    try {
        const result = await enrollmentService.enrollUserToEvent(eventId, userId);
        if (result.success) {
            res.status(201).json({ message: "User enrolled to event successfully" });
        } else {
            res.status(400).json({ message: result.error });
        }
    } catch (error) {
        res.status(404).json({ message: "Event not found" });
    }
});

// Endpoint DELETE /api/event/:id/enrollment
router.delete("/:id/enrollment", async (req, res) => {
    const eventId = req.params.id;
    const userId = req.body.userId; // Suponiendo que el ID del usuario se envía en el cuerpo de la solicitud
    try {
        const result = await enrollmentService.removeUserFromEvent(eventId, userId);
        if (result.success) {
            res.status(200).json({ message: "User removed from event successfully" });
        } else {
            res.status(400).json({ message: result.error });
        }
    } catch (error) {
        res.status(404).json({ message: "Event not found" });
    }
});

export default router;
