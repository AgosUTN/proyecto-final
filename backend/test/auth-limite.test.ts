import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { usarContextoDePrueba } from './apoyo/contexto';
import { crearUsuario } from './apoyo/datos';

// Archivo propio: Vitest aísla cada archivo, así que el contador del límite empieza en cero.
describe('Límite de intentos de inicio de sesión', () => {
  const contexto = usarContextoDePrueba();

  it('responde 429 DEMASIADOS_INTENTOS a partir del intento fallido número 11', async () => {
    await crearUsuario(contexto.orm);
    const intentar = () =>
      request(contexto.app).post('/api/auth/login').send({ nombreUsuario: 'prueba', contrasena: 'Incorrecta.1' });

    for (let intento = 1; intento <= 10; intento++) {
      expect((await intentar()).status).toBe(401);
    }
    const { status, body } = await intentar();
    expect(status).toBe(429);
    expect(body).toEqual({
      status: 429,
      code: 'DEMASIADOS_INTENTOS',
      mensaje: 'Se superó el límite de intentos de inicio de sesión. Es posible volver a intentarlo dentro de 15 minutos.',
    });
  });
});
