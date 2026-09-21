<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

const username = computed(() => authStore.user?.username ?? "");

function logout(): void {
  authStore.logout();

  void router.push({
    name: "login",
  });
}
</script>

<template>
  <header class="navbar navbar-expand-lg bg-white border-bottom">
    <div class="container">
      <!-- Logo -->
      <RouterLink to="/books" class="navbar-brand fw-semibold">
        <i class="bi bi-book me-2"></i>
        Book Catalog
      </RouterLink>

      <!-- Mobile toggle -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#main-navigation"
        aria-controls="main-navigation"
        aria-expanded="false"
        aria-label="Открыть меню"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="main-navigation" class="collapse navbar-collapse">
        <!-- Navigation -->
        <nav class="navbar-nav me-auto">
          <RouterLink to="/books" class="nav-link" active-class="active">
            Книги
          </RouterLink>

          <RouterLink to="/authors" class="nav-link" active-class="active">
            Авторы
          </RouterLink>

          <RouterLink
            to="/reports/top-authors"
            class="nav-link"
            active-class="active"
          >
            ТОП авторов
          </RouterLink>
        </nav>

        <!-- User -->
        <div class="d-flex align-items-center gap-3">
          <template v-if="isAuthenticated">
            <span class="text-secondary small">
              <i class="bi bi-person me-1"></i>
              {{ username }}
            </span>

            <button
              type="button"
              class="btn btn-outline-secondary btn-sm"
              @click="logout"
            >
              Выйти
            </button>
          </template>

          <RouterLink v-else to="/login" class="btn btn-primary btn-sm">
            Войти
          </RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.navbar-brand {
  white-space: nowrap;
}

.nav-link {
  &.active {
    font-weight: 600;
  }
}
</style>
