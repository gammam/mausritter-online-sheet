<template>
  <aside class="menu">
    <div class="menu__header menu--bordered">
      <h1 class="menu__heading">
        Character Sheet v.1.00
      </h1>
      <button
        class="menu__info"
        @click="popupStore.setPopup('info')"
      >
        i
      </button>
    </div>
    <div class="menu__fork-notice menu--bordered">
      <p class="fork-notice__title">🍴 This is a Fork</p>
      <p class="fork-notice__text">
        Based on <a href="https://github.com/BrightsDays/mausritter-online-sheet" target="_blank" rel="noopener">BrightsDays' original</a>
      </p>
      <details class="fork-notice__features">
        <summary>✨ New Features</summary>
        <ul>
          <li>2-slot inventory items</li>
          <li>Auto-rotation system</li>
          <li>Campaign resources</li>
          <li>Create Manual Sheet </li>
        </ul>
      </details>
    </div>
    <div 
      v-if="characterStore.warband"
      class="menu__options menu--bordered"
    >
      <template v-if="$route.path === '/'">
        <router-link to="/warband">
          <button
            class="menu__item menu__item--big"
          >
            Show warband
          </button>
        </router-link>
      </template>
      <template v-else>
        <router-link to="/">
          <button
            class="menu__item menu__item--big"
          >
            Show character
          </button>
        </router-link>
      </template>
    </div>
    <div class="menu__options">
      <ui-details
        title="Options"
        class="menu--bordered"
        :is-open="true"
      >
        <button
          class="menu__item"
          @click="createCharacter('new')"
        >
          Create new character
        </button>
        <button
          class="menu__item"
          :disabled="!characterStore.name"
          @click="downloadCharacter()"
        >
          Download character
        </button>
        <div>
          <button
            class="menu__item"
            @click="createCharacter('upload')"
          >
            Upload character
          </button>
        </div>
        <button
          class="menu__item"
          :disabled="!characterStore.name"
          @click="popupStore.setPopup('clear')"
        >
          Clear sheet
        </button>
      </ui-details>
    </div>
    <div
      v-if="characterStore.name"
      class="menu__options menu--bordered"
    >
      <ui-details title="Weapons">
        <menu-items :items-list="weaponList" />
      </ui-details>
      <ui-details title="Armors">
        <menu-items :items-list="armorList" />
      </ui-details>
      <ui-details
        v-if="$route.name !== 'Warband'"
        title="Spells"
      >
        <menu-items :items-list="spellList" />
      </ui-details>
      <ui-details
        v-if="$route.name !== 'Warband'"
        title="Utilities"
      >
        <menu-items :items-list="utilityList" />
      </ui-details>
      <ui-details
        v-if="$route.name !== 'Warband'"
        title="Conditions"
      >
        <menu-conditions />
      </ui-details>
      <div
        v-if="characterStore.name && $route.name !== 'Warband'"
        class="menu__options"
      >
        <button
          class="menu__item menu__item--big"
          @click.prevent="addCustomItem()"
        >
          Add custom item
        </button>
      </div>
    </div>
    <div
      v-if="characterStore.name && $route.name !== 'Warband'"
      class="menu__options menu--bordered"
    >
      <button
        class="menu__item menu__item--big"
        @click.prevent="addHireling()"
      >
        Add hireling
      </button>
      <button
        v-if="!characterStore.warband"
        class="menu__item menu__item--big"
        @click.prevent="popupStore.setPopup('formWarband')"
      >
        Form warband
      </button>
    </div>
    <div
      v-if="$route.name !== 'Warband'"
      class="menu__options menu--bordered"
    >
      <ui-details title="📦 Campaign" :is-open="false">
        <menu-campaign-items />
      </ui-details>
    </div>
    <div
      v-if="characterStore.exp >= 1000 && $route.name !== 'Warband'"
      class="menu__options menu--bordered"
    >
      <ui-details title="Grits">
        <menu-grits />
      </ui-details>
    </div>
    <div
      v-if="characterStore.name && $route.name !== 'Warband'"
      class="menu__bank"
    >
      <ui-details title="Banked items">
        <banked-items />
      </ui-details>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiDetails from '../ui/UiDetails.vue'
