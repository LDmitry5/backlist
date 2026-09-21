import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { login as loginRequest } from '../api/auth';

import type {
  AuthUser,
  LoginRequest,
} from '../types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

function getStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);

    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(
    localStorage.getItem(TOKEN_KEY),
  );

  const user = ref<AuthUser | null>(
    getStoredUser(),
  );

  const isAuthenticated = computed(() => {
    return Boolean(token.value);
  });

  async function login(
    credentials: LoginRequest,
  ): Promise<void> {
    const response = await loginRequest(credentials);

    token.value = response.data.token;
    user.value = response.data.user;

    localStorage.setItem(
      TOKEN_KEY,
      response.data.token,
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(response.data.user),
    );
  }

  function logout(): void {
    token.value = null;
    user.value = null;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  };
});