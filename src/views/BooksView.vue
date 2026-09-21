<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";

import { getBooks } from "../api/books";
import { getAuthors } from "../api/authors";
import { useAuthStore } from "../stores/auth";

import BookCard from "../components/books/BookCard.vue";

import type { Book } from "../types/book";
import type { AuthorShort } from "../types/author";
import type { Pagination } from "../types/api";

const books = ref<Book[]>([]);
const authors = ref<AuthorShort[]>([]);

const pagination = ref<Pagination>({
  total: 0,
  page: 1,
  per_page: 12,
  total_pages: 0,
});

const search = ref("");
const year = ref("");
const authorId = ref<number | "">("");

const isLoading = ref(false);
const isLoadingAuthors = ref(false);
const error = ref<string | null>(null);

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

async function loadBooks(): Promise<void> {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await getBooks({
      page: pagination.value.page,
      per_page: pagination.value.per_page,
      search: search.value.trim() || undefined,
      year: year.value ? Number(year.value) : undefined,
      author_id: authorId.value || undefined,
    });

    books.value = response.data.items;
    pagination.value = response.data.pagination;
  } catch (err) {
    console.error(err);

    error.value = "Не удалось загрузить каталог книг. Попробуйте ещё раз.";
  } finally {
    isLoading.value = false;
  }
}

async function loadAuthors(): Promise<void> {
  isLoadingAuthors.value = true;

  try {
    const response = await getAuthors({
      per_page: 100,
    });

    authors.value = response.data.items;
  } catch (err) {
    console.error(err);
  } finally {
    isLoadingAuthors.value = false;
  }
}

function changePage(page: number): void {
  if (
    page < 1 ||
    page > pagination.value.total_pages ||
    page === pagination.value.page
  ) {
    return;
  }

  pagination.value.page = page;

  void loadBooks();
}

function resetFilters(): void {
  search.value = "";
  year.value = "";
  authorId.value = "";
  pagination.value.page = 1;

  void loadBooks();
}

function getPageNumbers(): number[] {
  const totalPages = pagination.value.total_pages;
  const currentPage = pagination.value.page;

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ]);

  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

watch([search, year, authorId], () => {
  pagination.value.page = 1;

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    void loadBooks();
  }, 350);
});

onMounted(() => {
  void Promise.all([loadBooks(), loadAuthors()]);
});
</script>

<template>
  <main class="container py-4 py-lg-5">
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4"
    >
      <div>
        <h1 class="h2 mb-1">Книги</h1>

        <p class="text-secondary mb-0">Каталог книг</p>
      </div>

      <RouterLink
        v-if="isAuthenticated"
        :to="{ name: 'book-create' }"
        class="btn btn-primary"
      >
        <i class="bi bi-plus-lg me-1"></i>
        Добавить книгу
      </RouterLink>
    </div>

    <section class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-12 col-lg-5">
            <label for="book-search" class="form-label"> Поиск </label>

            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>

              <input
                v-model="search"
                type="search"
                class="form-control"
                placeholder="Название книги..."
              />
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3">
            <label for="book-author" class="form-label"> Автор </label>

            <select
              id="book-author"
              v-model="authorId"
              class="form-select"
              :disabled="isLoadingAuthors"
            >
              <option value="">Все авторы</option>

              <option
                v-for="author in authors"
                :key="author.id"
                :value="author.id"
              >
                {{ author.full_name }}
              </option>
            </select>
          </div>

          <div class="col-12 col-md-6 col-lg-2">
            <label for="book-year" class="form-label"> Год </label>

            <input
              v-model.number="year"
              type="number"
              min="1"
              class="form-control"
              placeholder="Год"
            />
          </div>

          <div class="col-12 col-lg-2 d-flex align-items-end">
            <button
              type="button"
              class="btn btn-outline-secondary w-100"
              @click="resetFilters"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="isLoading" class="py-5 text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden"> Загрузка... </span>
      </div>

      <p class="text-secondary mt-3 mb-0">Загружаем книги...</p>
    </div>

    <div
      v-else-if="error"
      class="alert alert-danger d-flex align-items-center justify-content-between gap-3"
      role="alert"
    >
      <div>
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
      </div>

      <button
        type="button"
        class="btn btn-outline-danger btn-sm"
        @click="loadBooks"
      >
        Повторить
      </button>
    </div>

    <div v-else-if="books.length === 0" class="text-center py-5">
      <i class="bi bi-book display-4 text-secondary"></i>

      <h2 class="h5 mt-3">Книги не найдены</h2>

      <p class="text-secondary mb-3">Попробуйте изменить параметры поиска.</p>

      <button
        type="button"
        class="btn btn-outline-primary"
        @click="resetFilters"
      >
        Сбросить фильтры
      </button>
    </div>

    <template v-else>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-secondary"> Найдено: {{ pagination.total }} </span>

        <span class="text-secondary small">
          Страница {{ pagination.page }} из {{ pagination.total_pages }}
        </span>
      </div>

      <div class="row g-4">
        <div
          v-for="book in books"
          :key="book.id"
          class="col-12 col-sm-6 col-lg-4 col-xl-3"
        >
          <BookCard :book="book" />
        </div>
      </div>

      <nav
        v-if="pagination.total_pages > 1"
        class="mt-5"
        aria-label="Пагинация книг"
      >
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: pagination.page === 1 }">
            <button
              class="page-link"
              type="button"
              :disabled="pagination.page === 1"
              @click="changePage(pagination.page - 1)"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>

          <li
            v-for="page in getPageNumbers()"
            :key="page"
            class="page-item"
            :class="{ active: page === pagination.page }"
          >
            <button type="button" class="page-link" @click="changePage(page)">
              {{ page }}
            </button>
          </li>

          <li
            class="page-item"
            :class="{
              disabled: pagination.page === pagination.total_pages,
            }"
          >
            <button
              class="page-link"
              type="button"
              :disabled="pagination.page === pagination.total_pages"
              @click="changePage(pagination.page + 1)"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </template>
  </main>
</template>

<style scoped lang="scss">
.book-card {
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

.book-card__cover {
  height: 300px;
  overflow: hidden;
  background: #f1f3f5;
}

.book-card__no-cover {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #adb5bd;
  font-size: 4rem;
}

.book-card__description {
  display: -webkit-box;
  overflow: hidden;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.object-fit-cover {
  object-fit: cover;
}
</style>
