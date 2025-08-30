import { Router } from "express";
import passport from "passport";
import { createPayment } from "./createPayment";
import { findPaymentById } from "./findPaymentById";
import { searchPayment } from "./searchPayment";
import { updatePayment } from "./updatePayment";
import { softDeletePayment } from "./softDeletePayment";

export const paymentRoutes: Router = Router();

paymentRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createPayment
);
paymentRoutes.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updatePayment
);
paymentRoutes.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  softDeletePayment
);
paymentRoutes.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  findPaymentById
);
paymentRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  searchPayment
);
