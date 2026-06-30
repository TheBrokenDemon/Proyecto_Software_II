// Patrón Builder — construye queries SQL de actualización dinámicamente
export class UserQueryBuilder {
  private fields: string[] = [];
  private values: any[]   = [];
  private idx: number     = 1;

  setFullName(name: string): this {
    this.fields.push(`full_name = $${this.idx++}`);
    this.values.push(name.trim());
    return this;
  }

  setAge(age: number): this {
    this.fields.push(`age = $${this.idx++}`);
    this.values.push(age);
    return this;
  }

  setGender(gender: string): this {
    this.fields.push(`gender = $${this.idx++}`);
    this.values.push(gender);
    return this;
  }

  setTheme(theme: string): this {
    this.fields.push(`theme = $${this.idx++}`);
    this.values.push(theme);
    return this;
  }

  build(userId: string): { query: string; values: any[] } {
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