import { Router } from "express";
import passport from "passport";
import { createDiscount } from "./createDiscount";
import { findDiscountById } from "./findDiscountById";
import { searchDiscount } from "./searchDiscount";
import { updateDiscount } from "./updateDiscount";
import { softDeleteDiscount } from "./softDeleteDiscount";

export const discountRoutes: Router = Router();

discountRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createDiscount
);
discountRoutes.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateDiscount
);
discountRoutes.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  softDeleteDiscount
);
discountRoutes.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  findDiscountById
);
discountRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  searchDiscount
);
