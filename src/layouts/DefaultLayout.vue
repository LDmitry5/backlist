<script setup lang="ts">
import AppHeader from "../components/layout/AppHeader.vue";
</script>

<template>
  <div class="app-layout">
    <AppHeader />

    <main class="app-layout__content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.app-layout__content {
  flex: 1;
}
</style>
