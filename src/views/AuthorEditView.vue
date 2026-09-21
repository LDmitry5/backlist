<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import AuthorForm from "../components/authors/AuthorForm.vue";

import { getAuthor, updateAuthor } from "../api/authors";

import type { Author } from "../types/author";

const route = useRoute();
const router = useRouter();

const author = ref<Author | null>(null);

const isLoading = ref(true);
const isSaving = ref(false);

const error = ref("");

const getAuthorId = (): number | null => {
  const id = Number(route.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
};

const loadAuthor = async (): Promise<void> => {
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
};

const handleSubmit = async (fullName: string): Promise<void> => {
  const id = getAuthorId();

  if (!id) {
    error.value = "Некорректный идентификатор автора.";
    return;
  }

  error.value = "";
  isSaving.value = true;

  try {
    const response = await updateAuthor(id, {
      full_name: fullName,
    });

    await router.push({
      name: "author",
      params: {
        id: response.data.id,
      },
    });
  } catch {
    error.value = "Не удалось сохранить изменения.";
  } finally {
    isSaving.value = false;
  }
};

const handleCancel = (): void => {
  if (author.value) {
    void router.push({
      name: "author",
      params: {
        id: author.value.id,
      },
    });

    return;
  }

  void router.push({
    name: "authors",
  });
};

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

    <template v-else>
      <div class="mb-4">
        <h1 class="h2 mb-2">Редактировать автора</h1>

        <p class="text-secondary mb-0">Измените имя автора.</p>
      </div>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <AuthorForm
        v-else
        :author="author"
        :loading="isSaving"
        submit-text="Сохранить изменения"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </template>
  </div>
</template>
