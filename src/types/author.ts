export interface AuthorShort {
  id: number;
  full_name: string;
}

export interface AuthorBook {
  id: number;
  title: string;
  year: number;
}

export interface Author extends AuthorShort {
  books: AuthorBook[];
}

export interface AuthorInput {
  full_name: string;
}