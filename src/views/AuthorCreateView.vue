<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import AuthorForm from "../components/authors/AuthorForm.vue";

import { createAuthor } from "../api/authors";
import { getApiErrorMessage } from "../api/error";

const router = useRouter();

const isLoading = ref(false);
const error = ref("");

async function handleSubmit(fullName: string): Promise<void> {
  error.value = "";
  isLoading.value = true;

  try {
    const response = await createAuthor({
      full_name: fullName,
    });

    await router.push({
      name: "author",
      params: {
        id: response.data.id,
      },
    });
  } catch (requestError) {
    error.value = getApiErrorMessage(
      requestError,
      "Не удалось создать автора.",
    );
  } finally {
    isLoading.value = false;
  }
}

function handleCancel(): void {
  void router.push({
    name: "authors",
  });
}
</script>

<template>
  <div class="container py-4">
    <div class="mb-4">
      <h1 class="h2 mb-2">Добавить автора</h1>

      <p class="text-secondary mb-0">Добавьте нового автора в каталог.</p>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <AuthorForm
      :loading="isLoading"
      submit-text="Добавить автора"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </div>
</template>
