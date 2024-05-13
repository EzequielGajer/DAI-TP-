import LocationRepository from "../repositories/location-repository.js";

class LocationService {
    constructor() {
        this.locationRepository = new LocationRepository();
    }

    async getAllLocations() {
        return await this.locationRepository.getAll();
    }

    async getLocationById(id) {
        return await this.locationRepository.getById(id);
    }

    async getEventLocationsByLocationId(id) {
        return await this.locationRepository.getEventLocationsByLocationId(id);
    }
}

export default LocationService;
