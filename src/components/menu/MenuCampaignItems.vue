<template>
  <div class="campaign-items">
    <!-- Weapons -->
    <div v-if="campaignWeapons.length > 0" class="category-section">
      <h4 class="category-title">⚔️ Weapons</h4>
      <menu-items :items-list="campaignWeapons" />
    </div>

    <!-- Armor -->
    <div v-if="campaignArmor.length > 0" class="category-section">
      <h4 class="category-title">🛡️ Armor</h4>
      <menu-items :items-list="campaignArmor" />
    </div>

    <!-- Utility -->
    <div v-if="campaignUtility.length > 0" class="category-section">
      <h4 class="category-title">🎒 Utility</h4>
      <menu-items :items-list="campaignUtility" />
    </div>

    <!-- Spells -->
    <div v-if="campaignSpells.length > 0" class="category-section">
      <h4 class="category-title">✨ Spells</h4>
      <menu-items :items-list="campaignSpells" />
    </div>

    <!-- Conditions -->
    <div v-if="campaignConditions.length > 0" class="category-section">
      <h4 class="category-title">💫 Conditions</h4>
      <div class="conditions">
        <UiConditionCard
          v-for="condition in campaignConditions"
          :key="condition.title"
          :condition="condition"
          draggable="true"
          @dragstart="onDragging($event, condition as Card)"
        />
      </div>
    </div>

    <div v-if="totalItems === 0" class="no-items">
      No campaign items defined
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import campaignWeaponList from '../../data/campaignWeaponList.json'
import campaignArmorList from '../../data/campaignArmorList.json'
import campaignUtilityList from '../../data/campaignUtilityList.json'
import campaignSpellList from '../../data/campaignSpellList.json'
import campaignConditionList from '../../data/campaignConditionList.json'
import { onDragging } from '../../composables/dragNDrop'
import { Card } from '../../types/cards'
import { Item, Condition } from '../../types/inventory'
import MenuItems from './MenuItems.vue'
import UiConditionCard from '../ui/UiConditionCard.vue'

const campaignWeapons = computed(() => campaignWeaponList.list as Item[])
const campaignArmor = computed(() => campaignArmorList.list as Item[])
const campaignUtility = computed(() => campaignUtilityList.list as Item[])
const campaignSpells = computed(() => campaignSpellList.list as Item[])
const campaignConditions = computed(() => campaignConditionList.list as Condition[])

const totalItems = computed(() => {
  return campaignWeapons.value.length +
    campaignArmor.value.length +
    campaignUtility.value.length +
    campaignSpells.value.length +
    campaignConditions.value.length
})
</script>

<style lang="scss" scoped>
.campaign-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.category-section {
  .category-title {
    font-family: 'Pirata One', sans-serif;
    font-size: 1.6em;
    color: var(--main);
    margin-bottom: 5px;
    padding-bottom: 3px;
    border-bottom: 1px solid var(--second);
  }
}

.conditions {
  display: grid;
  grid-template-columns: 120px 120px;
  border: 1px solid var(--main);
}

.no-items {
  text-align: center;
  padding: 20px;
  color: var(--second);
  font-size: 1.2em;
  font-style: italic;
}
</style>
