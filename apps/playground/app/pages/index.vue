<script setup lang="ts">
const loadingSuccess = ref(false)
const loadingError = ref(false)
const loadingWideEvent = ref(false)

function testClientLog() {
  log.info('ui', 'Button clicked from client')
  log.info({ action: 'test_client', timestamp: Date.now() })
}

function testClientWarn() {
  log.warn('validation', 'Form field is empty')
}

function testClientError() {
  log.error('validation', 'Form field is empty')
}

function testStructuredError() {
  const error = defineError({
    message: 'Test structured error',
    why: 'This is a demonstration of the EvlogError format',
    fix: 'No fix needed - this is just a demo',
    link: 'https://github.com/HugoRCD/evlog',
  })
  console.error(String(error))
}

async function testApiSuccess() {
  loadingSuccess.value = true
  try {
    await $fetch('/api/test/success')
  } finally {
    loadingSuccess.value = false
  }
}

async function testApiError() {
  loadingError.value = true
  try {
    await $fetch('/api/test/error')
  } catch {
    // Do nothing
  } finally {
    loadingError.value = false
  }
}

async function testWideEvent() {
  loadingWideEvent.value = true
  try {
    await $fetch('/api/test/wide-event')
  } finally {
    loadingWideEvent.value = false
  }
}
</script>

<template>
  <div class="min-h-dvh bg-default p-8">
    <div class="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 class="text-3xl font-bold text-highlighted">
          evlog Playground
        </h1>
        <p class="text-muted mt-2">
          Test wide events, structured errors, and logging. Check the browser console and terminal for output.
        </p>
      </header>

      <section class="space-y-4">
        <h2 class="text-xl font-semibold text-highlighted">
          Client-side Logging
        </h2>
        <p class="text-muted text-sm">
          These logs appear in the browser console with pretty formatting.
        </p>
        <div class="flex flex-wrap gap-3">
          <UButton
            label="log.info()"
            @click="testClientLog"
          />
          <UButton
            label="log.warn()"
            color="warning"
            @click="testClientWarn"
          />
          <UButton
            label="log.error()"
            color="error"
            @click="testClientError"
          />
          <UButton
            label="defineError()"
            color="error"
            @click="testStructuredError"
          />
        </div>
      </section>

      <USeparator />

      <section class="space-y-4">
        <h2 class="text-xl font-semibold text-highlighted">
          Server-side Wide Events
        </h2>
        <p class="text-muted text-sm">
          These calls trigger API endpoints that use <code class="text-highlighted">useLogger(event)</code> to build wide events.
          Check the terminal for structured output.
        </p>
        <div class="flex flex-wrap gap-3">
          <UButton
            label="Test Success"
            :loading="loadingSuccess"
            @click="testApiSuccess"
          />
          <UButton
            label="Test Error"
            :loading="loadingError"
            color="error"
            @click="testApiError"
          />
          <UButton
            label="Test Wide Event"
            :loading="loadingWideEvent"
            color="neutral"
            @click="testWideEvent"
          />
        </div>
      </section>
    </div>
  </div>
</template>
