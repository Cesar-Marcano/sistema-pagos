import { NextFunction, Request, Response } from "express";
import { container } from "../config/container";
import { SettingsFeature } from "../features/settings.feature";
import { TYPES } from "../config/types";
import { Settings } from "@prisma/client";
import createHttpError from "http-errors";

export async function canRegister(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  const settingsFeature = container.get<SettingsFeature>(TYPES.SettingsFeature);

  const isRegistrationEnabled = await settingsFeature.get(
    Settings.IS_USER_REGISTRATION_ENABLED
  );

  const isPublicRegistrationEnabled = await settingsFeature.get(
    Settings.PUBLIC_REGISTRATION_ENABLED
  );

  if (!isRegistrationEnabled)
    throw createHttpError(
      403,
      "La creación de usuarios está actualmente deshabilitada."
    );

  if (!isPublicRegistrationEnabled) {
    throw createHttpError(
      403,
      "El registro de usuarios de manera pública está deshabilitada. Contacte a un administrador para registrarse en el sistema."
    );
  }

  next();
}
