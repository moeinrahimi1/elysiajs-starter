import { env } from "@/config";
import jwt, { VerifyOptions } from "jsonwebtoken";

export class JwtProvider {
  sign(payload:Record<string,any>, expiresIn = "30d") {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn });
  }
  verify(token:string, options:VerifyOptions = {}) {
    return jwt.verify(token, env.JWT_SECRET, options);
  }
}
