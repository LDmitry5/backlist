<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import BookForm from "../components/books/BookForm.vue";
import type { BookFormSubmit } from "../components/books/BookForm.vue";

import { getBook, patchBook, updateBook } from "../api/books";

import type { Book } from "../types/book";
import { getApiErrorMessage } from "../api/error.ts";

const route = useRoute();
const router = useRouter();

const book = ref<Book | null>(null);

const isLoading = ref(true);
const isSaving = ref(false);

const error = ref("");

function getBookId(): number | null {
  const id = Number(route.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

async function loadBook(): Promise<void> {
  const id = getBookId();

  if (!id) {
    error.value = "Некорректный идентификатор книги.";
    isLoading.value = false;
    return;
  }

  try {
    const response = await getBook(id);

    book.value = response.data;
  } catch (requestError) {
    error.value = getApiErrorMessage(
      requestError,
      "Не удалось загрузить книгу",
    );
  } finally {
    isLoading.value = false;
  }
}

async function handleSubmit(data: BookFormSubmit): Promise<void> {
  const id = getBookId();

  if (!id) {
    error.value = "Некорректный идентификатор книги.";
    return;
  }

  error.value = "";
  isSaving.value = true;

  try {
    let response;

    if (data.cover) {
      response = await updateBook(id, {
        title: data.title,
        year: data.year,
        description: data.description,
        isbn: data.isbn,
        author_ids: data.author_ids,
        cover: data.cover,
      });
    } else {
      response = await patchBook(id, {
        title: data.title,
        year: data.year,
        description: data.description,
        isbn: data.isbn,
        author_ids: data.author_ids,
      });
    }

    await router.push({
      name: "book",
      params: {
        id: response.data.id,
      },
    });
  } catch {
    error.value = "Не удалось сохранить изменения.";
  } finally {
    isSaving.value = false;
  }
}

function handleCancel(): void {
  if (book.value) {
    void router.push({
      name: "book",
      params: {
        id: book.value.id,
      },
    });

    return;
  }

  void router.push({
    name: "books",
  });
}

onMounted(() => {
  void loadBook();
});
</script>

<template>
  <div class="container py-4">
    <div v-if="isLoading" class="d-flex justify-content-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden"> Загрузка... </span>
      </div>
    </div>

    <template v-else>
      <div class="mb-4">
        <h1 class="h2 mb-2">Редактировать книгу</h1>

        <p class="text-secondary mb-0">Измените информацию о книге.</p>
      </div>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <BookForm
        v-else
        :book="book"
        :loading="isSaving"
        submit-text="Сохранить изменения"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </template>
  </div>
</template>
