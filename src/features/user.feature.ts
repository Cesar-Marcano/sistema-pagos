import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { IHasherService } from "../services/argon2.service";
import createHttpError from "http-errors";
import { ExtendedPrisma } from "../config/container";
import { AuditLogService } from "../services/auditLog.service";
import { AuditableEntities, AuditLogActions } from "@prisma/client";

@injectable()
export class UserFeature {
  constructor(
    @inject(TYPES.IHasherService)
    private readonly hasherService: IHasherService,
    @inject(TYPES.Prisma)
    private readonly prisma: ExtendedPrisma,
    @inject(TYPES.AuditLogService)
    private readonly auditLogService: AuditLogService
  ) {}

  async register(username: string, password: string) {
    const existingUser = await this.prisma.user.count({
      where: {
        username,
        deletedAt: null,
      },
    });

    if (existingUser > 0) {
      throw createHttpError(409, "El nombre de usuario ya está en uso.");
    }

    const hashedPassword = await this.hasherService.hash(password);

    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
      omit: {
        password: true,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.USER,
      AuditLogActions.CREATE,
      user,
      user.id
    );

    return user;
  }

  async login(username: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        username,
        deletedAt: null,
      },
    });

    if (!user) throw createHttpError(403, "Credenciales inválidos.");

    const isPasswordValid = await this.hasherService.compare(
      user.password,
      password
    );

    if (!isPasswordValid) throw createHttpError(403, "Credenciales inválidos.");

    const { password: _, ...loggedUser } = user;

    return loggedUser;
  }

  async findById(id: number) {
    return await this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      omit: {
        password: true,
      },
    });
  }
}
