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
/* Local, not migratable: Quasar ships no navigation-rail component, so no generic
   Quasar selector describes this app's `.navigation-rail`. */
.navigation-rail:deep(.q-tab__content) {
  min-width: 52px;
}
/*
 * Truncate the label with a single-line ellipsis inside the 80px rail (never a
 * layout resize); max-width ties it to its content box at any translation length.
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
 * The active destination sits on the secondary-container indicator, so its icon
 * and label take `on-secondary-container` (md3 rail colour roles), overriding the
 * preset's `.q-tab--active { color: primary }` tab rule. Both tokens switch on
 * `.body--dark`, so one declaration covers both themes.
 */
.navigation-rail:deep(.q-tab--active) {
  color: var(--q-on-secondary-container);
}

/*
 * Footer instance (MainLayout marks it `.navigation-tabs-footer`): the four
 * destinations have to fit the narrowest supported viewport. Measured at
 * 375px: 378px of tab content in a 375px bar, so the bar went scrollable —
 * Quasar drew its scroll arrows over the first and last tab (Home sat at
 * x=-3, the chevron landed on the Administrator label) and the rail's own
 * 52px content floor kept it from ever fitting. Equal flex columns with an
 * ellipsing label make the fit structural rather than dependent on the label
 * strings staying short (Dutch, longer role names, a future fifth tab).
 */
.navigation-tabs-footer:deep(.q-tab) {
  flex: 1 1 0;
  min-width: 0;
}

.navigation-tabs-footer:deep(.q-tab__content) {
  min-width: 0;
}

.navigation-tabs-footer:deep(.q-tab__label) {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
