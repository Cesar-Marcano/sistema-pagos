import { Request, Response } from "express";
import { z } from "zod";
import { container } from "../config/container";
import { ServiceIdentifier } from "inversify";
import logger from "../app/logger";
import createHttpError from "http-errors";

export const DefaultSearchSchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  pageSize: z.string().optional().default("10").transform(Number),
  includeDeleted: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
});

export function createSearchController<Feature extends { search: Function }>(
  zodCriteria: z.ZodObject<any>,
  feature: ServiceIdentifier<Feature>,
  whereMapper: (queryParams: any) => object,
  options?: {
    searchResultName?: string;
    searchMethodName?: string;
  }
) {
  const SearchSchema = DefaultSearchSchema.extend(zodCriteria.shape);

  return async function (req: Request, res: Response) {
    const queryParams = SearchSchema.parse(req.query);
    const whereClause = whereMapper(queryParams);

    const searchArgs = {
      page: queryParams.page,
      pageSize: queryParams.pageSize,
      where: whereClause,
      includeDeleted: queryParams.includeDeleted,
    };

    const searchFeature = container.get<Feature>(feature);

    const methodName = options?.searchMethodName ?? "search";

    if (typeof (searchFeature as any)[methodName] !== "function") {
      logger.error(
        `Controller definition error: feature "${searchFeature.constructor.name}" has no "${methodName}" method.`
      );
      throw createHttpError(500, "Error interno del servidor.");
    }

    const resultName = (options?.searchResultName ?? "searchResult").trim()

    if (options?.searchResultName && resultName.length < 3) {
      logger.error(
        `Controller definition error: "${options.searchResultName}" is not a valid result name for "${searchFeature.constructor.name}".`
      );
      throw createHttpError(500, "Error interno del servidor.");
    }

    const searchResult = await (searchFeature as any)[methodName](searchArgs);

    let result: Record<string, any> = {};

    result[resultName] = searchResult;

    res.json(result);
  };
}
