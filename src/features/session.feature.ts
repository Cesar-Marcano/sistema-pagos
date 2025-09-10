import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { Session } from "@prisma/client";
import { ExtendedPrisma } from "../config/container";

@injectable()
export class SessionFeature {
  constructor(
    @inject(TYPES.Prisma)
    private readonly prisma: ExtendedPrisma
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

  public async sessionExists(jti: string, userId: number): Promise<boolean> {
    return (
      (await this.prisma.session.count({
        where: {
          jti,
          userId
        },
      })) > 0
    );
  }
}
