import apiClient from './client';
import type {
  Author,
  AuthorInput,
  AuthorShort,
} from '../types/author';
import type { Pagination } from '../types/api';

export interface AuthorsQuery {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface AuthorsResponse {
  success: true;
  data: {
    items: AuthorShort[];
    pagination: Pagination;
  };
}

export interface AuthorResponse {
  success: true;
  data: Author;
}

export const getAuthors = async (
  params: AuthorsQuery = {},
): Promise<AuthorsResponse> => {
  const response = await apiClient.get<AuthorsResponse>(
    '/authors',
    {
      params: {
        page: params.page,
        'per-page': params.per_page,
        search: params.search,
      },
    },
  );

  return response.data;
};

export const getAuthor = async (
  id: number,
): Promise<AuthorResponse> => {
  const response = await apiClient.get<AuthorResponse>(
    `/authors/${id}`,
  );

  return response.data;
};

export const createAuthor = async (
  data: AuthorInput,
): Promise<AuthorResponse> => {
  const response = await apiClient.post<AuthorResponse>(
    '/authors',
    data,
  );

  return response.data;
};

export const updateAuthor = async (
  id: number,
  data: AuthorInput,
): Promise<AuthorResponse> => {
  const response = await apiClient.put<AuthorResponse>(
    `/authors/${id}`,
    data,
  );

  return response.data;
};

export const deleteAuthor = async (
  id: number,
): Promise<void> => {
  await apiClient.delete(`/authors/${id}`);
};