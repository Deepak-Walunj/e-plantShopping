class StandardResponse {
    constructor(success = true, message = null, data = null) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}

export {
    StandardResponse
}