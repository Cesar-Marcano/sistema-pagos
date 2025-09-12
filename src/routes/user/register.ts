import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { UserFeature } from "../../features/user.feature";
import { container } from "../../config/container";
import { ITokenService } from "../../services/jwt.service";
import { SessionFeature } from "../../features/session.feature";
import { RegisterSchema } from "./schemas";

export async function register(req: Request, res: Response) {
  const { username, password } = RegisterSchema.parse(req.body);

  const userFeature = container.get<UserFeature>(TYPES.UserFeature);
  const sessionFeature = container.get<SessionFeature>(TYPES.SessionFeature);
  const jwtService = container.get<ITokenService>(TYPES.ITokenService);

  const user = await userFeature.register(username, password);

  const { token, jti, expiration, now } = jwtService.sign(
    user.username,
    user.id
  );

  await sessionFeature.createSession(user.id, jti, expiration, now);

  res.status(201).json({ token });
}
