import express from "express";
import LocationService from "../services/location-service.js";
const router = express.Router();

const locationService = new LocationService();

// Endpoint GET /api/location
router.get("/", async (req, res) => {
    try {
        const locations = await locationService.getAllLocations();
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint GET /api/location/:id
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const location = await locationService.getLocationById(id);
        if (location) {
            res.status(200).json(location);
        } else {
            res.status(404).json({ message: "Location not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint GET /api/location/:id/event-location
router.get("/:id/event-location", async (req, res) => {
    const { id } = req.params;
    try {
        const eventLocations = await locationService.getEventLocationsByLocationId(id);
        if (eventLocations) {
            res.status(200).json(eventLocations);
        } else {
            res.status(404).json({ message: "Location not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
