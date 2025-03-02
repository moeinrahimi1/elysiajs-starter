import RedisProvider from "@/utils/redis.provider";
import { ISession } from "./session.entity";
import { SessionRepository } from "./session.repository";

export class SessionService {
  constructor(
    private readonly repository: SessionRepository,
    private readonly redisProvider: RedisProvider
  ) {}
  async create(body: Partial<ISession>) {
    console.log("🚀 ~ SessionService ~ create ~ body:", body);
    return this.repository.create(body);
  }

  checkSession(userId: string, token: string) {
    let key = `SESSION:${userId}:${token}`;
    return this.redisProvider.get(key);
  }
  find(where: Partial<ISession>) {
    return this.repository.findOne(where);
  }
  update(where: Partial<ISession>, body: Partial<ISession>) {
    return this.repository.updateOne(where, body);
  }
}
