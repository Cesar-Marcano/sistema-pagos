export interface SearchCriteria<T> {
  where?: T;
  orderBy?: any;
}

export interface SearchArgs<T> extends SearchCriteria<T> {
  page?: number;
  pageSize?: number;
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
  count: (args: any) => Promise<number>,
  args: SearchArgs<any> = {}
): Promise<SearchResult<T>> {
  const { page = 1, pageSize = 10, where, orderBy } = args;

  const processedWhere = where
    ? Object.entries(where).reduce((acc: Record<string, any>, [key, value]) => {
        if (
          typeof value === "string" &&
          !key.startsWith("$") &&
          !key.startsWith("_")
        ) {
          acc[key] = { contains: value, mode: "insensitive" };
        } else {
          acc[key] = value;
        }
        return acc;
      }, {})
    : undefined;

  const skip = (page - 1) * pageSize;

  const [results, total] = await Promise.all([
    findMany({
      skip,
      take: pageSize,
      where: processedWhere,
      orderBy,
    }),
    count({ where: processedWhere }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: results,
    total,
    page,
    pageSize,
    totalPages,
  };
}
