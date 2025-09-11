import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { asyncLocalStorage } from "../config/asyncLocalStorage";
import { Payload } from "../services/jwt.service";

export const authenticateAndSetContext = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", { session: false }, (err: unknown, user: Payload, _info: unknown) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const store = new Map();
    store.set("userId", user.id);

    asyncLocalStorage.run(store, () => {
      req.user = user;
      next();
    });
  })(req, res, next);
};
