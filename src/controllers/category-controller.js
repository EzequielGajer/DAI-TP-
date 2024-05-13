import express from "express";
import CategoryService from "../services/category-service.js";
const router = express.Router();

// Servicio para manejar las operaciones relacionadas con las provincias
const categoryService = new CategoryService();

// Endpoint GET /api/category
router.get("/", async (req, res) => {
    try {
        const category = await categoryService.getAllCategory();
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint GET /api/category/:id
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const category = await categoryService.getCategoryById(id);
        if (category) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: "Category not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint POST /api/category
router.post("/", async (req, res) => {
    const newCategory = req.body;
    try {
        const createdCategory = await categoryService.createCategory(newCategory);
        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Endpoint PUT /api/category
router.put("/", async (req, res) => {
    const updatedCategory = req.body;
    try {
        const result = await categoryService.updateCategory(updatedCategory);
        console.log(result);
        if (result === 1) {
            res.status(201).json({ message: "Category updated successfully" });
        } else {
            res.status(404).json({ message: "Category not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Endpoint DELETE /api/category/:id
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await categoryService.deleteCategory(id);
        if (result.deletedCount === 1) {
            res.status(200).json({ message: "Category deleted successfully" });
        } else {
            res.status(404).json({ message: "Category not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
