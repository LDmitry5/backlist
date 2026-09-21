import {
  createRouter,
  createWebHistory,
} from 'vue-router';

import DefaultLayout from '../layouts/DefaultLayout.vue';

import BooksView from '../views/BooksView.vue';
import BookView from '../views/BookView.vue';
import BookCreateView from '../views/BookCreateView.vue';
import BookEditView from '../views/BookEditView.vue';

import AuthorsView from '../views/AuthorsView.vue';
import AuthorView from '../views/AuthorView.vue';
import AuthorCreateView from '../views/AuthorCreateView.vue';
import AuthorEditView from '../views/AuthorEditView.vue';

import LoginView from '../views/LoginView.vue';
import TopAuthorsView from '../views/TopAuthorsView.vue';

import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      component: DefaultLayout,

      children: [
        {
          path: '',
          redirect: {
            name: 'books',
          },
        },

        {
          path: 'books',
          name: 'books',
          component: BooksView,
        },

        {
          path: 'books/create',
          name: 'book-create',
          component: BookCreateView,

          meta: {
            requiresAuth: true,
          },
        },

        {
          path: 'books/:id/edit',
          name: 'book-edit',
          component: BookEditView,

          meta: {
            requiresAuth: true,
          },
        },

        {
          path: 'books/:id',
          name: 'book',
          component: BookView,
        },

        {
          path: 'authors',
          name: 'authors',
          component: AuthorsView,
        },

        {
          path: 'authors/create',
          name: 'author-create',
          component: AuthorCreateView,
          meta: {
            requiresAuth: true,
          },
        },
        
        {
          path: 'authors/:id/edit',
          name: 'author-edit',
          component: AuthorEditView,
          meta: {
            requiresAuth: true,
          },
        },

        {
          path: 'authors/:id',
          name: 'author',
          component: AuthorView,
        },

        {
          path: 'reports/top-authors',
          name: 'top-authors',
          component: TopAuthorsView,
        },
      ],
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView,

      meta: {
        guestOnly: true,
      },
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return {
      name: 'books',
    };
  }

  return true;
});

export default router;