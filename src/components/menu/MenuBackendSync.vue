<template>
  <div class="backend-sync">
    <div class="sync-header">
      <h3>🔗 Connessione Backend</h3>
      <div class="sync-status" :class="statusClass">
        <span class="status-indicator"></span>
        {{ statusText }}
      </div>
    </div>

    <!-- Configurazione API -->
    <div v-if="!customDataStore.hasApiKey" class="config-section">
      <p class="info-text">
        Connetti il tuo account al backend per accedere a contenuti personalizzati e condivisi dalla community.
      </p>
      
      <div class="input-group">
        <label for="backend-url">URL Backend</label>
        <input
          id="backend-url"
          v-model="backendUrl"
          type="text"
          placeholder="https://api.mausritter-custom.com"
          @blur="saveBackendUrl"
        />
      </div>

      <div class="input-group">
        <label for="api-key">Chiave API</label>
        <input
          id="api-key"
          v-model="apiKey"
          type="password"
          placeholder="Inserisci la tua chiave API"
        />
      </div>

      <button @click="connectBackend" :disabled="!canConnect" class="btn-primary">
        <span v-if="!isConnecting">Connetti</span>
        <span v-else>Connessione...</span>
      </button>

      <p class="help-text">
        Non hai una chiave API? <a href="#" @click.prevent="showHelpPopup">Ottieni qui</a>
      </p>
    </div>

    <!-- Pannello Sincronizzazione -->
    <div v-else class="sync-panel">
      <div class="connection-info">
        <div class="info-row">
          <span class="label">Backend:</span>
          <span class="value">{{ customDataStore.backendUrl }}</span>
        </div>
        <div class="info-row" v-if="customDataStore.lastSync">
          <span class="label">Ultima sincronizzazione:</span>
          <span class="value">{{ formatDate(customDataStore.lastSync) }}</span>
        </div>
        <div class="info-row">
          <span class="label">Contenuti custom:</span>
          <span class="value">{{ customDataStore.customDataCount }} items</span>
        </div>
      </div>

      <!-- Azioni di sincronizzazione -->
      <div class="sync-actions">
        <button 
          @click="syncAll" 
          :disabled="customDataStore.syncStatus === 'syncing'"
          class="btn-sync"
        >
          <span v-if="customDataStore.syncStatus !== 'syncing'">🔄 Sincronizza Tutto</span>
          <span v-else>⏳ Sincronizzazione...</span>
        </button>

        <button @click="showCategorySync = !showCategorySync" class="btn-secondary">
          Sincronizza Categoria
        </button>
      </div>

      <!-- Sincronizzazione per categoria -->
      <div v-if="showCategorySync" class="category-sync">
        <h4>Sincronizza per categoria</h4>
        <div class="category-buttons">
          <button @click="syncCategory('armor')" class="category-btn">
            🛡️ Armature ({{ customDataStore.customArmor.length }})
          </button>
          <button @click="syncCategory('weapons')" class="category-btn">
            ⚔️ Armi ({{ customDataStore.customWeapons.length }})
          </button>
          <button @click="syncCategory('utility')" class="category-btn">
            🎒 Utility ({{ customDataStore.customUtility.length }})
          </button>
          <button @click="syncCategory('spells')" class="category-btn">
            ✨ Incantesimi ({{ customDataStore.customSpells.length }})
          </button>
          <button @click="syncCategory('conditions')" class="category-btn">
            💫 Condizioni ({{ customDataStore.customConditions.length }})
          </button>
        </div>
      </div>

      <!-- Messaggio di errore -->
      <div v-if="customDataStore.syncError" class="error-message">
        ⚠️ {{ customDataStore.syncError }}
      </div>

      <!-- Messaggio di successo -->
      <div v-if="syncMessage" class="success-message">
        ✅ {{ syncMessage }}
      </div>

      <!-- Gestione connessione -->
      <div class="connection-actions">
        <button @click="disconnect" class="btn-disconnect">
          Disconnetti
        </button>
        <button @click="clearCustomData" class="btn-danger">
          Cancella Dati Custom
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCustomDataStore } from '../../store/customData'
import { useBackendSync } from '../../composables/backendSync'

const customDataStore = useCustomDataStore()
const { testConnection, syncFromBackend, syncCategory: syncCategoryAPI } = useBackendSync()

const apiKey = ref('')
const backendUrl = ref(customDataStore.backendUrl || 'https://api.mausritter-custom.com')
const isConnecting = ref(false)
const showCategorySync = ref(false)
const syncMessage = ref('')

const canConnect = computed(() => {
  return apiKey.value.trim().length > 0 && backendUrl.value.trim().length > 0
})

