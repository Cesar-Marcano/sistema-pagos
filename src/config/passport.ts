import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { injectable, inject } from "inversify";
import { TYPES } from "./types";
import { UserFeature } from "../features/user.feature";
import { env } from "./env";

@injectable()
export class PassportConfig {
  private readonly JWT_SECRET = env.JWT_SECRET;

  constructor(
    @inject(TYPES.UserFeature)
    private readonly userFeature: UserFeature
  ) {}

  public setup() {
    passport.use(
      new LocalStrategy(
        { usernameField: "username" },
        async (username, password, done) => {
          try {
            const user = await this.userFeature.login(username, password);

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
            const user = await this.userFeature.findById(jwtPayload.id);

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
