import { Request, Response, NextFunction } from "express";
import { APIError } from "../errors/BaseError";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof APIError) {
        res.status(err.statusCode).json({
            error: {
                name: err.name,
                message: err.message,
                statusCode: err.statusCode,
                operational: err.isOperational,
            }
        });
    } else {
        console.error(err);
        res.status(500).json({
            error: {
                name: 'InternalServerError',
                message: 'Ein interner Fehler ist aufgetreten. Versuche es später erneut.',
                statusCode: 500,
                operational: false,
            }
        });
    }
}