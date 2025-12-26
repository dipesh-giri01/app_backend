import type { Request, Response, NextFunction } from "express";

const allowedImageMimeTypes = ["image/jpeg", "image/png", "image/svg+xml"];

export function validateImageFile(req: Request, res: Response, next: NextFunction) {
    const file = (req as any).file;
    if (file) {
        if (!allowedImageMimeTypes.includes(file.mimetype)) {
            return res.status(400).json({
                code: 400,
                status: "BADREQUEST",
                message: `Invalid image type. Allowed types: jpg, png, svg`,
                data: null
            });
        }
    }
    next();
}
