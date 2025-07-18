<template>
  <div>
    <q-avatar :class="{ 'cursor-pointer': modelValue }" @click="open">
      <img v-if="modelValue" :src="modelValue" />
      <q-icon v-else size="lg" name="i-mdi-camera" />
    </q-avatar>
    <q-btn
      v-if="allowChange"
      color="white"
      text-color="black"
      rounded
      size="xs"
      padding="xs"
      style="position: relative; right: 18px; bottom: -15px"
      :icon="modelValue ? 'i-mdi-edit' : 'i-mdi-add'"
      @click="pickFiles"
    ></q-btn>
    <q-file
      ref="fileSelector"
      v-model="image"
      :label="lang.image"
      accept="capture=camera,image/png,image/jpeg,.dummy"
      style="display: none"
      @update:model-value="setImage"
    />
  </div>
  <responsive-dialog
    ref="imageDialog"
    padding
    :icons="{ close: 'i-mdi-close' }"
    persistent
    display
  >
    <base64-image class="text-center" :model-value="modelValue" />
  </responsive-dialog>
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
import { ResponsiveDialog } from '@simsustech/quasar-components'
import Base64Image from './Base64Image.vue'
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
const pickFiles = () => fileSelector.value?.pickFiles()
const open = () => {
  if (modelValue?.value) imageDialog.value.functions.open()
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

const imageDialog = ref<typeof ResponsiveDialog>()
</script>
