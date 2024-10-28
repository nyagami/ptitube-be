export interface PageDto<T> {
  meta: {
    page: number;
    totalItems: number;
    totalPages: number;
  };
  data: T[];
}
