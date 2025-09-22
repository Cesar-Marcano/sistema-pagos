import { SimilarityResult } from "prisma-extension-pg-trgm/dist/similarity/types";
import { container } from "../config/container";
import { TYPES } from "../config/types";
import { SettingsService } from "../services/settings.service";
import { Settings } from "@prisma/client";

export interface SearchCriteria<T> {
  where?: T;
  orderBy?: any;
  include?: any;
  omit?: any;
}

export interface SearchArgs<T> extends SearchCriteria<T> {
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function searchWithPaginationAndCriteria<T>(
  findMany: (args: any) => Promise<T[]>,
  similarity: (args: any) => Promise<SimilarityResult<T, any>>,
  args: SearchArgs<any> = {},
  searchThreshold: number = 0.47
): Promise<SearchResult<T>> {
  const {
    page = 1,
    pageSize = 10,
    where,
    orderBy,
    include,
    omit,
    includeDeleted,
  } = args;

  let textQuery = {};
  let otherFilters = {};
  let useSimilarity = false;

  if (where) {
    Object.entries(where).forEach(([key, value]) => {
      if (
        typeof value === "string" &&
        !key.startsWith("$") &&
        !key.startsWith("_")
      ) {
        useSimilarity = true;
        textQuery = {
          ...textQuery,
          [key]: {
            word_similarity: {
              text: value,
              threshold: { gt: searchThreshold },
            },
          },
        };
      } else {
        otherFilters = { ...otherFilters, [key]: value };
      }
    });
  }

  const finalWhere = {
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...otherFilters,
  };

  let results: T[];
  let total: number;

  if (useSimilarity) {
    const similarityResults = await similarity({ query: textQuery });

    const filteredResults = similarityResults.filter((item: any) => {
      return Object.entries(finalWhere).every(([key, value]) => {
        if (key === "deletedAt") {
          return item.deletedAt === null;
        }
        return item[key] === value;
      });
    });

    results = filteredResults.slice(
      (page - 1) * pageSize,
      page * pageSize
    ) as T[];
    total = filteredResults.length;
  } else {
    const findManyResults = await findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: finalWhere,
      orderBy,
      include,
      omit,
    });

    const findManyTotal = await findMany({
      where: finalWhere,
      include,
      omit,
    });

    results = findManyResults;
    total = findManyTotal.length;
  }

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: results,
    total,
    page,
    pageSize,
    totalPages,
  };
}
