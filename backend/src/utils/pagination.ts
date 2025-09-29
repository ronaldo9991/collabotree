export interface PaginationOptions {
  page: number;
  limit: number;
  cursor?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total?: number;
    totalPages?: number;
    hasNext: boolean;
    hasPrev: boolean;
    cursor?: string;
  };
}

export const parsePagination = (query: any): PaginationOptions => {
  const page = query.page ? Math.max(1, parseInt(query.page, 10)) : 1;
  const limit = query.limit ? Math.min(100, Math.max(1, parseInt(query.limit, 10))) : 20;
  const cursor = query.cursor;

  return { page, limit, cursor };
};

export const createPaginationResult = <T>(
  data: T[],
  options: PaginationOptions,
  total?: number
): PaginationResult<T> => {
  const { page, limit } = options;
  
  const totalPages = total ? Math.ceil(total / limit) : undefined;
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: total ? page < totalPages! : data.length === limit,
      hasPrev: page > 1,
    },
  };
};

export const createCursorPaginationResult = <T>(
  data: T[],
  limit: number,
  cursor?: string
): PaginationResult<T> => {
  return {
    data,
    pagination: {
      page: 1, // Cursor pagination doesn't use page numbers
      limit,
      hasNext: data.length === limit,
      hasPrev: !!cursor,
      cursor: data.length > 0 ? (data[data.length - 1] as any).id : undefined,
    },
  };
};
