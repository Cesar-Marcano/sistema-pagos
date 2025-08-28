import { inject } from "inversify";
import { TYPES } from "../config/types";
import { IHasherService } from "../services/argon2.service";
import { PrismaClient } from "@prisma/client";
import createHttpError from "http-errors";

export class UserFeature {
  constructor(
    @inject(TYPES.IHasherService)
    private readonly hasherService: IHasherService,
    @inject(TYPES.Prisma)
    private readonly prisma: PrismaClient
  ) {}

  async register(username: string, password: string) {
    const usernameRegex = /^(?!.*[_.]{2})[a-z0-9_.]{5,16}(?<![_.]{1})$/;

    const trimmedUsername = username.trim().toLowerCase();

    if (usernameRegex.test(trimmedUsername)) {
      throw createHttpError(
        400,
        "El nombre de usuario debe tener entre 5 y 16 caracteres, solo puede contener letras minúsculas, números, guiones bajos y puntos, y no pueden ser seguidos o al inicio/final.."
      );
    }

    const hashedPassword = await this.hasherService.hash(password);

    return await this.prisma.user.create({
      data: {
        username: trimmedUsername,
        password: hashedPassword,
      },
      omit: {
        password: true,
      },
    });
  }
}