const statusClass = computed(() => {
  if (customDataStore.isConnected) return 'connected'
  if (customDataStore.syncStatus === 'error') return 'error'
  return 'disconnected'
})

const statusText = computed(() => {
  if (customDataStore.syncStatus === 'syncing') return 'Sincronizzazione...'
  if (customDataStore.isConnected) return 'Connesso'
  if (customDataStore.syncStatus === 'error') return 'Errore'
  return 'Non connesso'
})

const saveBackendUrl = () => {
  customDataStore.setBackendUrl(backendUrl.value)
}

const connectBackend = async () => {
  isConnecting.value = true
  customDataStore.setApiKey(apiKey.value)
  customDataStore.setBackendUrl(backendUrl.value)
  
  const isConnected = await testConnection()
  
  if (isConnected) {
    customDataStore.setConnected(true)
    syncMessage.value = 'Connessione stabilita con successo!'
    setTimeout(() => syncMessage.value = '', 3000)
  } else {
    customDataStore.setConnected(false)
    customDataStore.updateSyncStatus('error', 'Impossibile connettersi al backend. Verifica le credenziali.')
  }
  
  isConnecting.value = false
}

const syncAll = async () => {
  syncMessage.value = ''
  const result = await syncFromBackend()
  
  if (result.success) {
    syncMessage.value = result.message || 'Sincronizzazione completata!'
    setTimeout(() => syncMessage.value = '', 3000)
  }
}

const syncCategory = async (category: string) => {
  syncMessage.value = ''
  const result = await syncCategoryAPI(category)
  
  if (result.success) {
    syncMessage.value = result.message || `${category} sincronizzato!`
    setTimeout(() => syncMessage.value = '', 3000)
  } else {
    customDataStore.updateSyncStatus('error', result.error || 'Errore durante la sincronizzazione')
  }
}

const disconnect = () => {
  customDataStore.setApiKey('')
  customDataStore.setConnected(false)
  apiKey.value = ''
}

const clearCustomData = () => {
  if (confirm('Sei sicuro di voler cancellare tutti i dati custom? Questa azione non può essere annullata.')) {
    customDataStore.clearCustomData()
    syncMessage.value = 'Dati custom cancellati'
    setTimeout(() => syncMessage.value = '', 3000)
  }
}

const showHelpPopup = () => {
  window.open('https://github.com/BrightsDays/mausritter-online-sheet/wiki/Backend-API', '_blank')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  customDataStore.loadFromLocalStorage()
})
</script>

<style scoped lang="scss">
.backend-sync {
  padding: 1.5rem;
  background: #f8f8f8;
  border-radius: 8px;
  margin: 1rem 0;
}

.sync-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    margin: 0;
    font-size: 1.2rem;
  }
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;

  &.connected {
    background: #d4edda;
    color: #155724;
    .status-indicator {
      background: #28a745;
    }
  }

  &.disconnected {
    background: #f8d7da;
    color: #721c24;
    .status-indicator {
      background: #dc3545;
    }
  }

  &.error {
    background: #fff3cd;
    color: #856404;
    .status-indicator {
      background: #ffc107;
    }
  }
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.config-section {
  .info-text {
    margin-bottom: 1.5rem;
    color: #666;
    line-height: 1.5;
  }

  .input-group {
    margin-bottom: 1rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: #007bff;
      }
    }
  }

  .help-text {
    margin-top: 1rem;
    font-size: 0.9rem;
    text-align: center;

    a {
      color: #007bff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.sync-panel {
  .connection-info {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .label {
        font-weight: 500;
        color: #666;
      }

      .value {
        color: #333;
      }
    }
  }

  .sync-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .category-sync {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;

    h4 {
      margin-top: 0;
      margin-bottom: 1rem;
    }

    .category-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
    }

    .category-btn {
      padding: 0.75rem;
      background: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #e9ecef;
        border-color: #007bff;
      }
    }
  }

  .connection-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }
}

.error-message {
  padding: 1rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  margin: 1rem 0;
}

.success-message {
  padding: 1rem;
  background: #d4edda;
  color: #155724;
  border-radius: 4px;
  margin: 1rem 0;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.btn-primary {
    background: #007bff;
    color: white;

    &:hover:not(:disabled) {
      background: #0056b3;
    }
  }

  &.btn-secondary {
    background: #6c757d;
    color: white;

    &:hover {
      background: #545b62;
    }
  }

  &.btn-sync {
    background: #28a745;
    color: white;
    flex: 1;

    &:hover:not(:disabled) {
      background: #218838;
    }
  }

  &.btn-disconnect {
    background: #ffc107;
    color: #000;

    &:hover {
      background: #e0a800;
    }
  }

  &.btn-danger {
    background: #dc3545;
    color: white;

    &:hover {
      background: #c82333;
    }
  }
}
</style>
