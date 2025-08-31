import z from "zod";

export const UserSchema = z.object({
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
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
  id: z.number(),
  updatedAt: z.date(),
});

export const RegisterSchema = UserSchema.pick({
  username: true,
  password: true,
});

export const LoginSchema = z.object({
  username: z.string().transform((s) => s.trim().toLowerCase()),
  password: z.string(),
});
