import { Container } from "inversify";
import { Argon2Service, IHasherService } from "../services/argon2.service";
import { TYPES } from "./types";
import { PassportConfig } from "./passport";
import { PrismaClient } from "@prisma/client";
import { UserFeature } from "../features/user.feature";

const container = new Container();

const prisma = new PrismaClient();
container.bind<PrismaClient>(TYPES.Prisma).toConstantValue(prisma);

// Services
container.bind<IHasherService>(TYPES.IHasherService).to(Argon2Service);

// Features
container.bind<UserFeature>(TYPES.UserFeature).to(UserFeature);

container.bind<PassportConfig>(PassportConfig).toSelf();

export { container };
