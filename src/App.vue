<script setup lang="ts">
import EmojiMaker from './components/EmojiMaker.vue'
import { useLanguageStore } from './stores/language'
import { storeToRefs } from 'pinia'

const languageStore = useLanguageStore()
const { currentLanguage } = storeToRefs(languageStore)
const { setLanguage, t } = languageStore

const toggleLanguage = () => {
  setLanguage(currentLanguage.value === 'zh' ? 'en' : 'zh')
}

const githubUrl = 'https://github.com/CaiJingLong/emoji-maker.git'
</script>

<template>
  <div class="app">
    <header>
      <h1>{{ t('app.title') }}</h1>
      <div class="header-buttons">
        <a :href="githubUrl" target="_blank" class="github-link">GitHub</a>
        <button class="lang-toggle" @click="toggleLanguage">
          {{ currentLanguage === 'zh' ? 'English' : '中文' }}
        </button>
      </div>
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
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

.app {
  font-family: Arial, sans-serif;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

header {
  background-color: #2c3e50;
  color: white;
  padding: 0.5rem 1rem;
  text-align: center;
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

main {
  flex: 1;
  display: flex;
  width: 100%;
  justify-content: center;
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

.lang-toggle {
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.lang-toggle:hover {
  background-color: white;
  color: #2c3e50;
}

.header-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.github-link {
  background-color: transparent;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.github-link:hover {
  background-color: white;
  color: #2c3e50;
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
