import { Router } from "express";
import { register } from "./register";
import { login } from "./login";
import passport from "passport";

export const userRoutes: Router = Router();

userRoutes.post("/register", register);
userRoutes.post("/login", login);
userRoutes.get(
  "/profile",
  passport.authenticate("jwt", { session: false }), // El middleware de protección
  (req, res) => {
    res.json(req.user)
  }
);