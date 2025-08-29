import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { injectable, inject } from "inversify";
import { TYPES } from "./types";
import { UserFeature } from "../features/user.feature";
import { env } from "./env";
import { SessionFeature } from "../features/session.feature";
import { ITokenService, Payload } from "../services/jwt.service";
import logger from "../app/logger";

@injectable()
export class PassportConfig {
  private readonly JWT_SECRET = env.JWT_SECRET;

  constructor(
    @inject(TYPES.UserFeature)
    private readonly userFeature: UserFeature,
    @inject(TYPES.SessionFeature)
    private readonly sessionFeature: SessionFeature,
    @inject(TYPES.ITokenService)
    private readonly jwtService: ITokenService
  ) {}

  public setup() {
    passport.use(
      new LocalStrategy(
        { usernameField: "username" },
        async (username, password, done) => {
          try {
            const user = await this.userFeature.login(username, password);

            const { token, jti, expiration } = this.jwtService.sign(
              user.username,
              user.id
            );
            await this.sessionFeature.createSession(user.id, jti, expiration);

            return done(null, { user, token });
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
        async (jwtPayload: Payload, done) => {
          try {
            const user = await this.userFeature.findById(
              Number(jwtPayload.sub!)
            );

            if (!jwtPayload.jti) {
              logger.error("El token no contiene JTI");

              return done(null, false);
            }

            if (!jwtPayload.sub) {
              logger.error("El token no contiene subject");

              return done(null, false);
            }

            const sessionExists = await this.sessionFeature.sessionExists(
              jwtPayload.jti,
              Number(jwtPayload.sub),
            );

            if (user && sessionExists) {
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
