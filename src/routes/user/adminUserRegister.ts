import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { UserFeature } from "../../features/user.feature";
import { container } from "../../config/container";
import { RegisterSchema } from "./schemas";

export async function adminUserRegister(req: Request, res: Response) {
  const { username, password } = RegisterSchema.parse(req.body);

  const userFeature = container.get<UserFeature>(TYPES.UserFeature);

  const user = await userFeature.register(username, password);

  res.status(201).json({ user });
}
