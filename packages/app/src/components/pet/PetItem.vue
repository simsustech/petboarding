<template>
  <q-item :class="{ 'bg-grey-5': modelValue.deceased }">
    <q-item-section avatar>
      <image-avatar :model-value="modelValue.image" />
    </q-item-section>
    <q-item-section>
      <q-item-label overline>
        <div v-if="showWarnings">
          <div v-if="!modelValue.categoryId" class="row">
            <q-icon name="i-mdi-warning" color="red" />
            {{ lang.pet.messages.noCategoryAssigned }}
          </div>
          <div v-if="modelValue.chemicalSterilizationDate" class="row">
            <q-icon name="i-mdi-info" color="yellow" />
            {{ lang.pet.messages.isChemicallySterilized }}
          </div>
        </div>
      </q-item-label>
      <q-item-label>{{ modelValue.name }}</q-item-label>
      <q-item-label caption>
        <div class="row">
          {{
            `${modelValue.breed}, ${lang.pet.genders[modelValue.gender]} ${
              modelValue.color ? ', ' + modelValue.color : ''
            }`
          }}
        </div>
        <div class="row">
          {{ modelValue.sterilized ? lang.pet.fields.sterilized : '' }}
        </div>
      </q-item-label>
      <q-item-label v-if="modelValue.particularities">
        <q-field stack-label :label="lang.pet.fields.particularities">
          <template #control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ modelValue.particularities }}
            </div>
          </template>
        </q-field>
      </q-item-label>
      <q-item-label v-if="modelValue.comments">
        <q-field stack-label :label="lang.pet.fields.comments">
          <template #control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ modelValue.comments }}
            </div>
          </template>
        </q-field>
      </q-item-label>
    </q-item-section>
    <q-item-section side>
      <q-item-label>
        <q-rating
          v-if="modelValue.rating"
          class="q-mr-md"
          :model-value="modelValue.rating"
          size="sm"
          icon="i-mdi-star-border"
          icon-selected="i-mdi-star"
          icon-half="i-mdi-star-half"
        />
        <q-btn
          v-if="showEditButton"
          v-close-popup
          icon="i-mdi-edit"
          data-testid="edit-button"
          @click="edit"
        />
      </q-item-label>
    </q-item-section>
    <slot name="default"> </slot>
  </q-item>
</template>

<script lang="ts">
export default {
  name: 'PetItem'
}
</script>

<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { QItem } from 'quasar'
import { useLang } from '../../lang/index.js'
import { Pet as PetType } from '@petboarding/api/zod'
import ImageAvatar from '../ImageAvatar.vue'

export interface Pet extends PetType {
  image?: string
}

export interface Props {
  modelValue: PetType
  showWarnings?: boolean
  showEditButton?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (
    e: 'edit',
    {
      id,
      done
    }: {
      id: number
      done?: () => void
    }
  ): void
}>()

const { modelValue } = toRefs(props)
const lang = useLang()

const edit = () => {
  if (modelValue.value.id) {
    emit('edit', { id: modelValue.value.id })
  }
}

const variables = ref({
  // header: lang.value.some.nested.prop
})
const functions = ref({
  // submit
})
defineExpose({
  variables,
  functions
})
</script>
