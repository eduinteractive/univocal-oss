import { APIError } from "./BaseError";

export class ForbiddenError extends APIError {
    constructor(message = "Forbidden", statusCode = 403, isOperational = true) {
        super("ForbiddenError", message, statusCode, isOperational);
    }
}