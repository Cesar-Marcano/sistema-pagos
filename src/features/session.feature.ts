import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { PrismaClient, Session } from "@prisma/client";
import ms, { StringValue } from "ms";

@injectable()
export class SessionFeature {
  constructor(
    @inject(TYPES.Prisma)
    private readonly prisma: PrismaClient
  ) {}

  public async createSession(
    userId: number,
    jti: string,
    expiration: Date
  ): Promise<Session> {
    return await this.prisma.session.create({
      data: {
        jti,
        expiration,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  public async deleteSession(userId: number, jti: string) {
    return await this.prisma.session.delete({
      where: {
        jti,
        user: {
          id: userId,
        },
      },
    });
  }
}
