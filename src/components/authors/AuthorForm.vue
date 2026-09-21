<script setup lang="ts">
import { ref } from "vue";

import type { Author } from "../../types/author";

const props = withDefaults(
  defineProps<{
    author?: Author | null;
    loading?: boolean;
    submitText?: string;
  }>(),
  {
    author: null,
    loading: false,
    submitText: "Сохранить",
  },
);

const emit = defineEmits<{
  submit: [fullName: string];
  cancel: [];
}>();

const fullName = ref(props.author?.full_name ?? "");

const validationError = ref("");

function submit(): void {
  validationError.value = "";

  const value = fullName.value.trim();

  if (!value) {
    validationError.value = "Введите имя автора.";
    return;
  }

  emit("submit", value);
}
</script>

<template>
  <form class="card border-0 shadow-sm" @submit.prevent="submit">
    <div class="card-body p-4">
      <div v-if="validationError" class="alert alert-danger">
        {{ validationError }}
      </div>

      <div class="mb-4">
        <label for="author-full-name" class="form-label"> Имя автора </label>

        <input
          id="author-full-name"
          v-model="fullName"
          type="text"
          class="form-control"
          placeholder="Например, Лев Толстой"
          :disabled="loading"
          autocomplete="off"
        />
      </div>

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
