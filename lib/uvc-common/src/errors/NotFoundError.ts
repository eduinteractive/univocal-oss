import { APIError } from "./BaseError";

export class NotFoundError extends APIError {
    constructor(message = "Not found", statusCode = 404, isOperational = true) {
        super("NotFoundError", message, statusCode, isOperational);
    }
}