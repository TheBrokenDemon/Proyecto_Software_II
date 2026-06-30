"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            message: 'Datos inválidos. Revisa los campos e intenta nuevamente.',
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
