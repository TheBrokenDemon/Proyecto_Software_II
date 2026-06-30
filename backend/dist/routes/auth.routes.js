"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ── auth.routes.ts ────────────────────────────────────────────
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register); // S2-39
router.post('/login', auth_controller_1.login); // S2-40
router.post('/forgot-password', auth_controller_1.forgotPassword); // S2-63
router.post('/reset-password', auth_controller_1.resetPasswordController); // S2-63
exports.default = router;
