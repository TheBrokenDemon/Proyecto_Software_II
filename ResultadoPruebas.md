> mindcheck-backend@2.0.0 test
> jest

 PASS  src/__tests__/appointmentRequest.service.test.ts
  HU-73: respondRequest (Unidad de Caja Blanca)
    √ P1: retorna null cuando la solicitud no existe (D1=T) (7 ms)
    √ P2: estado 'rechazada' no dispara la lógica de asignación (D2a=F, D2b=F) (2 ms)
    √ P3: rechaza con 409 si el estudiante ya está asignado a OTRO psicólogo (D3a=T, D3b=T) (1 ms)
    √ P4: no reasigna ni valida cupo si el estudiante ya es del MISMO psicólogo (D3a=T, D3b=F, D4=F) (1 ms)
    √ P5: rechaza con 409 al alcanzar el cupo máximo de 6 estudiantes (D4=T, D5=T) (1 ms)
    √ P6 (happy path): asigna al estudiante cuando hay cupo disponible con status="confirmada" (D4=T, D5=F) (1 ms)
    √ P7: asigna al estudiante con status='reprogramada', cubriendo el 2do operando del OR (D2a=F, D2b=T, D4=T, D5=F) (1 ms)
    √ P8: no reasigna con status='reprogramada' cuando ya es del mismo psicólogo (D2a=F, D2b=T, D3a=T, D3b=F, D4=F)

 PASS  src/__tests__/mood.controller.test.ts
  POST /api/mood/checkins — caja negra (particiones y valores límite)
    √ mood = 0 (límite inválido inferior) -> 400 (7 ms)
    √ mood = 1 (límite válido inferior) -> 201
    √ mood = 4 (límite válido superior) -> 201
    √ mood = 5 (límite inválido superior) -> 400 (1 ms)
    √ mood = 2.5 (no entero) -> 400 (1 ms)
    √ mood ausente -> 400
    √ note de 500 caracteres (límite válido) -> 201 (1 ms)
    √ note de 501 caracteres (límite inválido) -> 400 (1 ms)
    √ note numérica (tipo inválido) -> 400 (2 ms)
    √ sin note (opcional) -> 201 (1 ms)

 PASS  src/__tests__/mood.streak.test.ts
  computeStreak — caja blanca (cobertura de ramas)
    √ R1: sin registros -> racha 0 (8 ms)
    √ R1: sin registro hoy ni ayer (último hace 3 días) -> racha 0 (1 ms)
    √ R3: registró solo hoy -> racha 1
    √ R2: no registró hoy pero sí ayer -> la racha se conserva (1)
    √ R4: hoy + ayer + antier consecutivos -> racha 3
    √ R2+R4: sin hoy, pero ayer y antier consecutivos -> racha 2
    √ R5: hueco corta la racha (hoy, ayer, y salto a hace 3 días) -> racha 2
    √ R4: orden de entrada no importa (usa Set) -> racha 3
    √ R4: fechas duplicadas no inflan la racha -> racha 2

Test Suites: 3 passed, 3 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        4.93 s
Ran all test suites.

C:\Users\mhuay\OneDrive\Documentos\ProyectoFinalIngSoftware\Proyecto_Software_II\backend>npm run test:vitest

> mindcheck-backend@2.0.0 test:vitest
> vitest run


 RUN  v4.1.10 C:/Users/mhuay/OneDrive/Documentos/ProyectoFinalIngSoftware/Proyecto_Software_II/backend

 ✓ src/__tests__/psychologist-assignment.vitest.ts (3 tests) 75ms
   ✓ HU-73: Asignación de Estudiantes y Confidencialidad (Integración) (3)
     ✓ TC1: Debería asignar estudiante al confirmar cita (200 OK) 59ms
     ✓ TC2: Debería rechazar si el psicólogo alcanzó el cupo máximo (409 Conflict) 8ms
     ✓ TC3: Debería denegar acceso a estudiante asignado a otro (403 Forbidden) 6ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  20:26:33
   Duration  1.56s (transform 376ms, setup 0ms, import 1.13s, tests 75ms, environment 0ms)


C:\Users\mhuay\OneDrive\Documentos\ProyectoFinalIngSoftware\Proyecto_Software_II\backend>npx jest src/__tests__/appointmentRequest.service.test.ts
 PASS  src/__tests__/appointmentRequest.service.test.ts
  HU-73: respondRequest (Unidad de Caja Blanca)
    √ P1: retorna null cuando la solicitud no existe (D1=T) (4 ms)
    √ P2: estado 'rechazada' no dispara la lógica de asignación (D2a=F, D2b=F) (2 ms)
    √ P3: rechaza con 409 si el estudiante ya está asignado a OTRO psicólogo (D3a=T, D3b=T) (2 ms)
    √ P4: no reasigna ni valida cupo si el estudiante ya es del MISMO psicólogo (D3a=T, D3b=F, D4=F) (2 ms)
    √ P5: rechaza con 409 al alcanzar el cupo máximo de 6 estudiantes (D4=T, D5=T) (2 ms)
    √ P6 (happy path): asigna al estudiante cuando hay cupo disponible con status="confirmada" (D4=T, D5=F) (1 ms)
    √ P7: asigna al estudiante con status='reprogramada', cubriendo el 2do operando del OR (D2a=F, D2b=T, D4=T, D5=F) (1 ms)
    √ P8: no reasigna con status='reprogramada' cuando ya es del mismo psicólogo (D2a=F, D2b=T, D3a=T, D3b=F, D4=F) (1 ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        2.274 s, estimated 4 s
Ran all test suites matching src/__tests__/appointmentRequest.service.test.ts.