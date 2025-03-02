import { env } from "@/config";
import { Client } from "minio";

export const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  useSSL: true,
  accessKey: env.MINIO_KEY,
  secretKey: env.MINIO_SECRET,
});
