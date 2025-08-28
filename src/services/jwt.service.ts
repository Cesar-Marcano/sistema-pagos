import { User } from "@prisma/client";
import { v4 } from "uuid";
import { sign } from "jsonwebtoken";
import { StringValue } from "ms";

type TokenUserData = Omit<User, "password">;
type TokenData = TokenUserData & { jti: string };

export class JwtService {
  private readonly jwtSecret: string = process.env.JWT_SECRET;
  private readonly tokenLifetime: StringValue = process.env.TOKEN_LIFETIME as StringValue;
  private readonly tokenIssuer: string = process.env.TOKEN_ISSUER;

  public sign(userData: TokenUserData): string {
    const jti = v4();

    const paylaod: TokenData = { ...userData, jti };

    const token = sign(paylaod, this.jwtSecret, {
      expiresIn: this.tokenLifetime,
      issuer: this.tokenIssuer,
      subject: String(userData.id),
    });

    return token;
  }
}
