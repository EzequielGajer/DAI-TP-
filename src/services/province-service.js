import ProvinceRepository from "../repositories/province-repository.js";

class ProvinceService {
    constructor() {
        this.provinceRepository = new ProvinceRepository();
    }

    async getAllProvinces() {
        return await this.provinceRepository.getAll();
    }

    async getProvinceById(id) {
        return await this.provinceRepository.getById(id);
    }

    async createProvince(province) {
        return await this.provinceRepository.create(province);
    }

    async updateProvince(province) {
        return await this.provinceRepository.update(province);
    }

    async deleteProvince(id) {
        return await this.provinceRepository.delete(id);
    }
}

export default ProvinceService;
