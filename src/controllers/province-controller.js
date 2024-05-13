import express from "express";
import ProvinceService from "../services/province-service.js";
const router = express.Router();

// Servicio para manejar las operaciones relacionadas con las provincias
const provinceService = new ProvinceService();

// Endpoint GET /api/province
router.get("/", async (req, res) => {
    try {
        const provinces = await provinceService.getAllProvinces();
        res.status(200).json(provinces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint GET /api/province/:id
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const province = await provinceService.getProvinceById(id);
        if (province) {
            res.status(200).json(province);
        } else {
            res.status(404).json({ message: "Province not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint POST /api/province
router.post("/", async (req, res) => {
    const newProvince = req.body;
    try {
        const createdProvince = await provinceService.createProvince(newProvince);
        res.status(201).json(createdProvince);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Endpoint PUT /api/province
router.put("/", async (req, res) => {
    const updatedProvince = req.body;
    try {
        const result = await provinceService.updateProvince(updatedProvince);
        if (result.modifiedCount === 1) {
            res.status(201).json({ message: "Province updated successfully" });
        } else {
            res.status(404).json({ message: "Province not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Endpoint DELETE /api/province/:id
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await provinceService.deleteProvince(id);
        if (result.deletedCount === 1) {
            res.status(200).json({ message: "Province deleted successfully" });
        } else {
            res.status(404).json({ message: "Province not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
