import RedisProvider from "@/utils/redis.provider";
import { SessionRepository } from "./session.repository";
import { SessionService } from "./session.service";
import { Elysia } from "elysia";

const sessionRepository = new SessionRepository();
export const sessionService = new SessionService(
  sessionRepository,
  RedisProvider.getInstance({ host: "localhost", port: 6379 })
);
export const setupUsers = () => {
  return new Elysia().state(() => ({ sessionService }));
};
