<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAuthStore } from "../stores/auth";
import { getApiErrorMessage } from "../api/error";

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();

const username = ref("");
const password = ref("");

const isLoading = ref(false);
const error = ref<string | null>(null);

const submit = async (): Promise<void> => {
  error.value = null;

  if (!username.value || !password.value) {
    error.value = "Введите логин и пароль.";
    return;
  }

  isLoading.value = true;

  try {
    await authStore.login({
      username: username.value,
      password: password.value,
    });

    const redirect = route.query.redirect;

    if (typeof redirect === "string" && redirect.startsWith("/")) {
      await router.push(redirect);
    } else {
      await router.push({
        name: "books",
      });
    }
  } catch (requestError) {
    error.value = getApiErrorMessage(
      requestError,
      "Не удалось выполнить вход. Проверьте логин и пароль.",
    );
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <main class="login-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-lg-5">
              <div class="text-center mb-4">
                <i class="bi bi-book display-5 text-primary"></i>

                <h1 class="h3 mt-3 mb-1">Вход</h1>

                <p class="text-secondary mb-0">Войдите в каталог книг</p>
              </div>

              <div v-if="error" class="alert alert-danger">
                {{ error }}
              </div>

              <form @submit.prevent="submit">
                <div class="mb-3">
                  <label for="username" class="form-label"> Логин </label>

                  <input
                    id="username"
                    v-model="username"
                    type="text"
                    class="form-control"
                    autocomplete="username"
                    :disabled="isLoading"
                  />
                </div>

                <div class="mb-4">
                  <label for="password" class="form-label"> Пароль </label>

                  <input
                    id="password"
                    v-model="password"
                    type="password"
                    class="form-control"
                    autocomplete="current-password"
                    :disabled="isLoading"
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100"
                  :disabled="isLoading"
                >
                  <span
                    v-if="isLoading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>

                  {{ isLoading ? "Входим..." : "Войти" }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;

  display: flex;
  align-items: center;

  padding: 2rem 0;

  background: #f8f9fa;
}
</style>
