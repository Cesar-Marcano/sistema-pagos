import z, { ZodObject, ZodRawShape } from "zod";

export const ZodSearchResponseSchemaBuilder = (
  resultName: string,
  data: ZodObject<ZodRawShape>
) =>
  z.object({
    [resultName]: z.object({
      data: z.array(data),
      total: z.number().positive(),
      page: z.number().positive().min(1),
      pageSize: z.number().positive().default(10),
      totalPages: z.number().positive(),
    }),
  });
