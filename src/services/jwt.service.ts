import { v4 } from "uuid";
import { decode, JwtPayload, sign, verify } from "jsonwebtoken";
import { StringValue } from "ms";
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
  } {
    const jti = v4();

    const token = sign({ username }, this.jwtSecret, {
      expiresIn: this.tokenLifetime,
      issuer: this.tokenIssuer,
      subject: String(userId),
      jwtid: jti,
    });

    const { exp } = decode(token) as Payload;

    return {
      token,
      jti,
      expiration: new Date(exp! * 1000),
    };
  }

  public verify(token: string): Payload {
    try {
      const payload = verify(token, this.jwtSecret, {
        issuer: this.tokenIssuer,
      }) as Payload;

      return payload;
    } catch (error) {
      throw createHttpError(403, "Token inválido.");
    }
  }
}
