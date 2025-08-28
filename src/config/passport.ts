import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { injectable, inject } from "inversify";
import { TYPES } from "./types";
import { IHasherService } from "../services/argon2.service";
import { PrismaClient } from "@prisma/client";

@injectable()
export class PassportConfig {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

  constructor(
    @inject(TYPES.IHasherService)
    private readonly hasherService: IHasherService,
    @inject(TYPES.Prisma) private readonly prisma: PrismaClient
  ) {}

  public setup() {
    passport.use(
      new LocalStrategy(
        { usernameField: "username" },
        async (username, password, done) => {
          try {
            const user = await this.prisma.user.findUnique({
              where: { username },
            });
            if (!user) {
              return done(null, false, { message: "Incorrect username." });
            }

            const isMatch = await this.hasherService.compare(
              user.password,
              password
            );
            if (!isMatch) {
              return done(null, false, { message: "Incorrect password." });
            }
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );

    passport.use(
      new JwtStrategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: this.JWT_SECRET,
        },
        async (jwtPayload, done) => {
          try {
            const user = await this.prisma.user.findUnique({
              where: { id: jwtPayload.id },
            });
            if (user) {
              return done(null, user);
            } else {
              return done(null, false);
            }
          } catch (err) {
            return done(err);
          }
        }
      )
    );
  }
}
