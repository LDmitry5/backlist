import { http, HttpResponse } from 'msw';

import logger from '../utils/logger';

const apiBaseUrl = '/api/v1';

type AuthorRecord = {
  id: number;
  full_name: string;
};

type BookRecord = {
  id: number;
  title: string;
  year: number;
  description: string | null;
  isbn: string | null;
  cover_url: string;
  authors: AuthorRecord[];
};

const authors: AuthorRecord[] = [
  { id: 1, full_name: 'Лев Толстой' },
  { id: 2, full_name: 'Фёдор Достоевский' },
  { id: 3, full_name: 'Антон Чехов' },
  { id: 4, full_name: 'Александр Пушкин' },
  { id: 5, full_name: 'Иван Тургенев' },
];

const books: BookRecord[] = [
  {
    id: 1,
    title: 'Война и мир',
    year: 1869,
    description: 'Эпопея о жизни российского общества в эпоху наполеоновских войн.',
    isbn: '978-5-389-12345-6',
    cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    authors: [
      { id: 1, full_name: 'Лев Толстой' },
    ],
  },
  {
    id: 2,
    title: 'Преступление и наказание',
    year: 1866,
    description: 'Психологический роман о моральном выборе и раскаянии.',
    isbn: '978-5-389-22345-7',
    cover_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
    authors: [
      { id: 2, full_name: 'Фёдор Достоевский' },
    ],
  },
  {
    id: 3,
    title: 'Вишнёвый сад',
    year: 1904,
    description: 'Комедия о любви, утрате и неизбежных переменах.',
    isbn: '978-5-389-32345-8',
    cover_url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    authors: [
      { id: 3, full_name: 'Антон Чехов' },
    ],
  },
  {
    id: 4,
    title: 'Евгений Онегин',
    year: 1833,
    description: 'Роман в стихах о любви, одиночестве и русской душе.',
    isbn: '978-5-389-42345-9',
    cover_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
    authors: [
      { id: 4, full_name: 'Александр Пушкин' },
    ],
  },
  {
    id: 5,
    title: 'Отцы и дети',
    year: 1862,
    description: 'Роман о поколениях, идеалах и конфликте мировоззрений.',
    isbn: '978-5-389-52345-0',
    cover_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    authors: [
      { id: 5, full_name: 'Иван Тургенев' },
    ],
  },
  {
    id: 6,
    title: 'Два капитана',
    year: 1938,
    description: 'Приключенческий роман о поиске и верности мечте.',
    isbn: '978-5-389-62345-1',
    cover_url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80',
    authors: [
      { id: 1, full_name: 'Лев Толстой' },
      { id: 4, full_name: 'Александр Пушкин' },
    ],
  },
];

const buildErrorResponse = (
  status: number,
  message: string,
  field?: string,
): HttpResponse<any> => {
  return HttpResponse.json(
    {
      success: false,
      errors: [
        {
          field,
          message,
        },
      ],
    },
    { status },
  );
};

const createSuccessResponse = <T>(payload: T): HttpResponse<any> => {
  return HttpResponse.json({
    success: true,
    data: payload,
  });
};

const getPageData = <T>(items: T[], page: number, perPage: number) => {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePerPage = Number.isFinite(perPage) && perPage > 0 ? perPage : 20;
  const totalPages = Math.max(1, Math.ceil(items.length / safePerPage));
  const normalizedPage = Math.min(safePage, totalPages);
  const startIndex = (normalizedPage - 1) * safePerPage;
  const paginatedItems = items.slice(startIndex, startIndex + safePerPage);

  return {
    items: paginatedItems,
    pagination: {
      total: items.length,
      page: normalizedPage,
      per_page: safePerPage,
      total_pages: totalPages,
    },
  };
};

const getAllAuthorBooks = (authorId: number) => {
  return books.filter((book) => book.authors.some((author) => author.id === authorId));
};

const getAuthorDetails = (authorId: number) => {
  const author = authors.find((item) => item.id === authorId);

  if (!author) {
    return null;
  }

  return {
    ...author,
    books: getAllAuthorBooks(author.id).map((book) => ({
      id: book.id,
      title: book.title,
      year: book.year,
    })),
  };
};

