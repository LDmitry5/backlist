import apiClient from './client';
import type {
  Book,
  BookInput,
  BookFormData,
} from '../types/book';
import type { Pagination } from '../types/api';

export interface BooksQuery {
  page?: number;
  per_page?: number;
  author_id?: number;
  year?: number;
  search?: string;
}

export interface BooksResponse {
  success: true;
  data: {
    items: Book[];
    pagination: Pagination;
  };
}

export interface BookResponse {
  success: true;
  data: Book;
}

export const getBooks = async (
  params: BooksQuery = {},
): Promise<BooksResponse> => {
  const response = await apiClient.get<BooksResponse>('/books', {
    params: {
      page: params.page,
      'per-page': params.per_page,
      author_id: params.author_id,
      year: params.year,
      search: params.search,
    },
  });

  return response.data;
};

export const getBook = async (
  id: number,
): Promise<BookResponse> => {
  const response = await apiClient.get<BookResponse>(
    `/books/${id}`,
  );

  return response.data;
};

export const createBook = async (
  data: BookFormData,
): Promise<BookResponse> => {
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('year', String(data.year));
  formData.append('cover', data.cover);

  data.author_ids.forEach((authorId) => {
    formData.append('author_ids[]', String(authorId));
  });

  if (data.description) {
    formData.append('description', data.description);
  }

  if (data.isbn) {
    formData.append('isbn', data.isbn);
  }

  const response = await apiClient.post<BookResponse>(
    '/books',
    formData,
  );

  return response.data;
};

export const updateBook = async (
  id: number,
  data: BookFormData,
): Promise<BookResponse> => {
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('year', String(data.year));
  formData.append('cover', data.cover);

  data.author_ids.forEach((authorId) => {
    formData.append('author_ids[]', String(authorId));
  });

  if (data.description) {
    formData.append('description', data.description);
  }

  if (data.isbn) {
    formData.append('isbn', data.isbn);
  }

  const response = await apiClient.put<BookResponse>(
    `/books/${id}`,
    formData,
  );

  return response.data;
};

export const patchBook = async (
  id: number,
  data: BookInput,
): Promise<BookResponse> => {
  const response = await apiClient.patch<BookResponse>(
    `/books/${id}`,
    data,
  );

  return response.data;
};

export const deleteBook = async (
  id: number,
): Promise<void> => {
  await apiClient.delete(`/books/${id}`);
};