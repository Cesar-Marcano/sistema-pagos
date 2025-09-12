import { v4 } from "uuid";
import {
  decode,
  JwtPayload,
  sign,
  TokenExpiredError,
  verify,
} from "jsonwebtoken";
import ms, { StringValue } from "ms";
import { injectable } from "inversify";
import createHttpError from "http-errors";
import { env } from "../config/env";

export type TokenUserData = { username: string };

export type Payload = TokenUserData & JwtPayload;

export interface ITokenService {
  sign(
    username: string,
    userId: number
  ): {
    token: string;
    jti: string;
    expiration: Date;
    now: Date;
  };
  verify(token: string): Payload;
}

@injectable()
export class JwtService implements ITokenService {
  private readonly jwtSecret: string = env.JWT_SECRET;
  private readonly tokenLifetime: StringValue =
    env.TOKEN_LIFETIME as StringValue;
  private readonly tokenIssuer: string = env.TOKEN_ISSUER;

  public sign(
    username: string,
    userId: number
  ): {
    token: string;
    jti: string;
    expiration: Date;
    now: Date;
  } {
    const jti = v4();
    const now = Math.floor(Date.now() / 1000);
    const exp = now + Math.floor(ms(this.tokenLifetime) / 1000);

    const token = sign({ username, iat: now, exp }, this.jwtSecret, {
      issuer: this.tokenIssuer,
      subject: String(userId),
      jwtid: jti,
    });

    return {
      token,
      jti,
      expiration: new Date(exp * 1000),
      now: new Date(now * 1000),
    };
  }

  public verify(token: string): Payload {
    try {
      const payload = verify(token, this.jwtSecret, {
        issuer: this.tokenIssuer,
      }) as Payload;

      return payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw createHttpError(401, "Token expirado.");
      }
      throw createHttpError(403, "Token inválido.");
    }
  }
}
