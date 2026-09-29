<template>
  <q-tabs class="navigation-rail">
    <q-route-tab icon="i-mdi-home" to="/" label="Home" />
    <q-route-tab
      v-if="user"
      icon="i-mdi-person"
      to="/account"
      :label="lang.account.title"
    />
    <q-route-tab
      v-if="user?.roles.includes('employee')"
      icon="i-mdi-account-star"
      to="/employee"
      :label="lang.employee"
    />
    <q-route-tab
      v-if="user?.roles.includes('administrator')"
      icon="i-mdi-account-cog"
      to="/admin"
      :label="lang.administrator"
    />
  </q-tabs>
</template>

<script setup lang="ts">
import { user } from '../oauth.js'
import { useLang } from '../lang/index.js'

const lang = useLang()
</script>

<style scoped>
/* Kept — local, not migratable: Quasar ships no navigation-rail component, so no
   generic Quasar selector describes this app's `.navigation-rail`. Its indicator
   geometry and the active destination's colour roles are app policy. */
.navigation-rail:deep(.q-tab__content) {
  min-width: 52px;
}
/*
 * md3 rail: the label truncates deliberately inside the 80px rail — a
 * single-line ellipsis, never a layout resize (audit: "Administrato"
 * hard-clipped mid-word). max-width ties the label to its content box so
 * no label can overflow the tab at any translation length.
 */
.navigation-rail:deep(.q-tab__label) {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.navigation-rail:deep(.q-tab__indicator) {
  color: var(--light-secondary-container);
  position: absolute;
  width: 52px;
  left: calc(50% - 26px);
  border-radius: 16px;
  height: 32px;
  top: calc(50% - 23px);
  min-height: unset;
}

.body--dark .navigation-rail:deep(.q-tab__indicator) {
  color: var(--dark-secondary-container);
}

/*
 * md3 navigation rail: the active destination's icon and label take
 * `on-secondary-container`, because they sit on the secondary-container
 * indicator (m3.material.io/components/navigation-rail/specs — color roles
 * 2/3; same pairing the preset's own md3-lists.json records for selected
 * text). The preset's generic `.q-tab--active { color: primary }` is correct
 * for md3 *tabs* — the selected tab label is primary — and wrong for a rail,
 * so the correction is scoped here rather than applied to the shared rule.
 * Both tokens switch on `.body--dark`, so one declaration covers both themes.
 */
.navigation-rail:deep(.q-tab--active) {
  color: var(--q-on-secondary-container);
}
</style>
