import { env } from "@/config";
import Redis, { ClientContext } from "ioredis";

class RedisProvider {
  private static instance: RedisProvider;
  private client: Redis;

  private constructor(options: Redis.RedisOptions = {}) { 
    
  this.client = new Redis(env.REDIS_URI);
  
  
    this.client.on("error", (error) => {
      console.error("Redis Error:", error);
    });

    this.client.on("connect", () => {
      console.log("Successfully connected to Redis");
    });
    this.client.on("close", () => {
      console.log("Redis connection closed");
    });
  }

  public static getInstance(options?: Redis.RedisOptions): RedisProvider {
    if (!RedisProvider.instance) {
      RedisProvider.instance = new RedisProvider(options);
    }
    return RedisProvider.instance;
  }

  async set(
    key: string,
    value: string,
    expireTime?: number
  ): Promise<"OK" | null> {
    if (expireTime) {
      return this.client.set(key, value, "EX", expireTime);
    }
    return this.client.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hgetall(key: string): Promise<{ [key: string]: string }> {
    return this.client.hgetall(key);
  }

  async hdel(key: string, field: string): Promise<number> {
    return this.client.hdel(key, field);
  }

  async flushall(): Promise<"OK"> {
    return this.client.flushall();
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
  hmset(key: string, object: object): Promise<"OK"> {
    return this.client.hmset(key, object);
  }
  rpush(key: string, elements: (string | Buffer | number)){
    console.log(elements,'ssssssssssssss')
    return this.client.rpush(key, elements);
  }
  sadd(key: string, elements: (string | Buffer | number)){
    return this.client.sadd(key, elements);
  }
  hincrby(key: string, field: string,value:number){
    return this.client.hincrby(key, field,value);
  }
  scard(key: string){
    return this.client.scard(key);
  }
  sismember(key: string,member:string){
    return this.client.sismember(key,member);
  }
  lindex(key: string,member:string){
    return this.client.lindex(key,member);
  }
}

export default RedisProvider;
