import apiClient from './client';

export interface TopAuthor {
  rank: number;
  author_id: number;
  full_name: string;
  books_count: number;
}

export interface TopAuthorsResponse {
  success: true;
  data: {
    year: number;
    items: TopAuthor[];
  };
}

export const getTopAuthors = async (
  year: number,
): Promise<TopAuthorsResponse> => {
  const response = await apiClient.get<TopAuthorsResponse>(
    '/reports/top-authors',
    {
      params: {
        year,
      },
    },
  );

  return response.data;
};