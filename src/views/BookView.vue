<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { deleteBook } from "../api/books";

import { getBook } from "../api/books";

import type { Book } from "../types/book";
import { getApiErrorMessage } from "../api/error";

const route = useRoute();
const router = useRouter();

const book = ref<Book | null>(null);

const isLoading = ref(true);
const error = ref<string | null>(null);

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isDeleting = ref(false);

const loadBook = async (): Promise<void> => {
  isLoading.value = true;
  error.value = null;

  try {
    const id = Number(route.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error("Некорректный ID книги");
    }

    const response = await getBook(id);

    book.value = response.data;
  } catch (requestError) {
    error.value = getApiErrorMessage(
      requestError,
      "Не удалось загрузить информацию о книге.",
    );
  } finally {
    isLoading.value = false;
  }
};

const goBack = (): void => {
  router.back();
};

const handleDelete = async (): Promise<void> => {
  if (!book.value || isDeleting.value) {
    return;
  }

  const confirmed = window.confirm(`Удалить книгу «${book.value.title}»?`);

  if (!confirmed) {
    return;
  }

  isDeleting.value = true;

  try {
    await deleteBook(book.value.id);

    await router.push({
      name: "books",
    });
  } catch {
    error.value = "Не удалось удалить книгу.";
  } finally {
    isDeleting.value = false;
  }
};

onMounted(() => {
  void loadBook();
});
</script>

<template>
  <main class="container py-4 py-lg-5">
    <button type="button" class="btn btn-link px-0 mb-4" @click="goBack">
      <i class="bi bi-arrow-left me-2"></i>
      Назад
    </button>

    <div v-if="isLoading" class="book-page__loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden"> Загрузка... </span>
      </div>

      <p class="text-secondary mt-3 mb-0">Загружаем информацию о книге...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-exclamation-triangle"></i>

        <span>{{ error }}</span>
      </div>

      <button
        type="button"
        class="btn btn-outline-danger btn-sm mt-3"
        @click="loadBook"
      >
        Повторить
      </button>
    </div>

    <article v-else-if="book" class="book-page">
      <div class="row g-4 g-lg-5">
        <div class="col-12 col-md-5 col-lg-4">
          <div class="book-page__cover">
            <img
              v-if="book.cover_url"
              :src="book.cover_url"
              :alt="`Обложка книги «${book.title}»`"
              class="book-page__image"
            />

            <div v-else class="book-page__no-cover">
              <i class="bi bi-book"></i>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-7 col-lg-8">
          <div class="book-page__year text-secondary">
            {{ book.year }}
          </div>

          <h1 class="display-5 fw-semibold mb-3">
            {{ book.title }}
          </h1>

          <div class="mb-4">
            <div class="text-secondary small mb-2">Авторы</div>

            <div class="d-flex flex-wrap gap-2">
              <RouterLink
                v-for="author in book.authors"
                :key="author.id"
                :to="{
                  name: 'author',
                  params: {
                    id: author.id,
                  },
                }"
                class="badge text-bg-light border text-dark fw-normal"
              >
                <i class="bi bi-person me-1"></i>
                {{ author.full_name }}
              </RouterLink>
            </div>
          </div>

          <div v-if="book.isbn" class="mb-4">
            <div class="text-secondary small mb-1">ISBN</div>

            <div>
              {{ book.isbn }}
            </div>
          </div>

          <div v-if="book.description">
            <h2 class="h5 mb-2">О книге</h2>

            <p class="text-secondary book-page__description">
              {{ book.description }}
            </p>
          </div>

          <div class="d-flex gap-2">
            <RouterLink
              :to="{ name: 'books' }"
              class="btn btn-outline-secondary"
            >
              Назад
            </RouterLink>

            <RouterLink
              v-if="isAuthenticated"
              :to="{
                name: 'book-edit',
                params: { id: book.id },
              }"
              class="btn btn-primary"
            >
              <i class="bi bi-pencil me-1"></i>
              Редактировать
            </RouterLink>

            <button
              v-if="isAuthenticated"
              type="button"
              class="btn btn-outline-danger"
              :disabled="isDeleting"
              @click="handleDelete"
            >
              <span
                v-if="isDeleting"
                class="spinner-border spinner-border-sm me-1"
              ></span>

              <i v-else class="bi bi-trash me-1"></i>

              Удалить
            </button>
          </div>
        </div>
      </div>
    </article>
  </main>
</template>

<style scoped lang="scss">
.book-page__loading {
  min-height: 400px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.book-page__cover {
  width: 100%;
  max-width: 420px;

  aspect-ratio: 2 / 3;

  overflow: hidden;

  border-radius: 1rem;

  background: #f1f3f5;
  box-shadow: var(--bs-box-shadow);
}

.book-page__image {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;
}

.book-page__no-cover {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #adb5bd;
  font-size: 6rem;
}

.book-page__year {
  margin-bottom: 0.5rem;

  font-size: 1.1rem;
}

.book-page__description {
  max-width: 800px;

  white-space: pre-line;

  line-height: 1.75;
}
</style>
