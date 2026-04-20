<script setup>
import { ref, inject } from 'vue'

const props = defineProps({
  greeting: String
})

const { setupUpdates } = inject('dependencies')

const message = ref(props.greeting || 'Hello')
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

setupUpdates({
  changeMessage,
  increment,
  getCount
})
</script>

<template>
  <div class="hello">
    <h2>{{ message }}</h2>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<style>
.hello {
  padding: 10px;
  background: #f0f0f0;
  border-radius: 4px;
}
.hello h2 {
  margin: 0 0 10px;
}
</style>