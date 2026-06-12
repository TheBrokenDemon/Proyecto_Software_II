import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            message: 'Datos inválidos. Revisa los campos e intenta nuevamente.',
            errors: errors.array().map((e: any) => ({ field: e.path, message: e.msg })),
        });
        return;
    }
    next();
};