import * as argon2 from "argon2";
import { argon2Options } from "../config/argon2";
import createHttpError from "http-errors";
import logger from "../app/logger";

export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await argon2.hash(password, argon2Options);

    return hash;
  } catch (err) {
    logger.error("Error al hashear la contraseña", err);
    throw createHttpError(500, "Error al hashear la contraseña");
  }
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    if (await argon2.verify(hash, password)) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    logger.error("Error al verificar la contraseña", err);
    throw createHttpError(500, "Error al verificar la contraseña");
  }
}
