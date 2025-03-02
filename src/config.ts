import { Type } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

const envSchema = Type.Object({
  PORT: Type.String(),
  DATABASE_URI: Type.String(),
  JWT_SECRET: Type.String(),
  JWT_EXPIRE: Type.String(),
  KAVE_NEGAR: Type.String(),
  SOCKET_PORT: Type.String(),
  SIMILAR_API: Type.String(),
  REDIS_URI: Type.String(),
  MINIO_KEY: Type.String(),
  MINIO_SECRET: Type.String(),
  MINIO_ENDPOINT: Type.String(),
  CDN_URL: Type.String(),
  BUCKET_NAME: Type.String(),
});
if (!Value.Check(envSchema, Bun.env)) throw new Error('Invalid env variables');
export const env = Value.Cast(envSchema, Bun.env);