import { usePopupStore } from '../../store/popup'
import MenuItems from './MenuItems.vue'
import MenuConditions from './MenuConditions.vue'
import utilityData from '../../data/utilityList.json'
import weaponData from '../../data/weaponList.json'
import armorData from '../../data/armorList.json'
import spellData from '../../data/spellList.json'
import { Item } from '../../types/inventory'
import BankedItems from './MenuBanked.vue'
import { useCharacterStore } from '../../store/character'
import { useCustomDataStore } from '../../store/customData'
import MenuGrits from './MenuGrits.vue'
import MenuCampaignItems from './MenuCampaignItems.vue'

const popupStore = usePopupStore()
const characterStore = useCharacterStore()
const customDataStore = useCustomDataStore()

// Merge dati base con dati custom dalla campagna
const utilityList = computed(() => [
  ...utilityData.list as Item[],
  ...customDataStore.customUtility
])

const weaponList = computed(() => [
  ...weaponData.list as Item[],
  ...customDataStore.customWeapons
])

const armorList = computed(() => [
  ...armorData.list as Item[],
  ...customDataStore.customArmor
])

const spellList = computed(() => [
  ...spellData.list as Item[],
  ...customDataStore.customSpells
])

const createCharacter = (option: 'new' | 'upload') => {
  if (!characterStore.name) {
    popupStore.setPopup(option)
  } else {
    popupStore.setNextPopup(option)
    popupStore.setPopup('inform')
  }
}

const downloadCharacter = () => {
  const character = { ...characterStore }

  Object.keys(character).forEach(key => {
    if (key.includes('_') || key.includes('$')) {
      delete character[key as keyof typeof character]
    }
  })

  const fileName = `${character.name}.json`
  const fileContent = JSON.stringify(character)

  const element = document.createElement('a')
	element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(fileContent))
	element.setAttribute('download', fileName)

	element.style.display = 'none'
	document.body.appendChild(element)

	element.click()
	document.body.removeChild(element)
}

const addCustomItem = () => popupStore.setPopup('addCustomItem')

const addHireling = () => popupStore.setPopup('addHireling')
</script>

<style lang="scss">
.menu {
  width: 250px;
  max-height: 100%;
  padding-top: 10px;
  padding-right: 4px;
  overflow-y: scroll;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    text-align: left;
  }

  &__heading {
    color: var(--main);
    font-size: 1.4em;
  }

  &__item {
    display: block;
    width: 100%;
    padding: 10px 0 10px 15px;
    font-size: 2em;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    color: var(--main);
    border: none;

    &:disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    &:hover {
      background-color: var(--second-background);
    }

    &--big {
      position: relative;
      padding: 15px;
      font-family: "Ubuntu", sans-serif;
      font-size: 2.2em;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      color: var(--main);
      border: none;
    }
  }

  &__info {
    flex: 0 0 20px;
    width: 20px;
    height: 20px;
    font-size: 1.3em;
    font-weight: bold;
    color: var(--main);
    border: 2px solid var(--main);
    border-radius: 50%;
    cursor: pointer;

    &:hover {
      background: var(--second-background);
    }
  }

  &--bordered {
    border-bottom: 1px solid var(--main);
  }

  &__fork-notice {
    padding: 12px 15px;
    background: rgba(255, 165, 0, 0.05);
  }
}

.fork-notice {
  &__title {
    font-size: 1.4em;
    font-weight: 600;
    color: var(--main);
    margin-bottom: 6px;
  }

  &__text {
    font-size: 1.2em;
    color: var(--main);
    margin-bottom: 8px;
    line-height: 1.4;

    a {
      color: #ff8c00;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__features {
    font-size: 1.2em;
    color: var(--main);

    summary {
      cursor: pointer;
      font-weight: 500;
      margin-bottom: 6px;
      user-select: none;

      &:hover {
        color: #ff8c00;
      }
    }

    ul {
      margin: 6px 0 0 18px;
      padding: 0;
      list-style: none;

      li {
        position: relative;
        padding-left: 12px;
        margin-bottom: 4px;
        line-height: 1.4;

        &:before {
          content: "→";
          position: absolute;
          left: 0;
          color: #ff8c00;
        }
      }
    }
  }
}
</style>
