# MIGRATION NOTICE

## Backend Separato

Il backend è stato spostato in un nuovo repository indipendente per permettere deployment e sviluppo separati.

### 📦 Nuovo Repository Backend

**Repository**: [mausritter-backend](https://github.com/mario.gammaldi/mausritter-backend)

Il nuovo progetto include:
- Server Custom Data API
- Server Campagne API
- Documentazione completa
- Scripts di deploy

### 🔄 File Rimossi dal Frontend

I seguenti file sono stati rimossi da questo repository e sono ora nel progetto backend:

- `backend-example.js` → `mausritter-backend/src/server.js`
- `campaign-backend.js` → `mausritter-backend/src/campaign-server.js`
- `backend-package.json` → `mausritter-backend/package.json`

### 📝 Configurazione Frontend

Per connettere il frontend al backend, configura l'URL del backend in:

**Development**:
```typescript
const BACKEND_URL = 'http://localhost:3000'
const CAMPAIGN_URL = 'http://localhost:3001'
```

**Production**:
```typescript
const BACKEND_URL = 'https://your-backend.com'
const CAMPAIGN_URL = 'https://your-campaign-backend.com'
```

### 🚀 Quick Start

1. Clona il backend:
   ```bash
   cd ..
   git clone https://github.com/mario.gammaldi/mausritter-backend.git
   cd mausritter-backend
   npm install
   ```

2. Avvia i server backend:
   ```bash
   npm run dev              # Server Custom Data (3000)
   npm run dev:campaign     # Server Campagne (3001)
   ```

3. Torna al frontend e avvia:
   ```bash
   cd ../mausritter-online-sheet
   npm run dev
   ```

### 📚 Documentazione

- Backend API: Vedi [mausritter-backend/README.md](https://github.com/mario.gammaldi/mausritter-backend)
- Frontend Integration: Vedi [BACKEND-API.md](./BACKEND-API.md)
- Campagne: Vedi [FEATURE-BACKEND-SYNC.md](./FEATURE-BACKEND-SYNC.md)

### ⚠️ Breaking Changes

Nessuna breaking change per gli utenti finali. La separazione è solo a livello di repository e deploy.
