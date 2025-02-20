<script setup lang="ts">
import EmojiMaker from './components/EmojiMaker.vue'
</script>

<template>
  <div class="app">
    <header>
      <h1>Emoji Maker</h1>
    </header>
    <main>
      <EmojiMaker />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.app {
  font-family: Arial, sans-serif;
  width: 100%;
  overflow-x: hidden;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 0.5rem 1rem;
  text-align: center;
}

main {
  width: 100%;
  overflow-x: hidden;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
