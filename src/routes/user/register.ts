import { Request } from "express";
import { TYPES } from "../../config/types";
import { UserFeature } from "../../features/user.feature";
import { container } from "../../config/container";
import { z } from "zod";

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "El nombre de usuario debe tener al menos 5 caracteres.")
    .max(16, "El nombre de usuario no puede tener más de 16 caracteres.")
    .regex(
      /^(?!.*[_.]{2})[a-z0-9_.]{5,16}(?<![_.]{1})$/,
      "El nombre de usuario solo puede contener letras minúsculas, números, guiones bajos y puntos. No pueden ser seguidos o estar al inicio/final."
    ),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export async function register(req: Request, res: Response) {
  const { username, password } = registerSchema.parse(req.body);

  const userFeature = container.get<UserFeature>(TYPES.UserFeature);

  return await userFeature.register(username, password);
}
