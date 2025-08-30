import { Request, Response } from "express";
import { z } from "zod";
import { container } from "../config/container";
import { ServiceIdentifier } from "inversify";

export function createSearchController<Feature extends { search: Function }>(
  zodCriteria: z.ZodObject<any>,
  feature: ServiceIdentifier<Feature>,
  whereMapper: (queryParams: any) => object,
  options?: {
    searchResultName?: string;
    searchMethodName?: string;
  }
) {
  const defaultSearchSchema = z.object({
    page: z.string().optional().default("1").transform(Number),
    pageSize: z.string().optional().default("10").transform(Number),
    includeDeleted: z
      .string()
      .optional()
      .transform((val) => val === "true")
      .default(false),
    ...zodCriteria.shape,
  });

  return async function (req: Request, res: Response) {
    const queryParams = defaultSearchSchema.parse(req.query);
    const whereClause = whereMapper(queryParams);

    const searchArgs = {
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      where: whereClause,
      includeDeleted: queryParams.includeDeleted
    };

    const schoolYearFeature = container.get<Feature>(feature);
    const searchResult = await (schoolYearFeature as any)[
      options?.searchMethodName ?? "search"
    ](searchArgs);

    let result = {} as any;

    result[options?.searchResultName ?? "searchResult"] = searchResult;

    res.json(result);
  };
}
