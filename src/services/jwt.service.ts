import { PrismaClient, User } from "@prisma/client";
import { v4 } from "uuid";
import { sign, verify } from "jsonwebtoken";
import { StringValue } from "ms";
import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import createHttpError from "http-errors";

type TokenUserData = Omit<User, "password">;

interface ITokenService {
  sign(userData: TokenUserData): { token: string; jti: string };
  verify(token: string): TokenUserData & { jti: string };
}

@injectable()
export class JwtService implements ITokenService {
  private readonly jwtSecret: string = process.env.JWT_SECRET;
  private readonly tokenLifetime: StringValue = process.env
    .TOKEN_LIFETIME as StringValue;
  private readonly tokenIssuer: string = process.env.TOKEN_ISSUER;

  public sign(userData: TokenUserData): { token: string; jti: string } {
    const jti = v4();

    const token = sign(userData, this.jwtSecret, {
      expiresIn: this.tokenLifetime,
      issuer: this.tokenIssuer,
      subject: String(userData.id),
      jwtid: jti,
    });

    return { token, jti };
  }

  public verify(token: string): TokenUserData & { jti: string } {
    try {
      const payload = verify(token, this.jwtSecret, {
        issuer: this.tokenIssuer,
      }) as TokenUserData & { jti: string };

      return payload;
    } catch (error) {
      throw createHttpError(403, "Token inválido.");
    }
  }
}
