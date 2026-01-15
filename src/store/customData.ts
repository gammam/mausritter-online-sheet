import { defineStore } from 'pinia'

export interface CustomItem {
  title: string
  stat?: string
  image?: string
  type: string
  group: string
  used?: number
  description?: string
  source?: string // per tracciare la fonte (backend, locale)
}

export interface CustomDataState {
  apiKey: string
  backendUrl: string
  isConnected: boolean
  lastSync: string | null
  customArmor: CustomItem[]
  customWeapons: CustomItem[]
  customUtility: CustomItem[]
  customSpells: CustomItem[]
  customConditions: CustomItem[]
  customHirelings: any[]
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'
  syncError: string | null
}

export const useCustomDataStore = defineStore('customData', {
  state: (): CustomDataState => ({
    apiKey: '',
    backendUrl: import.meta.env.VITE_BACKEND_URL || '',
    isConnected: false,
    lastSync: null,
    customArmor: [],
    customWeapons: [],
    customUtility: [],
    customSpells: [],
    customConditions: [],
    customHirelings: [],
    syncStatus: 'idle',
    syncError: null
  }),

  getters: {
    hasApiKey(): boolean {
      return this.apiKey.length > 0
    },

    hasCustomData(): boolean {
      return (
        this.customArmor.length > 0 ||
        this.customWeapons.length > 0 ||
        this.customUtility.length > 0 ||
        this.customSpells.length > 0 ||
        this.customConditions.length > 0 ||
        this.customHirelings.length > 0
      )
    },

    customDataCount(): number {
      return (
        this.customArmor.length +
        this.customWeapons.length +
        this.customUtility.length +
        this.customSpells.length +
        this.customConditions.length +
        this.customHirelings.length
      )
    }
  },

  actions: {
    setApiKey(key: string) {
      this.apiKey = key
      this.saveToLocalStorage()
    },

    setBackendUrl(url: string) {
      this.backendUrl = url
      this.saveToLocalStorage()
    },

    setConnected(status: boolean) {
      this.isConnected = status
      this.saveToLocalStorage()
    },

    addCustomItems(category: keyof CustomDataState, items: CustomItem[]) {
      const categoryKey = category as 'customArmor' | 'customWeapons' | 'customUtility' | 'customSpells' | 'customConditions'
      
      // Merge senza duplicati (usa title come chiave)
      const existing = this[categoryKey] as CustomItem[]
      const merged = [...existing]
      
      items.forEach(newItem => {
        const index = merged.findIndex(item => item.title === newItem.title)
        if (index === -1) {
          merged.push({ ...newItem, source: 'backend' })
        } else {
          // Aggiorna item esistente
          merged[index] = { ...newItem, source: 'backend' }
        }
      })
      
      this[categoryKey] = merged as any
      this.saveToLocalStorage()
    },

    removeCustomItem(category: keyof CustomDataState, title: string) {
      const categoryKey = category as 'customArmor' | 'customWeapons' | 'customUtility' | 'customSpells' | 'customConditions'
      const items = this[categoryKey] as CustomItem[]
      this[categoryKey] = items.filter(item => item.title !== title) as any
      this.saveToLocalStorage()
    },

    clearCustomData() {
      this.customArmor = []
      this.customWeapons = []
      this.customUtility = []
      this.customSpells = []
      this.customConditions = []
      this.customHirelings = []
      this.lastSync = null
      this.saveToLocalStorage()
    },

    updateSyncStatus(status: 'idle' | 'syncing' | 'success' | 'error', error: string | null = null) {
      this.syncStatus = status
      this.syncError = error
      if (status === 'success') {
        this.lastSync = new Date().toISOString()
        this.isConnected = true
      }
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('mr__customData', JSON.stringify({
        apiKey: this.apiKey,
        backendUrl: this.backendUrl,
        isConnected: this.isConnected,
        lastSync: this.lastSync,
        customArmor: this.customArmor,
        customWeapons: this.customWeapons,
        customUtility: this.customUtility,
        customSpells: this.customSpells,
        customConditions: this.customConditions,
        customHirelings: this.customHirelings
      }))
    },

    loadFromLocalStorage() {
      const stored = localStorage.getItem('mr__customData')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          this.apiKey = data.apiKey || ''
          this.backendUrl = data.backendUrl || ''
          this.isConnected = data.isConnected || false
          this.lastSync = data.lastSync || null
          this.customArmor = data.customArmor || []
          this.customWeapons = data.customWeapons || []
          this.customUtility = data.customUtility || []
          this.customSpells = data.customSpells || []
          this.customConditions = data.customConditions || []
          this.customHirelings = data.customHirelings || []
        } catch (error) {
          console.error('Errore nel caricamento dei dati custom:', error)
        }
      }
    }
  }
})
