import { Container } from "inversify";
import { Argon2Service, IHasherService } from "../services/argon2.service";
import { TYPES } from "./types";
import { PassportConfig } from "./passport";
import { PrismaClient } from "@prisma/client";
import { UserFeature } from "../features/user.feature";
import { ITokenService, JwtService } from "../services/jwt.service";
import { SessionFeature } from "../features/session.feature";
import { SchoolYearFeature } from "../features/schoolyear.feature";
import { GradeFeature } from "../features/grade.feature";
import { SchoolPeriodFeature } from "../features/schoolPeriod.feature";
import { StudentFeature } from "../features/student.feature";
import { MonthlyFeeFeature } from "../features/monthlyFee.feature";
import { DiscountFeature } from "../features/discount.feature";

const container = new Container();

const prisma = new PrismaClient();
container.bind<PrismaClient>(TYPES.Prisma).toConstantValue(prisma);

// Services
container.bind<IHasherService>(TYPES.IHasherService).to(Argon2Service);
container.bind<ITokenService>(TYPES.ITokenService).to(JwtService);

// Features
container.bind<UserFeature>(TYPES.UserFeature).to(UserFeature);
container.bind<SessionFeature>(TYPES.SessionFeature).to(SessionFeature);
container
  .bind<SchoolYearFeature>(TYPES.SchoolYearFeature)
  .to(SchoolYearFeature);
container.bind<GradeFeature>(TYPES.GradeFeature).to(GradeFeature);
container
  .bind<SchoolPeriodFeature>(TYPES.SchoolPeriodFeature)
  .to(SchoolPeriodFeature);
container.bind<StudentFeature>(TYPES.StudentFeature).to(StudentFeature);
container
  .bind<MonthlyFeeFeature>(TYPES.MonthlyFeeFeature)
  .to(MonthlyFeeFeature);
container.bind<DiscountFeature>(TYPES.DiscountFeature).to(DiscountFeature);

container.bind<PassportConfig>(PassportConfig).toSelf();

export { container };
