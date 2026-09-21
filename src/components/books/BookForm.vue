<script setup lang="ts">
import { onMounted, ref } from "vue";

import { getAuthors } from "../../api/authors";
import type { AuthorShort } from "../../types/author";
import type { Book } from "../../types/book";

export interface BookFormSubmit {
  title: string;
  year: number;
  description: string;
  isbn: string;
  author_ids: number[];
  cover: File | null;
}

const props = withDefaults(
  defineProps<{
    book?: Book | null;
    loading?: boolean;
    submitText?: string;
  }>(),
  {
    book: null,
    loading: false,
    submitText: "Сохранить",
  },
);

const emit = defineEmits<{
  submit: [data: BookFormSubmit];
  cancel: [];
}>();

const title = ref("");
const year = ref<number | null>(null);
const description = ref("");
const isbn = ref("");
const authorIds = ref<number[]>([]);
const cover = ref<File | null>(null);

const authors = ref<AuthorShort[]>([]);
const isLoadingAuthors = ref(false);
const authorsError = ref("");

const validationError = ref("");

function initializeForm(): void {
  if (!props.book) {
    return;
  }

  title.value = props.book.title;
  year.value = props.book.year;
  description.value = props.book.description ?? "";
  isbn.value = props.book.isbn ?? "";
  authorIds.value = props.book.authors.map((author) => author.id);
}

async function loadAuthors(): Promise<void> {
  isLoadingAuthors.value = true;
  authorsError.value = "";

  try {
    const response = await getAuthors({
      per_page: 100,
    });

    authors.value = response.data.items;
  } catch {
    authorsError.value = "Не удалось загрузить список авторов.";
  } finally {
    isLoadingAuthors.value = false;
  }
}

function handleCoverChange(event: Event): void {
  const input = event.target as HTMLInputElement;

  cover.value = input.files?.[0] ?? null;
}

function validate(): boolean {
  validationError.value = "";

  if (!title.value.trim()) {
    validationError.value = "Введите название книги.";
    return false;
  }

  if (!year.value) {
    validationError.value = "Введите год издания.";
    return false;
  }

  if (authorIds.value.length === 0) {
    validationError.value = "Выберите хотя бы одного автора.";
    return false;
  }

  if (!props.book && !cover.value) {
    validationError.value = "Выберите обложку книги.";
    return false;
  }

  return true;
}

function submit(): void {
  if (!validate() || !year.value) {
    return;
  }

  emit("submit", {
    title: title.value.trim(),
    year: year.value,
    description: description.value.trim(),
    isbn: isbn.value.trim(),
    author_ids: authorIds.value,
    cover: cover.value,
  });
}

onMounted(() => {
  initializeForm();
  void loadAuthors();
});
</script>

<template>
  <form class="card border-0 shadow-sm" @submit.prevent="submit">
    <div class="card-body p-4">
      <div v-if="validationError" class="alert alert-danger">
        {{ validationError }}
      </div>

      <div v-if="authorsError" class="alert alert-danger">
        {{ authorsError }}
      </div>

      <!-- Название -->
      <div class="mb-3">
        <label for="book-title" class="form-label"> Название </label>

        <input
          id="book-title"
          v-model="title"
          type="text"
          class="form-control"
          placeholder="Введите название книги"
          :disabled="loading"
        />
      </div>

      <!-- Год -->
      <div class="mb-3">
        <label for="book-year" class="form-label"> Год издания </label>

        <input
          id="book-year"
          v-model.number="year"
          type="number"
          min="1"
          class="form-control"
          placeholder="Например, 2024"
          :disabled="loading"
        />
      </div>

      <!-- Авторы -->
      <div class="mb-3">
        <label for="book-authors" class="form-label"> Авторы </label>

        <select
          id="book-authors"
          v-model="authorIds"
          class="form-select"
          multiple
          :disabled="loading || isLoadingAuthors"
        >
          <option v-for="author in authors" :key="author.id" :value="author.id">
            {{ author.full_name }}
          </option>
        </select>

        <div class="form-text">Можно выбрать нескольких авторов.</div>

        <div v-if="isLoadingAuthors" class="form-text">Загрузка авторов...</div>
      </div>

      <!-- ISBN -->
      <div class="mb-3">
        <label for="book-isbn" class="form-label"> ISBN </label>

        <input
          id="book-isbn"
          v-model="isbn"
          type="text"
          class="form-control"
          placeholder="Необязательно"
          :disabled="loading"
        />
      </div>

      <!-- Описание -->
      <div class="mb-3">
        <label for="book-description" class="form-label"> Описание </label>

        <textarea
          id="book-description"
          v-model="description"
          class="form-control"
          rows="5"
          placeholder="Необязательно"
          :disabled="loading"
        ></textarea>
      </div>

      <!-- Обложка -->
      <div class="mb-4">
        <label for="book-cover" class="form-label"> Обложка </label>

        <input
          id="book-cover"
          type="file"
          class="form-control"
          accept="image/*"
          :disabled="loading"
          @change="handleCoverChange"
        />

        <div class="form-text">
          {{
            book
              ? "Не выбирайте файл, если хотите оставить текущую обложку."
              : "Обложка обязательна."
          }}
        </div>
      </div>

      <!-- Actions -->
      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          ></span>

          {{ submitText }}
        </button>

        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="loading"
          @click="emit('cancel')"
        >
          Отмена
        </button>
      </div>
    </div>
  </form>
</template>
