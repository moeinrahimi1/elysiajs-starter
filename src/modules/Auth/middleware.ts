import { Context, Elysia, t } from "elysia";
import jwt from "jsonwebtoken";

import { env } from "@/config";
import RedisProvider from "@/utils/redis.provider";

const redis = RedisProvider.getInstance();


const checkToken = async ({ request, set }:Context) => {
  
  const authorization = request.headers.get("authorization");
  const version = request.headers.get("x-versioncode") || "1";
  const deviceType = request.headers.get("x-devicetype");
  if (!authorization) {
    set.status = 401;
    // console.log("hereeeeeeeeeee");
    return { message: "not authorized" };
  }

  const token = authorization.split(" ")[1];
  if (!token || token.length < 10) {
    set.status = 401;

    return {
      success: false,
      message: "no token in request",
      message_id: 110,
      statusCode: 401,
    };
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    const stat = await redis.get(`SESSION:${decoded.userId}:${token}`);
    // console.log(stat, `SESSION:${decoded.userId}:${token}`, decoded);
    if (!stat) {
      set.status = 401;
      return {
        success: false,
        message: "token expired",
        message_id: 110,
        statusCode: 401,
      };
    }

    request.user = {
      xToken: token,
      roles: decoded.roles,
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      token,
      version,
      deviceType,
    };
  } catch (error) {
    console.log("🚀 ~ app.onBeforeHandle ~ error:", error);
    set.status = 401;
    return { success: false, message: "token mismatch", statusCode: 401 };
  }
};
  

const isAdmin = (app: Elysia) =>
  app.onBeforeHandle(({ noToken, roles, set }) => {
    if (noToken) {
      set.status = 401;
      return {
        success: false,
        message: "client has no token in request",
        statusCode: 401,
      };
    }

    if (!roles?.includes("admin")) {
      set.status = 401;
      return {
        success: false,
        message: "not authorized, user is not admin",
        statusCode: 401,
      };
    }
  });

const isLoggedIn = (app: Elysia) =>
  app.onBeforeHandle(({ noToken, set }) => {
    if (noToken) {
      // console.log("🚀 ~ app.onBeforeHandle ~ noToken:", noToken)
      set.status = 401;
      return {
        success: false,
        message: "Unauthorized",
        data: null,
      };
    }
  });

const hasRole = (roles: string | string[]) => (app: Elysia) =>
  app.onBeforeHandle(({ roles: userRoles, set }) => {
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles?.includes(role)
    );

    if (!hasRequiredRole) {
      set.status = 401;
      return {
        success: false,
        message: `not authorized, need ${requiredRoles.join(", ")} role`,
        statusCode: 401,
      };
    }
  });

export { checkToken, isAdmin, isLoggedIn, hasRole };