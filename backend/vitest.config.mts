import { defineConfig } from 'vitest/config';

// Los tests usan la base de prueba `<DB_NAME>_test` y se ejecutan dentro del contenedor del backend, que ya tiene las
// variables de entorno: `docker compose exec backend npm test` (convenciones, sección 11).
if (!process.env.DB_NAME) {
  throw new Error('Variables de entorno ausentes. Ejecutar los tests con: docker compose exec backend npm test');
}
process.env.NODE_ENV = 'test';
if (!process.env.DB_NAME.endsWith('_test')) process.env.DB_NAME = `${process.env.DB_NAME}_test`;

export default defineConfig({
  // Decoradores legacy con metadata de tipos, igual que tsc (MikroORM usa ReflectMetadataProvider)
  oxc: { decorator: { legacy: true, emitDecoratorMetadata: true } },
  test: {
    include: ['test/**/*.test.ts'],
    globalSetup: ['test/apoyo/global.ts'],
    // Todos los archivos comparten la base de prueba
    fileParallelism: false,
  },
});
