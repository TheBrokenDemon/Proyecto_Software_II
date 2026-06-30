"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserQueryBuilder = void 0;
// Patrón Builder — construye queries SQL de actualización dinámicamente
class UserQueryBuilder {
    constructor() {
        this.fields = [];
        this.values = [];
        this.idx = 1;
    }
    setFullName(name) {
        this.fields.push(`full_name = $${this.idx++}`);
        this.values.push(name.trim());
        return this;
    }
    setAge(age) {
        this.fields.push(`age = $${this.idx++}`);
        this.values.push(age);
        return this;
    }
    setGender(gender) {
        this.fields.push(`gender = $${this.idx++}`);
        this.values.push(gender);
        return this;
    }
    setTheme(theme) {
        this.fields.push(`theme = $${this.idx++}`);
        this.values.push(theme);
        return this;
    }
    build(userId) {
        if (this.fields.length === 0) {
            throw new Error('No se proporcionaron campos para actualizar.');
        }
        this.values.push(userId);
        return {
            query: `UPDATE users SET ${this.fields.join(', ')} WHERE id = $${this.idx} RETURNING id, full_name, email, age, gender, role`,
            values: this.values,
        };
    }
}
exports.UserQueryBuilder = UserQueryBuilder;
