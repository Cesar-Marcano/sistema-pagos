import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { LoginSchema } from "./schemas";

export async function login(req: Request, res: Response, next: NextFunction) {
  LoginSchema.parse(req.body);

  passport.authenticate("local", (err: unknown, result: { token: string }) => {
    if (err) {
      return next(err);
    }
    if (!result) {
      return res.status(401).json({ message: "Credenciales inválidos." });
    }

    return res.status(200).json({ token: result.token });
  })(req, res, next);
}
