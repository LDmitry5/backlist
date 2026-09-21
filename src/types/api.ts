import type { AuthorShort } from './author';
import type { Book } from './book';

export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface BookListResponse {
  success: true;
  data: {
    items: Book[];
    pagination: Pagination;
  };
}

export interface AuthorListResponse {
  success: true;
  data: {
    items: AuthorShort[];
    pagination: Pagination;
  };
}

export interface ApiError {
  success: false;
  errors: Array<{
    field?: string;
    message: string;
  }>;
}