const getBookDetails = (bookId: number) => {
  const book = books.find((item) => item.id === bookId);

  if (!book) {
    return null;
  }

  return {
    ...book,
    authors: book.authors,
  };
};

const booksRoute = `${apiBaseUrl}/books`;
const authorsRoute = `${apiBaseUrl}/authors`;
const reportsRoute = `${apiBaseUrl}/reports/top-authors`;

export const handlers = [
  http.post(`${apiBaseUrl}/auth/login`, async ({ request }) => {
    try {
      const credentials = await request.json() as {
        username?: string;
        password?: string;
      };

      if (!credentials.username || !credentials.password) {
        return buildErrorResponse(401, 'Неверные учётные данные.', 'username');
      }

      return createSuccessResponse({
        token: 'mock-access-token-123',
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        user: {
          id: 1,
          username: credentials.username,
          role: 'user',
        },
      });
    } catch (error) {
      logger.error(error, 'Auth login handler');

      return buildErrorResponse(500, 'Не удалось выполнить вход.');
    }
  }),

  http.get(booksRoute, ({ request }) => {
    try {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const perPage = Number(url.searchParams.get('per-page') ?? '20');
      const authorId = Number(url.searchParams.get('author_id') ?? '0');
      const year = Number(url.searchParams.get('year') ?? '0');
      const search = url.searchParams.get('search') ?? '';

      let filteredBooks = [...books];

      if (authorId > 0) {
        filteredBooks = filteredBooks.filter((book) =>
          book.authors.some((author) => author.id === authorId),
        );
      }

      if (year > 0) {
        filteredBooks = filteredBooks.filter((book) => book.year === year);
      }

      if (search.trim()) {
        const normalizedSearch = search.trim().toLowerCase();

        filteredBooks = filteredBooks.filter((book) =>
          book.title.toLowerCase().includes(normalizedSearch),
        );
      }

      const pageData = getPageData(filteredBooks, page, perPage);

      return createSuccessResponse(pageData);
    } catch (error) {
      logger.error(error, 'Books list handler');

      return buildErrorResponse(500, 'Не удалось загрузить список книг.');
    }
  }),

  http.get(`${apiBaseUrl}/books/:id`, ({ params }) => {
    try {
      const id = Number(params.id);
      const book = getBookDetails(id);

      if (!book) {
        return buildErrorResponse(404, 'Книга не найдена.', 'id');
      }

      return createSuccessResponse(book);
    } catch (error) {
      logger.error(error, 'Book detail handler');

      return buildErrorResponse(500, 'Не удалось загрузить книгу.');
    }
  }),

  http.post(booksRoute, async ({ request }) => {
    try {
      const formData = await request.formData();
      const title = String(formData.get('title') ?? '').trim();
      const yearValue = Number(formData.get('year'));
      const descriptionValue = String(formData.get('description') ?? '').trim();
      const isbnValue = String(formData.get('isbn') ?? '').trim();
      const authorIds = Array.from(formData.getAll('author_ids[]'))
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value));
      const coverFile = formData.get('cover');

      if (!title || !Number.isFinite(yearValue) || authorIds.length === 0) {
        return buildErrorResponse(422, 'Проверьте поля книги.', 'title');
      }

      if (!coverFile || !(coverFile instanceof File)) {
        return buildErrorResponse(422, 'Выберите обложку книги.', 'cover');
      }

      const nextBookId = Math.max(0, ...books.map((book) => book.id)) + 1;
      const preparedAuthors = authorIds
        .map((authorId) => authors.find((author) => author.id === authorId))
        .filter((author): author is { id: number; full_name: string } => Boolean(author));

      const createdBook: BookRecord = {
        id: nextBookId,
        title,
        year: yearValue,
        description: descriptionValue || null,
        isbn: isbnValue || null,
        cover_url: URL.createObjectURL(coverFile),
        authors: preparedAuthors,
      };

      books.unshift(createdBook);

      return HttpResponse.json(
        {
          success: true,
          data: createdBook,
        },
        { status: 201 },
      );
    } catch (error) {
      logger.error(error, 'Create book handler');

      return buildErrorResponse(500, 'Не удалось создать книгу.');
    }
  }),

  http.put(`${apiBaseUrl}/books/:id`, async ({ params, request }) => {
    try {
      const id = Number(params.id);
      const formData = await request.formData();
      const title = String(formData.get('title') ?? '').trim();
      const yearValue = Number(formData.get('year'));
      const descriptionValue = String(formData.get('description') ?? '').trim();
      const isbnValue = String(formData.get('isbn') ?? '').trim();
      const authorIds = Array.from(formData.getAll('author_ids[]'))
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value));
      const coverFile = formData.get('cover');
      const existingBook = getBookDetails(id);

      if (!existingBook) {
        return buildErrorResponse(404, 'Книга не найдена.', 'id');
      }

      if (!title || !Number.isFinite(yearValue) || authorIds.length === 0) {
        return buildErrorResponse(422, 'Проверьте поля книги.', 'title');
      }

      const preparedAuthors = authorIds
        .map((authorId) => authors.find((author) => author.id === authorId))
        .filter((author): author is { id: number; full_name: string } => Boolean(author));

      const updatedBook: BookRecord = {
        ...existingBook,
        title,
        year: yearValue,
        description: descriptionValue || null,
        isbn: isbnValue || null,
        authors: preparedAuthors,
        cover_url: coverFile instanceof File ? URL.createObjectURL(coverFile) : existingBook.cover_url,
      };

      const index = books.findIndex((book) => book.id === id);

      if (index >= 0) {
        books[index] = updatedBook;
      }

      return createSuccessResponse(updatedBook);
    } catch (error) {
      logger.error(error, 'Update book handler');

      return buildErrorResponse(500, 'Не удалось обновить книгу.');
    }
  }),

  http.patch(`${apiBaseUrl}/books/:id`, async ({ params, request }) => {
    try {
      const id = Number(params.id);
      const existingBook = getBookDetails(id);

      if (!existingBook) {
        return buildErrorResponse(404, 'Книга не найдена.', 'id');
      }

      const payload = await request.json() as {
        title?: string;
        year?: number;
        description?: string;
        isbn?: string;
        author_ids?: number[];
      };

      const updatedBook: BookRecord = {
        ...existingBook,
        title: payload.title?.trim() || existingBook.title,
        year: Number.isFinite(payload.year) ? payload.year ?? existingBook.year : existingBook.year,
        description: payload.description ?? existingBook.description,
        isbn: payload.isbn ?? existingBook.isbn,
        authors: payload.author_ids?.length
          ? payload.author_ids
              .map((authorId) => authors.find((author) => author.id === authorId))
              .filter((author): author is AuthorRecord => Boolean(author))
          : existingBook.authors,
      };

      const index = books.findIndex((book) => book.id === id);

      if (index >= 0) {
        books[index] = updatedBook;
      }

      return createSuccessResponse(updatedBook);
    } catch (error) {
      logger.error(error, 'Patch book handler');

      return buildErrorResponse(500, 'Не удалось обновить книгу.');
    }
  }),

  http.delete(`${apiBaseUrl}/books/:id`, ({ params }) => {
    try {
      const id = Number(params.id);
      const index = books.findIndex((book) => book.id === id);

      if (index < 0) {
        return buildErrorResponse(404, 'Книга не найдена.', 'id');
      }

      books.splice(index, 1);

      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      logger.error(error, 'Delete book handler');

      return buildErrorResponse(500, 'Не удалось удалить книгу.');
    }
  }),

  http.get(authorsRoute, ({ request }) => {
    try {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const perPage = Number(url.searchParams.get('per-page') ?? '20');
      const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();

      let filteredAuthors = [...authors];

      if (search) {
        filteredAuthors = filteredAuthors.filter((author) =>
          author.full_name.toLowerCase().includes(search),
        );
      }

      const pageData = getPageData(filteredAuthors, page, perPage);

      return createSuccessResponse(pageData);
    } catch (error) {
      logger.error(error, 'Authors list handler');

      return buildErrorResponse(500, 'Не удалось загрузить список авторов.');
    }
  }),

  http.get(`${apiBaseUrl}/authors/:id`, ({ params }) => {
    try {
      const id = Number(params.id);
      const author = getAuthorDetails(id);

      if (!author) {
        return buildErrorResponse(404, 'Автор не найден.', 'id');
      }

      return createSuccessResponse(author);
    } catch (error) {
      logger.error(error, 'Author detail handler');

      return buildErrorResponse(500, 'Не удалось загрузить автора.');
    }
  }),

  http.post(authorsRoute, async ({ request }) => {
    try {
      const payload = await request.json() as { full_name?: string };
      const fullName = payload.full_name?.trim();

      if (!fullName) {
        return buildErrorResponse(422, 'Введите имя автора.', 'full_name');
      }

      const nextAuthorId = Math.max(0, ...authors.map((author) => author.id)) + 1;
      const createdAuthor = {
        id: nextAuthorId,
        full_name: fullName,
      };

      authors.push(createdAuthor);

      return HttpResponse.json(
        {
          success: true,
          data: {
            ...createdAuthor,
            books: [],
          },
        },
        { status: 201 },
      );
    } catch (error) {
      logger.error(error, 'Create author handler');

      return buildErrorResponse(500, 'Не удалось создать автора.');
    }
  }),

  http.put(`${apiBaseUrl}/authors/:id`, async ({ params, request }) => {
    try {
      const id = Number(params.id);
      const existingAuthor = getAuthorDetails(id);

      if (!existingAuthor) {
        return buildErrorResponse(404, 'Автор не найден.', 'id');
      }

      const payload = await request.json() as { full_name?: string };
      const fullName = payload.full_name?.trim();

      if (!fullName) {
        return buildErrorResponse(422, 'Введите имя автора.', 'full_name');
      }

      const authorIndex = authors.findIndex((author) => author.id === id);

      if (authorIndex >= 0) {
        authors[authorIndex] = {
          ...authors[authorIndex],
          full_name: fullName,
        };
      }

      books.forEach((book) => {
        book.authors = book.authors.map((author) => {
          if (author.id === id) {
            return {
              id: author.id,
              full_name: fullName,
            };
          }

          return author;
        });
      });

      return createSuccessResponse({
        ...existingAuthor,
        full_name: fullName,
        books: getAllAuthorBooks(id).map((book) => ({
          id: book.id,
          title: book.title,
          year: book.year,
        })),
      });
    } catch (error) {
      logger.error(error, 'Update author handler');

      return buildErrorResponse(500, 'Не удалось обновить автора.');
    }
  }),

  http.delete(`${apiBaseUrl}/authors/:id`, ({ params }) => {
    try {
      const id = Number(params.id);
      const authorIndex = authors.findIndex((author) => author.id === id);

      if (authorIndex < 0) {
        return buildErrorResponse(404, 'Автор не найден.', 'id');
      }

      authors.splice(authorIndex, 1);

      books.forEach((book) => {
        book.authors = book.authors.filter((author) => author.id !== id);
      });

      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      logger.error(error, 'Delete author handler');

      return buildErrorResponse(500, 'Не удалось удалить автора.');
    }
  }),

  http.get(reportsRoute, ({ request }) => {
    try {
      const url = new URL(request.url);
      const yearValue = Number(url.searchParams.get('year'));

      if (!Number.isInteger(yearValue) || yearValue <= 0) {
        return buildErrorResponse(400, 'Параметр year не указан или неверен.', 'year');
      }

      const filteredBooks = books.filter((book) => book.year === yearValue);
      const authorBookMap = new Map<number, number>();

      filteredBooks.forEach((book) => {
        book.authors.forEach((author) => {
          const currentCount = authorBookMap.get(author.id) ?? 0;

          authorBookMap.set(author.id, currentCount + 1);
        });
      });

      const reportItems = [...authorBookMap.entries()]
        .map(([authorId, booksCount]) => {
          const author = authors.find((item) => item.id === authorId);

          if (!author) {
            return null;
          }

          return {
            rank: 0,
            author_id: author.id,
            full_name: author.full_name,
            books_count: booksCount,
          };
        })
        .filter((item): item is {
          rank: number;
          author_id: number;
          full_name: string;
          books_count: number;
        } => Boolean(item))
        .sort((first, second) => second.books_count - first.books_count)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
        }));

      return createSuccessResponse({
        year: yearValue,
        items: reportItems,
      });
    } catch (error) {
      logger.error(error, 'Top authors report handler');

      return buildErrorResponse(500, 'Не удалось загрузить отчёт.');
    }
  }),
];
