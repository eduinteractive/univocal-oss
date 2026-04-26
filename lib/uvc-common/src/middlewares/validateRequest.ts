import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { BadRequestError } from "../errors/BadRequestError";

export const validateRequestSchema = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const validationResultData = validationResult(req);
	if (!validationResultData.isEmpty()) {
		const err = new BadRequestError(validationResultData.array().map((e) => e.msg).toString());
		return next(err);
	}
	next();
};