import { APIError } from "./BaseError";

export class AuthentificationError extends APIError {
    constructor(message = "Authentification error", statusCode = 401, isOperational = true) {
        super("AuthentificationError", message, statusCode, isOperational);
    }
}