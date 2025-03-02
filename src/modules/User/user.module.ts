import { UsersRepository } from "./user.repository";
import { UsersService } from "./user.service";
import { Elysia } from "elysia";
import { SMSProvider } from "@/utils/sms.provider";
import { JwtProvider } from "../Auth/jwt.provider";
import { SessionService } from "../Session/session.service";
import { sessionService } from "../Session/session.module";
import RedisProvider from "@/utils/redis.provider";
import { roleRepository } from "../Role/role.module";

export const usersRepository = new UsersRepository();
const smsProvider = new SMSProvider();

const jwtProvider = new JwtProvider();
export const usersService = new UsersService(
  usersRepository,
  roleRepository,
  smsProvider,
  jwtProvider,
  sessionService,
  RedisProvider.getInstance({ host: "localhost", port: 6379 })
);
export const setupUsers = () => {
  return new Elysia().state(() => ({ usersService }));
};
