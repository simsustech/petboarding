<template>
  <q-avatar :class="{ 'cursor-pointer': modelValue }" @click="open">
    <img v-if="modelValue" :src="modelValue" />
    <q-icon v-else :name="allowChange ? 'add_a_photo' : 'photo_camera'" />
  </q-avatar>
  <q-file
    ref="fileSelector"
    v-model="image"
    :label="lang.image"
    accept="image/png,image/jpeg"
    style="display: none"
    @update:model-value="setImage"
  />
</template>

<script lang="ts">
export default {
  name: 'ImageAvatar'
}
</script>

<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { QFile, QFileProps } from 'quasar'
import { useLang } from '../lang/index.js'

export interface Props {
  modelValue?: string
  allowChange?: boolean
}

const toBase64 = (file: File) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'open'): void
}>()

const lang = useLang()

const { allowChange, modelValue } = toRefs(props)
const fileSelector = ref<typeof QFile>()
const open = () => {
  if (props.allowChange) fileSelector.value?.pickFiles()
  else if (modelValue?.value) emit('open')
}
const image = ref<File>()

const setImage: QFileProps['onUpdate:modelValue'] = async (file) => {
  if (!import.meta.env.SSR) {
    const { readAndCompressImage } = await import('browser-image-resizer')
    const resizedImage = await readAndCompressImage(file, {
      maxHeight: 1000
    })
    const base64 = await toBase64(resizedImage)
    emit('update:modelValue', base64)
  }
}
</script>
