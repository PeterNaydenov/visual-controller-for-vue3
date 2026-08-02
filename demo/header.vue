<script setup>
import { ref, inject } from 'vue'

const props = defineProps({
  greeting: { type: String, default: 'Hello from Header!' }
})

const { setupUpdates } = inject('dependencies')

const message = ref(props.greeting)
const count = ref(0)

function changeMessage(newMsg) {
  message.value = newMsg
}

function increment() {
  count.value++
}

function getCount() {
  return count.value
}

setupUpdates({ changeMessage, increment, getCount })
</script>

<template>
  <div class="hello">
    <h3>{{ message }}</h3>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<style>
.hello { padding: 10px; background: #f0f0f0; border-radius: 4px; }
.hello h3 { margin: 0 0 10px; }
.hello button { margin-right: 5px; }
</style>
