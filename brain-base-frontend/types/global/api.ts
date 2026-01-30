export interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    [key: string]: any;
  };
}
