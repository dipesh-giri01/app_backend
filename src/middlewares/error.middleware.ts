import type { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/CustomError.error.js";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): Response => {
    // Debug: log error and prototype chain
    console.error("[Error Handler] Error:", err);
    console.error("[Error Handler] Error name:", err.name);
    console.error("[Error Handler] Error instanceof CustomError:", err instanceof CustomError);
    console.error("[Error Handler] Error prototype:", Object.getPrototypeOf(err));
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            // data: null,
            message: err.message,
            status: err.name.replace("Error", "").toUpperCase(),
            code: err.statusCode,
            options: {
                errors: err.serializeErrors(),
            },
        });
    }

    // Handle unknown errors
    return res.status(500).json({
        // data: null,
        message: "Internal Server Error",
        status: "INTERNAL_SERVER_ERROR",
        code: 500,
        options: {
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
        },
    });
};
