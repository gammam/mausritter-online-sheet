import { useCustomDataStore } from '../store/customData'

interface SyncResponse {
  success: boolean
  data?: {
    armor?: any[]
    weapons?: any[]
    utility?: any[]
    spells?: any[]
    conditions?: any[]
    hirelings?: any[]
  }
  message?: string
  error?: string
}

export const useBackendSync = () => {
  const customDataStore = useCustomDataStore()

  /**
   * Verifica la connessione al backend
   */
  const testConnection = async (): Promise<boolean> => {
    if (!customDataStore.apiKey || !customDataStore.backendUrl) {
      return false
    }

    try {
      const response = await fetch(`${customDataStore.backendUrl}/api/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${customDataStore.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      return response.ok
    } catch (error) {
      console.error('Errore test connessione:', error)
      return false
    }
  }

  /**
   * Sincronizza tutti i dati dal backend
   */
  const syncFromBackend = async (): Promise<SyncResponse> => {
    if (!customDataStore.apiKey || !customDataStore.backendUrl) {
      return {
        success: false,
        error: 'API key o URL backend mancanti'
      }
    }

    customDataStore.updateSyncStatus('syncing')

    try {
      const response = await fetch(`${customDataStore.backendUrl}/api/sync`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${customDataStore.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SyncResponse = await response.json()

      if (data.success && data.data) {
        // Aggiorna lo store con i nuovi dati
        if (data.data.armor) {
          customDataStore.addCustomItems('customArmor', data.data.armor)
        }
        if (data.data.weapons) {
          customDataStore.addCustomItems('customWeapons', data.data.weapons)
        }
        if (data.data.utility) {
          customDataStore.addCustomItems('customUtility', data.data.utility)
        }
        if (data.data.spells) {
          customDataStore.addCustomItems('customSpells', data.data.spells)
        }
        if (data.data.conditions) {
          customDataStore.addCustomItems('customConditions', data.data.conditions)
        }

        customDataStore.updateSyncStatus('success')
        return {
          success: true,
          data: data.data,
          message: 'Sincronizzazione completata con successo'
        }
      } else {
        throw new Error(data.error || 'Errore sconosciuto')
      }
    } catch (error: any) {
      customDataStore.updateSyncStatus('error', error.message)
      return {
        success: false,
        error: error.message || 'Errore durante la sincronizzazione'
      }
    }
  }

  /**
   * Carica dati per una categoria specifica
   */
  const syncCategory = async (category: string): Promise<SyncResponse> => {
    if (!customDataStore.apiKey || !customDataStore.backendUrl) {
      return {
        success: false,
        error: 'API key o URL backend mancanti'
      }
    }

    try {
      const response = await fetch(`${customDataStore.backendUrl}/api/sync/${category}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${customDataStore.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.items) {
        const storeKey = `custom${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof typeof customDataStore
        customDataStore.addCustomItems(storeKey, data.items)
        
        return {
          success: true,
          data: { [category]: data.items },
          message: `${category} sincronizzati con successo`
        }
      } else {
        throw new Error(data.error || 'Errore sconosciuto')
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Errore durante la sincronizzazione'
      }
    }
  }

  /**
   * Invia un nuovo item al backend (contributo utente)
   */
  const submitCustomItem = async (category: string, item: any): Promise<SyncResponse> => {
    if (!customDataStore.apiKey || !customDataStore.backendUrl) {
      return {
        success: false,
        error: 'API key o URL backend mancanti'
      }
    }

    try {
      const response = await fetch(`${customDataStore.backendUrl}/api/items/${category}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${customDataStore.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success,
        message: data.message || 'Item inviato con successo',
        error: data.error
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Errore durante l\'invio'
      }
    }
  }

  return {
    testConnection,
    syncFromBackend,
    syncCategory,
    submitCustomItem
  }
}
