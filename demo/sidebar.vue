<script setup>
import { ref, inject } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Sidebar' }
})

const { setupUpdates } = inject('dependencies')

const items = ref([ 'Apples', 'Oranges', 'Pears' ])
const filter = ref('')

function addItem(name) {
  if (name) items.value.push(name)
}

function removeItem(idx) {
  items.value.splice(idx, 1)
}

function setFilter(text) {
  filter.value = text
}

const visible = () => items.value.filter(i => i.toLowerCase().includes(filter.value.toLowerCase()))

setupUpdates({ addItem, removeItem, setFilter })
</script>

<template>
  <div class="hello">
    <h3>{{ title }}</h3>
    <input :value="filter" @input="e => setFilter(e.target.value)" placeholder="filter..." />
    <ul>
      <li v-for="(item, idx) in visible()" :key="item">
        {{ item }}
        <button @click="removeItem(idx)">x</button>
      </li>
    </ul>
  </div>
</template>

<style>
.hello { padding: 10px; background: #fff8e1; border-radius: 4px; }
.hello h3 { margin: 0 0 10px; }
.hello ul { padding-left: 20px; margin: 5px 0; }
.hello li { margin: 2px 0; }
.hello button { margin-left: 5px; }
.hello input { margin-bottom: 5px; padding: 2px 4px; width: 100%; box-sizing: border-box; }
</style>
