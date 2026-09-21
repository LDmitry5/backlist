<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import { getAuthors, type AuthorsQuery } from "../api/authors";

import type { AuthorShort } from "../types/author";

import { useAuthStore } from "../stores/auth";
import { getApiErrorMessage } from "../api/error";

const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

const authors = ref<AuthorShort[]>([]);

const page = ref(1);
const perPage = 12;

const total = ref(0);
const totalPages = ref(1);

const search = ref("");

const isLoading = ref(false);
const error = ref("");

let searchTimeout: ReturnType<typeof setTimeout> | undefined;

async function loadAuthors(): Promise<void> {
  isLoading.value = true;
  error.value = "";

  const params: AuthorsQuery = {
    page: page.value,
    per_page: perPage,
  };

  if (search.value.trim()) {
    params.search = search.value.trim();
  }

  try {
    const response = await getAuthors(params);

    authors.value = response.data.items;

    total.value = response.data.pagination.total;
    totalPages.value = response.data.pagination.total_pages;
  } catch (requestError) {
    error.value = getApiErrorMessage(
      requestError,
      "Не удалось загрузить авторов.",
    );
  } finally {
    isLoading.value = false;
  }
}

function goToPage(nextPage: number): void {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === page.value) {
    return;
  }

  page.value = nextPage;

  void loadAuthors();
}

const visiblePages = computed(() => {
  const pages: number[] = [];

  const start = Math.max(1, page.value - 2);

  const end = Math.min(totalPages.value, page.value + 2);

  for (let current = start; current <= end; current += 1) {
    pages.push(current);
  }

  return pages;
});

watch(search, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    page.value = 1;
    void loadAuthors();
  }, 350);
});

onMounted(() => {
  void loadAuthors();
});
</script>

<template>
  <div class="container py-4">
    <!-- Header -->
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
    >
      <div>
        <h1 class="h2 mb-1">Авторы</h1>

        <p class="text-secondary mb-0">Авторы каталога книг</p>
      </div>

      <RouterLink
        v-if="isAuthenticated"
        :to="{ name: 'author-create' }"
        class="btn btn-primary"
      >
        <i class="bi bi-plus-lg me-1"></i>
        Добавить автора
      </RouterLink>
    </div>

    <!-- Search -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <label for="authors-search" class="form-label"> Поиск </label>

        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>

          <input
            id="authors-search"
            v-model="search"
            type="search"
            class="form-control"
            placeholder="Введите имя автора"
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="d-flex justify-content-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden"> Загрузка... </span>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}

      <button
        type="button"
        class="btn btn-sm btn-outline-danger ms-2"
        @click="loadAuthors"
      >
        Повторить
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="authors.length === 0" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <i class="bi bi-person-x text-secondary fs-1" aria-hidden="true"></i>

        <h2 class="h5 mt-3">Авторы не найдены</h2>

        <p class="text-secondary mb-0">Попробуйте изменить поисковый запрос.</p>
      </div>
    </div>

    <!-- Authors -->
    <template v-else>
      <div class="row g-3">
        <div
          v-for="author in authors"
          :key="author.id"
          class="col-12 col-sm-6 col-lg-4 col-xl-3"
        >
          <RouterLink
            :to="{
              name: 'author',
              params: { id: author.id },
            }"
            class="author-card card h-100 border-0 shadow-sm"
          >
            <div class="card-body">
              <div class="author-card__icon mb-3">
                <i class="bi bi-person" aria-hidden="true"></i>
              </div>

              <h2 class="h5 mb-0">
                {{ author.full_name }}
              </h2>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Pagination -->
      <nav
        v-if="totalPages > 1"
        class="mt-4"
        aria-label="Навигация по страницам"
      >
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: page === 1 }">
            <button
              type="button"
              class="page-link"
              :disabled="page === 1"
              @click="goToPage(page - 1)"
            >
              Назад
            </button>
          </li>

          <li
            v-for="pageNumber in visiblePages"
            :key="pageNumber"
            class="page-item"
            :class="{ active: pageNumber === page }"
          >
            <button
              type="button"
              class="page-link"
              @click="goToPage(pageNumber)"
            >
              {{ pageNumber }}
            </button>
          </li>

          <li class="page-item" :class="{ disabled: page === totalPages }">
            <button
              type="button"
              class="page-link"
              :disabled="page === totalPages"
              @click="goToPage(page + 1)"
            >
              Вперёд
            </button>
          </li>
        </ul>
      </nav>

      <div class="text-center text-secondary small mt-3">
        Найдено авторов: {{ total }}
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.author-card {
  color: inherit;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    color: inherit;
    transform: translateY(-3px);
  }
}

.author-card__icon {
  width: 3rem;
  height: 3rem;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: var(--bs-light);
  color: var(--bs-primary);

  font-size: 1.5rem;
}
</style>
