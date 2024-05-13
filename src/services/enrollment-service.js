import EnrollmentRepository from "../repositories/enrollment-repository.js";

class EnrollmentService {
    constructor() {
        this.enrollmentRepository = new EnrollmentRepository();
    }

    async enrollUserToEvent(eventId, userId) {
        return await this.enrollmentRepository.enrollUserToEvent(eventId, userId);
    }

    async removeUserFromEvent(eventId, userId) {
        return await this.enrollmentRepository.removeUserFromEvent(eventId, userId);
    }
}

export default EnrollmentService;
