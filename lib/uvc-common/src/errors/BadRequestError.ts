import { APIError } from './BaseError';

export class BadRequestError extends APIError {
    constructor(message = 'Bad request', statusCode = 400, isOperational = true) {
        super('BadRequestError', message, statusCode, isOperational);
    }
}