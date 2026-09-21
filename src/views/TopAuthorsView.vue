<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { getTopAuthors, type TopAuthor } from "../api/reports";
import { getApiErrorMessage } from "../api/error";

const currentYear = new Date().getFullYear();

const year = ref(currentYear);
const authors = ref<TopAuthor[]>([]);

const isLoading = ref(false);
const error = ref("");

const hasData = computed(() => authors.value.length > 0);

const loadReport = async (): Promise<void> => {
  error.value = "";
  isLoading.value = true;

  try {
    const response = await getTopAuthors(year.value);

    authors.value = response.data.items;
  } catch (requestError) {
    error.value = getApiErrorMessage(
      requestError,
      "Не удалось загрузить отчёт.",
    );
    authors.value = [];
  } finally {
    isLoading.value = false;
  }
};

const handleYearChange = (): void => {
  void loadReport();
};

onMounted(() => {
  void loadReport();
});
</script>

<template>
  <div class="container py-4">
    <div
      class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
    >
      <div>
        <h1 class="h2 mb-1">ТОП авторов</h1>

        <p class="text-secondary mb-0">
          Авторы с наибольшим количеством книг за выбранный год
        </p>
      </div>

      <div class="report-year">
        <label for="report-year" class="form-label mb-1"> Год </label>

        <input
          id="report-year"
          v-model.number="year"
          type="number"
          min="1"
          :max="currentYear"
          class="form-control"
          @change="handleYearChange"
        />
      </div>
    </div>

    <div v-if="isLoading" class="d-flex justify-content-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden"> Загрузка... </span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      <div class="d-flex justify-content-between align-items-center gap-3">
        <span>{{ error }}</span>

        <button
          type="button"
          class="btn btn-sm btn-outline-danger"
          @click="loadReport"
        >
          Повторить
        </button>
      </div>
    </div>

    <div v-else-if="!hasData" class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <i class="bi bi-bar-chart text-secondary fs-1" aria-hidden="true"></i>

        <h2 class="h5 mt-3">Нет данных</h2>

        <p class="text-secondary mb-0">
          За {{ year }} год данных для отчёта нет.
        </p>
      </div>
    </div>

    <template v-else>
      <div class="card border-0 shadow-sm overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col" class="report-rank">#</th>

                <th scope="col">Автор</th>

                <th scope="col" class="text-end">Книг</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="author in authors" :key="author.author_id">
                <td>
                  <span
                    class="report-rank-badge"
                    :class="{
                      'report-rank-badge--top': author.rank <= 3,
                    }"
                  >
                    {{ author.rank }}
                  </span>
                </td>

                <td>
                  <RouterLink
                    :to="{
                      name: 'author',
                      params: {
                        id: author.author_id,
                      },
                    }"
                    class="fw-semibold text-body"
                  >
                    {{ author.full_name }}
                  </RouterLink>
                </td>

                <td class="text-end fw-semibold">
                  {{ author.books_count }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="text-secondary small mt-3">Отчёт за {{ year }} год</div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.report-year {
  width: 140px;
}

.report-rank {
  width: 70px;
}

.report-rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 2rem;
  height: 2rem;

  border-radius: 50%;

  background: var(--bs-light);
  color: var(--bs-secondary);
  font-size: 0.875rem;
  font-weight: 600;

  &--top {
    background: var(--bs-primary);
    color: #fff;
  }
}
</style>
