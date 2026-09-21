<script setup lang="ts">
import type { Book } from "../../types/book";

defineProps<{
  book: Book;
}>();
</script>

<template>
  <article class="book-card card h-100 border-0 shadow-sm">
    <RouterLink
      :to="{
        name: 'book',
        params: {
          id: book.id,
        },
      }"
      class="book-card__cover-link"
    >
      <div class="book-card__cover">
        <img
          v-if="book.cover_url"
          :src="book.cover_url"
          :alt="`Обложка книги «${book.title}»`"
          class="book-card__image"
        />

        <div v-else class="book-card__no-cover" aria-hidden="true">
          <i class="bi bi-book"></i>
        </div>
      </div>
    </RouterLink>

    <div class="card-body d-flex flex-column">
      <div class="book-card__year text-secondary small">
        {{ book.year }}
      </div>

      <h2 class="book-card__title h5">
        {{ book.title }}
      </h2>

      <div class="book-card__authors">
        <RouterLink
          v-for="(author, index) in book.authors"
          :key="author.id"
          :to="{
            name: 'author',
            params: {
              id: author.id,
            },
          }"
          class="book-card__author"
        >
          {{ author.full_name
          }}<span v-if="index < book.authors.length - 1">, </span>
        </RouterLink>
      </div>

      <p
        v-if="book.description"
        class="book-card__description text-secondary small"
      >
        {{ book.description }}
      </p>

      <div class="mt-auto pt-3">
        <RouterLink
          :to="{
            name: 'book',
            params: {
              id: book.id,
            },
          }"
          class="btn btn-outline-primary btn-sm"
        >
          Подробнее
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
.book-card {
  overflow: hidden;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

.book-card__cover-link {
  display: block;
  color: inherit;
}

.book-card__cover {
  height: 300px;
  overflow: hidden;
  background: #f1f3f5;
}

.book-card__image {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: cover;

  transition: transform 0.3s ease;
}

.book-card:hover .book-card__image {
  transform: scale(1.03);
}

.book-card__no-cover {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #adb5bd;
  font-size: 4rem;
}

.book-card__year {
  margin-bottom: 0.25rem;
}

.book-card__title {
  margin-bottom: 0.5rem;
}

.book-card__authors {
  margin-bottom: 0.75rem;

  line-height: 1.4;
}

.book-card__author {
  color: inherit;

  &:hover {
    color: var(--bs-primary);
  }
}

.book-card__description {
  display: -webkit-box;
  overflow: hidden;
  margin-bottom: 0;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>
