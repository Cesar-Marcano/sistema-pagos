import z from "zod";

export function makeZodObject<T>(schema: { [K in keyof T]: z.ZodTypeAny }) {
  return z.object(schema);
}
