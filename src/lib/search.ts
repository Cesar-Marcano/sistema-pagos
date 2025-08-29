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

  const skip = (page - 1) * pageSize;

  const [results, total] = await Promise.all([
    findMany({
      skip,
      take: pageSize,
      where,
      orderBy,
    }),
    count({ where }),
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
