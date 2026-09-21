export interface BookAuthor {
  id: number;
  full_name: string;
}

export interface Book {
  id: number;
  title: string;
  year: number;
  description: string | null;
  isbn: string | null;
  cover_url: string | null;
  authors: BookAuthor[];
}

export interface BookInput {
  title: string;
  year: number;
  description?: string;
  isbn?: string;
  author_ids: number[];
}

export interface BookFormData {
  title: string;
  year: number;
  description?: string;
  isbn?: string;
  author_ids: number[];
  cover: File;
}