import 'reflect-metadata';
import { defineConfig } from '@mikro-orm/mysql';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';

export default defineConfig({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,

  // Decoradores legacy + reflect-metadata (los tipos los emite tsc)
  metadataProvider: ReflectMetadataProvider,

  // Entidades en src/entities/. Node corre el JS compilado; el CLI puede usar los .ts
  entities: ['./dist/entities/**/*.js'],
  entitiesTs: ['./src/entities/**/*.ts'],

  debug: process.env.NODE_ENV !== 'production',
});
