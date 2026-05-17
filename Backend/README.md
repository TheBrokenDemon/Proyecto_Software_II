# MindCheck ULima — Backend API
**Stack:** Node.js · Express · PostgreSQL  
**Sprint 1 / Release 1**

---

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de entorno
cp .env.example .env
# → Edita .env con tus credenciales de PostgreSQL

# 3. Correr migraciones (en la carpeta /db-migrations)
psql -U postgres -d mindcheck_db -f run_all.sql

# 4. Iniciar servidor
npm run dev      # con hot reload
npm start        # producción
```

---

## Estructura del proyecto

```
src/
├── app.js                    # Punto de entrada
├── config/
│   └── db.js                 # Pool de conexión a PostgreSQL
├── middlewares/
│   ├── auth.middleware.js    # Verificación JWT
│   └── validate.middleware.js
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── emotional.routes.js
│   └── evaluation.routes.js
├── controllers/              # Reciben req/res, delegan al service
├── services/                 # Lógica de negocio + queries SQL
```

---

## Endpoints

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registrar nuevo usuario |
| POST | `/api/auth/login` | No | Iniciar sesión |
| POST | `/api/auth/logout` | Sí | Cerrar sesión |

**POST /api/auth/register**
```json
{
  "full_name": "Ana García",
  "email": "ana@ulima.edu.pe",
  "password": "mipassword123",
  "age": 21,
  "gender": "Femenino"
}
```

**POST /api/auth/login**
```json
{ "email": "ana@ulima.edu.pe", "password": "mipassword123" }
```
→ Retorna `{ token, user }`. Incluir el token en los siguientes requests:  
`Authorization: Bearer <token>`

---

### Perfil de usuario

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/users/profile` | Sí | Ver mi perfil |
| PATCH | `/api/users/profile` | Sí | Actualizar campos del perfil |

**PATCH /api/users/profile** (todos los campos son opcionales)
```json
{ "full_name": "Ana García López", "age": 22, "gender": "Femenino" }
```

---

### Registro emocional

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/emotional/emotions` | Sí | Lista de emojis disponibles |
| POST | `/api/emotional/records` | Sí | Guardar check-in emocional |
| GET | `/api/emotional/records` | Sí | Historial paginado |

**POST /api/emotional/records**
```json
{
  "stress_level": "alto",
  "emotion_emoji": "😰",
  "emotion_label": "Ansioso",
  "notes": "Tengo parciales esta semana"
}
```
→ Retorna el registro guardado + recomendaciones personalizadas.

**GET /api/emotional/records?page=1&limit=10**

---

### Dashboard — tipos de evaluación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/evaluations` | Sí | Tarjetas activas del dashboard |

---

## Lógica de recomendaciones

El motor de reglas funciona así:

| Estrés | Emoción | Nivel efectivo | Alerta psicología |
|--------|---------|---------------|-------------------|
| bajo | cualquiera | bajo | No |
| medio | cualquiera | medio | No |
| alto | positiva/neutral | alto | No |
| alto | 😩 😡 😰 😔 | **crítico** | **Sí** |

Se seleccionan 3 consejos aleatorios del banco de recomendaciones según el nivel efectivo.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| PORT | Puerto del servidor | 3000 |
| DB_HOST | Host de PostgreSQL | localhost |
| DB_PORT | Puerto de PostgreSQL | 5432 |
| DB_NAME | Nombre de la base | mindcheck_db |
| DB_USER | Usuario PostgreSQL | postgres |
| DB_PASSWORD | Contraseña | secreto |
| JWT_SECRET | Clave secreta JWT | clave_larga_aqui |
| JWT_EXPIRES_IN | Duración del token | 7d |
| BCRYPT_ROUNDS | Rounds de hash | 10 |
