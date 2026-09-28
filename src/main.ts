import { createApp } from 'vue';
import { createPinia } from 'pinia';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import App from './App.vue';
import router from './router';

import './styles/main.css';

const startMockServer = async (): Promise<void> => {
  if (!import.meta.env.DEV) {
    return;
  }

  const { worker } = await import('./mocks/browser');
  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: `${baseUrl}mockServiceWorker.js`,
      options: {
        scope: baseUrl,
      },
    },
  });
};

const redirectToSavedPath = async (): Promise<void> => {
  const redirectPath = new URLSearchParams(window.location.search).get('redirect');

  if (!redirectPath) {
    return;
  }

  await router.push(redirectPath);
};

const mountApp = async (): Promise<void> => {
  await startMockServer();

  const app = createApp(App);

  app.use(createPinia());
  app.use(router);

  await redirectToSavedPath();
  app.mount('#app');
};

void mountApp();
