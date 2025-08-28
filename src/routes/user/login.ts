import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().trim().toLowerCase(),
  password: z.string(),
});

export async function login(req: Request, res: Response, next: NextFunction) {
  loginSchema.parse(req.body);

  passport.authenticate("local", (err: unknown, result: { token: string }) => {
    if (err) {
      return next(err);
    }
    if (!result) {
      return res.status(403).json({ message: "Credenciales inválidos." });
    }

    return res.json({ token: result.token });
  })(req, res, next);
}
