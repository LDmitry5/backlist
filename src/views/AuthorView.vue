<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { useRoute, useRouter } from "vue-router";

import { deleteAuthor, getAuthor } from "../api/authors";

import type { Author } from "../types/author";

import { useAuthStore } from "../stores/auth";
import { getApiErrorMessage } from "../api/error";

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();

const author = ref<Author | null>(null);

const isLoading = ref(true);
const isDeleting = ref(false);

const error = ref("");

const isAuthenticated = computed(() => authStore.isAuthenticated);

function getAuthorId(): number | null {
  const id = Number(route.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

async function loadAuthor(): Promise<void> {
  const id = getAuthorId();

  if (!id) {
    error.value = "Некорректный идентификатор автора.";
    isLoading.value = false;
    return;
  }

  try {
    const response = await getAuthor(id);

    author.value = response.data;
  } catch {
    error.value = "Не удалось загрузить автора.";
  } finally {
    isLoading.value = false;
  }
}

async function handleDelete(): Promise<void> {
  if (!author.value || isDeleting.value) {
    return;
  }

  const confirmed = window.confirm(
    `Удалить автора «${author.value.full_name}»?`,
  );

  if (!confirmed) {
    return;
  }

  isDeleting.value = true;
  error.value = "";

  try {
    await deleteAuthor(author.value.id);

    await router.push({
      name: "authors",
    });
  } catch (requestError) {
    error.value = getApiErrorMessage(
      requestError,
      "Не удалось удалить автора.",
    );
  } finally {
    isDeleting.value = false;
  }
}

onMounted(() => {
  void loadAuthor();
});
</script>

<template>
  <div class="container py-4">
    <div v-if="isLoading" class="d-flex justify-content-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden"> Загрузка... </span>
      </div>
    </div>

    <div v-else-if="error && !author" class="alert alert-danger">
      {{ error }}
    </div>

    <template v-else-if="author">
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Заголовок -->
      <div
        class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
      >
        <div>
          <div class="text-secondary small mb-1">Автор</div>

          <h1 class="h2 mb-0">
            {{ author.full_name }}
          </h1>
        </div>

        <div class="d-flex gap-2">
          <RouterLink
            :to="{ name: 'authors' }"
            class="btn btn-outline-secondary"
          >
            Назад
          </RouterLink>

          <RouterLink
            v-if="isAuthenticated"
            :to="{
              name: 'author-edit',
              params: { id: author.id },
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
              aria-hidden="true"
            ></span>

            <i v-else class="bi bi-trash me-1"></i>

            Удалить
          </button>
        </div>
      </div>

      <!-- Книги -->
      <section>
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2 class="h4 mb-0">Книги автора</h2>

          <span class="badge text-bg-secondary">
            {{ author.books.length }}
          </span>
        </div>

        <div v-if="author.books.length" class="row g-3">
          <div
            v-for="book in author.books"
            :key="book.id"
            class="col-12 col-sm-6 col-lg-4"
          >
            <RouterLink
              :to="{
                name: 'book',
                params: { id: book.id },
              }"
              class="author-book card h-100 border-0 shadow-sm"
            >
              <div class="card-body">
                <div class="text-secondary small mb-1">
                  {{ book.year }}
                </div>

                <h3 class="h5 mb-0">
                  {{ book.title }}
                </h3>
              </div>
            </RouterLink>
          </div>
        </div>

        <div v-else class="card border-0 shadow-sm">
          <div class="card-body text-center py-5">
            <i class="bi bi-book text-secondary fs-1" aria-hidden="true"></i>

            <p class="text-secondary mt-3 mb-0">
              У этого автора пока нет книг.
            </p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped lang="scss">
.author-book {
  color: inherit;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    color: inherit;
    transform: translateY(-2px);
  }
}
</style>
