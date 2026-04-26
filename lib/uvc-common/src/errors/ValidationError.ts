import { APIError } from "./BaseError";

export class ValidationError extends APIError {
    constructor(message = "Validation error", statusCode = 400, isOperational = true) {
        super("ValidationError", message, statusCode, isOperational);
    }
}