// users.service.ts
// in charge of business logic - generate slug, fetch data from other services, cache something, etc.
import { NotFoundError } from "elysia";
import { UsersRepository } from "./user.repository";
import { customAlphabet, nanoid } from "nanoid";
import { RoleRepository } from "./role.repository";
import { SMSProvider } from "@/utils/sms.provider";
import { IUser, marketEnum } from "./user.entity";
import { request } from "undici";
import { JwtProvider } from "../Auth/jwt.provider";
import { SessionService } from "../Session/session.service";
import UAParser from "ua-parser-js";
import RedisProvider from "@/utils/redis.provider";
import { env } from "@/config";
import { UpdateQuery } from "mongoose";
import { UserDTO } from "./user.dto";

export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly roleRepository: RoleRepository,
    private readonly smsProvider: SMSProvider,
    private readonly jwtProvider: JwtProvider,
    private readonly sessionService: SessionService,
    private readonly redisProvider: RedisProvider
  ) {
  }
  generateReferralCode() {
    const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);
    return nanoid();
  }
  random5Digit() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }
  getNowTimestamp() {
    let date = new Date();
    return Math.round(date.getTime() / 1000);
  }

  loginExpirationTime = (timeInseconds: number) => {
    let date = new Date();
    let now = Math.round(date.getTime() / 1000);
    let expireTime = now + timeInseconds;
    return expireTime;
  };
  getPassword() {
    let expireSeconds = 60;
    let expireTime = this.loginExpirationTime(expireSeconds);
    let pass = this.random5Digit();
    if (process.env.NODE_ENV != "production") pass = "1111";
    return { pass, expireTime };
  }
  async createUserIfNotExists(
    phoneNumber: string,
    market: marketEnum,
    isGoogle = false
  ) {
    let newUser = true;
    let where: Partial<Pick<IUser, "phoneNumber" | "email">> = {
      phoneNumber: phoneNumber,
    };
    if (isGoogle) {
      where = { email: phoneNumber };
    }
    let user = await this.repository
      .where(where)
      .populate([{ path: "roles", select: "name" }])
      .findOne();
    let a = await this.generateReferralCode();

    if (!user) {
      let role = await this.roleRepository.findOne({ name: "user" });
      console.log("🚀 ~ UsersService ~ createUserIfNotExists ~ role:", role);
      user = await this.repository.create({
        // phoneNumber: phoneNumber,
        ...where,
        roles: role._id,
        market: market,
        referralCode: String(a),
      });
      await user.populate(["roles"]);
    }
    return { user, newUser };
  }
  async otp(phoneNumber: string, market: marketEnum) {
    console.log("🚀 ~ UsersService ~ otp ~ phoneNumber:", phoneNumber, market);
    // let result = await utils.bruteForceCheck(ip, 'SEND_SMS');
    // if (result.statusCode) return result;
    phoneNumber = phoneNumber.trim();
    let checkMobile = phoneNumber.match(/^0?9[0-9]{9}$/);
    if (!checkMobile) {
      throw "mobileIsWrong";
      // {
      //   success: false,ل اشتباه است',
      //   statusCode: 400,
      //   message: 'شماره موبای
      // };
    }
    let { pass, expireTime } = this.getPassword();
    let { user, newUser } = await this.createUserIfNotExists(
      phoneNumber,
      market
    );
    let now = this.getNowTimestamp();

    // if (user.phoneNumberExpire > now) throw 'codeAlreadySent';
    // return {
    //   statusCode: 400,
    //   success: false,
    //   message: 'کد ورود ارسال شده است',
    // };
    user.phoneNumberPassword = pass;
    user.phoneNumberExpire = expireTime;
    user.market = market;

    this.smsProvider.sendSMS(user.phoneNumber, pass, "sms");

    user.lastAppOpened = new Date();
    await user.save();
    return {
      message: "کد عبور برایتان ارسال شد",
      newUser: newUser,
    };
  }
  async google(
    accessToken: string,
    market: marketEnum,
    userAgentHeader: string,
    appVersion: string
  ) {
    const { statusCode, headers, trailers, body } = await request(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`
    );

    console.log("response received", statusCode);

    let result = await body.json();
    console.log("🚀 ~ UsersService ~ google ~ body:", result);
    if (statusCode != 200) throw new Error("google failed");
    let isGoogle = true;
    const { name, picture, email } = result;
    let { user, newUser } = await this.createUserIfNotExists(
      email,
      market,
      isGoogle
    );
    user.market = market;
    user.lastAppOpened = new Date();
    user.name = name;
    user.avatar = picture;
    user.save();
    user = user.toJSON();
    user.roles = user.roles.map((role) => role.name);

    let jsonWebToken = {
      phoneNumber: user.phoneNumber,
      email: user.email,
      userId: user._id,
      roles: user.roles,
    };

    const token = await this.jwtProvider.sign(jsonWebToken);
    let { refreshToken, refreshTokenExpire } = this.getRefreshToken();
    const parser = new UAParser(userAgentHeader);
    console.log(
      parser.getResult(),
      "wwwwwwww",
      parser.getDevice(),
      parser.getOS()
    );
    await this.sessionService.create({
      token: token,
      refreshToken: refreshToken,
      refreshTokenExpire: refreshTokenExpire,
      expireAt: new Date(refreshTokenExpire * 1000),
      user: user._id,
      agent: parser.getDevice().model || parser.getBrowser().name,
      // deviceId: deviceId,
      deviceType: parser.getOS().name,
      appVersion: appVersion,
      deviceVersion: parser.getDevice().vendor || parser.getBrowser().version,
    });

    const a = await this.redisProvider.set(
      `SESSION:${user._id}:${token}`,
      token,
      Number(env.JWT_EXPIRE)
    );
    console.log(a, "aaaaaaaaaaaaaaaaaaaaaa", `SESSION:${user._id}:${token}`);
    return {
      token: token,
      refreshToken: refreshToken,
      user: user,
      newUser: newUser,
    };
  }
  getRefreshToken() {
    let refreshToken = nanoid();
    let now = new Date();
    // let refreshTokenExpire = Math.round(
    //   new Date(now.setMinutes(now.getMinutes() + 3)) / 1000,
    // );
    let refreshTokenExpire = Math.round(
      new Date(now.setMonth(now.getMonth() + 3)) / 1000
    );
    return { refreshToken, refreshTokenExpire };
  }

  async login(email: string, password: string) {
    const user = await this.repository.login(email, password);
    if (!user) throw new NotFoundError();
    return user;
  }

  async get(userId: string) {
    return this.repository.findById(userId);
  }

  async guest(market: marketEnum, userAgentHeader: string, appVersion: string) {
    
    const name = "ali"
    const referralCode = this.generateReferralCode();
    let role = await this.roleRepository.findOne({ name: "user" });
    let user = await this.repository.create({
      is_guest: true,
      name: name,
      referralCode: referralCode,
      roles: role._id,
    });
    user.market = market;
    user.lastAppOpened = new Date();
    user.name = name;
    // user.avatar = await generateDiceBearAvatar();
    user.save();

    let jsonWebToken = {
      phoneNumber: user.phoneNumber,
      email: user.email,
      userId: user._id,
      roles: [role.name],
    };

    const token = await this.jwtProvider.sign(jsonWebToken);
    let { refreshToken, refreshTokenExpire } = this.getRefreshToken();
    const parser = new UAParser(userAgentHeader);
    console.log(
      parser.getResult(),
      "wwwwwwww",
      parser.getDevice(),
      parser.getOS()
    );
    await this.sessionService.create({
      token: token,
      refreshToken: refreshToken,
      refreshTokenExpire: refreshTokenExpire,
      expireAt: new Date(refreshTokenExpire * 1000),
      user: user._id,
      agent: parser.getDevice().model || parser.getBrowser().name,
      // deviceId: deviceId,
      deviceType: parser.getOS().name,
      appVersion: appVersion,
      deviceVersion: parser.getDevice().vendor || parser.getBrowser().version,
    });

    this.redisProvider.set(
      `SESSION:${user._id}:${token}`,
      "1",
      Number(env.JWT_EXPIRE)
    );

    return { user, access_token: token, refresh_token: refreshToken };
  }

  async refreshToken(authorization: string, refreshToken: string) {
    let xToken = authorization.split(" ")[1];
    console.log("🚀 ~ UsersService ~ refreshToken ~ xToken:", xToken);
    if (!xToken || 10 > xToken.length) throw "tokenIsInvalid";
    let { userId } = await this.jwtProvider.verify(xToken, {
      ignoreExpiration: true,
    });
    let now = this.getNowTimestamp();
    let session = await this.sessionService.find({
      refreshToken,
      user: userId,
      token: xToken,
    });
    if (!session || now > session.refreshTokenExpire * 1000) {
      throw new Error("tokenIsExpired");
    }
    let populate = [{ path: "roles", select: "name" }];
    let user = await this.repository
      .where({ _id: userId })
      .populate(populate)
      .select("username")
      .findOne();

    if (!user) {
      return { message: "no such user", statusCode: 401 };
    }
    user = user.toJSON();
    user.roles = user.roles.map((role) => role.name);
    let jsonWebToken = {
      username: user.username,
      email: user.email,
      userId: user._id,
      roles: user.roles,
    };
    let refTokenData = this.getRefreshToken();
    let newToken = await this.jwtProvider.sign(jsonWebToken);
    let fields = {
      token: newToken,
      refreshToken: refTokenData.refreshToken,
      refreshTokenExpire: refTokenData.refreshTokenExpire,
    };
    session = Object.assign(session, fields);
    await session.save();

    this.redisProvider.set(
      `SESSION:${user._id}:${newToken}`,
      "1",
      Number(env.JWT_EXPIRE)
    );
    this.redisProvider.del(`SESSION:${user._id}:${xToken}`);
    return {
      token: newToken,
      refreshToken: refTokenData.refreshToken,
    };
  }
  findById(id: string) {
    return this.repository.findById(id);
  }
  update(id: string, body: UpdateQuery<IUser>) {
    return this.repository.where({ _id: id }).updateOne(body, { new: true });
  }
  async find(page: number, limit: number, filter, sort) {
    const count = await this.repository.where(filter).count();
    const docs = await this.repository
      .where(filter)
      .sort(sort)
      .skip(page)
      .limit(limit)
      .findAll();
    return {
      count,
      docs,
    };
  }
  create(body: UserDTO) {
    const referralCode = this.generateReferralCode();
    body.referralCode = referralCode;
    return this.repository.create(body);
  }

  async findByUsername(username: string) {
    return this.repository.where({ username }).findOne();
  }
  async linkGoogle(_id: string, accessToken: string) {
    const { statusCode, headers, trailers, body } = await request(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );
    
    
    console.log("response received", statusCode);

    let result = await body.json();
    console.log("🚀 ~ UsersService ~ google ~ body:", result);
    if (statusCode != 200) throw new Error("google failed");
    const { name, picture, email } = result;
    const exists = await this.repository.where({ email }).findOne();
    if (exists) {
      throw new Error("email already exists");
    }
    const user = await this.update(_id, {
      name,
      avatar: picture,
      email: email,
      is_guest: false,
    });
    return user;
  }
}
