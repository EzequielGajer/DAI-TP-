import CategoryRepository from "../repositories/category-repository.js";


class CategoryService {
    constructor() {
        this.categoryRepository = new CategoryRepository();
    }

    async getAllCategory() {
        return await this.categoryRepository.getAll();
    }

    async getCategoryById(id) {
        return await this.categoryRepository.getById(id);
    }

    async createCategory(category) {
        return await this.categoryRepository.create(category);
    }

    async updateCategory(category) {
        return await this.categoryRepository.update(category);
    }

    async deleteCategory(id) {
        return await this.categoryRepository.delete(id);
    }
}

export default CategoryService;
