import { Router } from "express";
import passport from "passport";
import { createPaymentMethod } from "./createPaymentMethod";
import { findPaymentMethodById } from "./findPaymentMethodById";
import { searchPaymentMethod } from "./searchPaymentMethod";
import { updatePaymentMethod } from "./updatePaymentMethod";
import { softDeletePaymentMethod } from "./softDeletePaymentMethod";

export const paymentMethodRoutes: Router = Router();

paymentMethodRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createPaymentMethod
);
paymentMethodRoutes.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updatePaymentMethod
);
paymentMethodRoutes.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  softDeletePaymentMethod
);
paymentMethodRoutes.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  findPaymentMethodById
);
paymentMethodRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  searchPaymentMethod
);
