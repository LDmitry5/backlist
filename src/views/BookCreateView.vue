<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import BookForm from "../components/books/BookForm.vue";
import type { BookFormSubmit } from "../components/books/BookForm.vue";

import { createBook } from "../api/books";
import { getApiErrorMessage } from "../api/error.ts";

const router = useRouter();

const isLoading = ref(false);
const error = ref("");

async function handleSubmit(data: BookFormSubmit): Promise<void> {
  error.value = "";
  isLoading.value = true;

  try {
    if (!data.cover) {
      error.value = "Выберите обложку книги.";
      return;
    }

    const response = await createBook({
      title: data.title,
      year: data.year,
      description: data.description,
      isbn: data.isbn,
      author_ids: data.author_ids,
      cover: data.cover,
    });

    await router.push({
      name: "book",
      params: {
        id: response.data.id,
      },
    });
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError, "Не удалось создать книгу");
  } finally {
    isLoading.value = false;
  }
}

function handleCancel(): void {
  void router.push({
    name: "books",
  });
}
</script>

<template>
  <div class="container py-4">
    <div class="mb-4">
      <h1 class="h2 mb-2">Добавить книгу</h1>

      <p class="text-secondary mb-0">Заполните информацию о новой книге.</p>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <BookForm
      :loading="isLoading"
      submit-text="Добавить книгу"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>
