import type { Request, Response, NextFunction } from "express";
import type { Schema } from "joi";
import { ValidationError } from "../errors/ValidationError.error";

/**
 * Middleware to validate request body against a Joi schema
 */
export const validateRequest = (schema: Schema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true, // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map((detail: any) => ({
                message: detail.message,
                path: detail.path.join("."),
            }));
            throw new ValidationError(errors);
        }

        // Replace req.body with validated and sanitized value
        req.body = value;
        next();
    };
};
