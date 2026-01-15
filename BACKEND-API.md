# Backend API - Documentazione

> ⚠️ **Il backend è stato spostato in un progetto separato**: [mausritter-backend](https://github.com/mario.gammaldi/mausritter-backend)

## Panoramica

Questa funzionalità permette di connettere il character sheet a un backend personalizzato per sincronizzare contenuti aggiuntivi (armature, armi, incantesimi, utility, condizioni, hirelings).

### Backend Indipendente

Il backend è ora un progetto separato che include:
- Server Custom Data (porta 3000)
- Server Campagne (porta 3001)

Per installare e avviare il backend, consulta il [README del progetto backend](https://github.com/mario.gammaldi/mausritter-backend).

## Architettura

### Frontend Components

- **Store**: [`src/store/customData.ts`](src/store/customData.ts) - Gestisce lo stato dei dati custom
- **Composable**: [`src/composables/backendSync.ts`](src/composables/backendSync.ts) - Logica di sincronizzazione
- **UI**: [`src/components/menu/MenuBackendSync.vue`](src/components/menu/MenuBackendSync.vue) - Interfaccia utente

### Flusso Dati

```
User Input (API Key) → Backend Sync → Custom Data Store → Menu Components → UI
```

## API Backend - Specifiche

Il backend deve implementare i seguenti endpoint:

### 1. Test Connessione

**Endpoint**: `GET /api/test`

**Headers**:
```
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

**Response Success** (200):
```json
{
  "success": true,
  "message": "Connected"
}
```

**Response Error** (401):
```json
{
  "success": false,
  "error": "Invalid API key"
}
```

---

### 2. Sincronizzazione Completa

**Endpoint**: `GET /api/sync`

**Headers**:
```
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

**Response Success** (200):
```json
{
  "success": true,
  "data": {
    "armor": [
      {
        "title": "Dragon Scale Armor",
        "stat": "+2",
        "image": "DragonScale",
        "type": "Armor",
        "group": "items",
        "used": 0,
        "description": "Legendary armor crafted from dragon scales"
      }
    ],
    "weapons": [
      {
        "title": "Enchanted Sword",
        "stat": "d8+1",
        "image": "EnchantedSword",
        "type": "Weapon",
        "group": "items",
        "used": 0
      }
    ],
    "utility": [...],
    "spells": [...],
    "conditions": [...],
    "hirelings": [...]
  }
}
```

---

### 3. Sincronizzazione per Categoria

**Endpoint**: `GET /api/sync/{category}`

**Parametri**:
- `category`: uno tra `armor`, `weapons`, `utility`, `spells`, `conditions`, `hirelings`

**Headers**:
```
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

**Response Success** (200):
```json
{
  "success": true,
  "items": [
    {
      "title": "Item Name",
      "stat": "...",
      "image": "ImageName",
      "type": "Type",
      "group": "items",
      "used": 0
    }
  ]
}
```

---

### 4. Invio Custom Item (Opzionale)

**Endpoint**: `POST /api/items/{category}`

**Headers**:
```
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

**Body**:
```json
{
  "title": "New Custom Item",
  "stat": "d6",
  "type": "Weapon",
  "group": "items",
  "description": "A custom weapon created by user"
}
```

**Response Success** (201):
```json
{
  "success": true,
  "message": "Item created successfully",
  "item": {
    "id": "12345",
    "title": "New Custom Item",
    ...
  }
}
```

---

## Formato Item

Ogni item deve seguire questa struttura:

### Armor
```typescript
{
  title: string        // Nome dell'armatura
  stat: string         // Bonus (es: "+1", "+2")
  image?: string       // Nome immagine (opzionale)
  type: "Armor"
  group: "items"
  used?: number        // Default: 0
  description?: string // Descrizione (opzionale)
}
```

### Weapon
```typescript
{
  title: string        // Nome dell'arma
  stat: string         // Danno (es: "d6", "d8+1")
  image?: string
  type: "Weapon"
  group: "items"
  used?: number
  description?: string
}
```

### Utility
```typescript
{
  title: string
  stat?: string        // Slots occupati
  image?: string
  type: "Utility"
  group: "items"
  used?: number
  description?: string
}
```

### Spell
```typescript
{
  title: string
  stat?: string
  image?: string
  type: "Spell"
  group: "items"
  used?: number
  description?: string
}
```

### Condition
```typescript
{
  title: string
  stat?: string
  image?: string
  type: "Condition"
  group: "items"
  used?: number
  description?: string
}
```

---

## Implementazione Backend

### Esempio con Node.js/Express

```javascript
const express = require('express')
const app = express()

// Middleware autenticazione
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token || !isValidToken(token)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    })
  }
  
  req.userId = getUserIdFromToken(token)
  next()
}

// Test endpoint
app.get('/api/test', authenticate, (req, res) => {
  res.json({ success: true, message: 'Connected' })
})

// Sync completo
app.get('/api/sync', authenticate, async (req, res) => {
  const customData = await db.getCustomData(req.userId)
  
  res.json({
    success: true,
    data: {
      armor: customData.armor,
      weapons: customData.weapons,
      utility: customData.utility,
      spells: customData.spells,
      conditions: customData.conditions,
      hirelings: customData.hirelings
    }
  })
})

// Sync categoria
app.get('/api/sync/:category', authenticate, async (req, res) => {
  const { category } = req.params
  const items = await db.getCategoryItems(category, req.userId)
  
  res.json({
    success: true,
    items
  })
})

// Crea custom item
app.post('/api/items/:category', authenticate, async (req, res) => {
  const { category } = req.params
  const item = req.body
  
  const newItem = await db.createItem(category, item, req.userId)
  
  res.status(201).json({
    success: true,
    message: 'Item created',
    item: newItem
  })
})

app.listen(3000)
```

---

## Sicurezza

### API Key Generation

Le API key dovrebbero essere:
- Lunghe almeno 32 caratteri
- Generate con crittografia sicura (es: `crypto.randomBytes(32).toString('hex')`)
- Hash nel database (bcrypt, argon2)
- Revocabili dall'utente

### Rate Limiting

Implementa rate limiting per prevenire abusi:

```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100 // max 100 richieste per finestra
})

app.use('/api/', limiter)
```

### CORS

Configura CORS correttamente:

```javascript
const cors = require('cors')

app.use(cors({
  origin: ['https://yourapp.com', 'http://localhost:5173'],
  credentials: true
}))
```

---

## Database Schema

### Esempio PostgreSQL

```sql
-- Tabella utenti
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  api_key_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella custom items
CREATE TABLE custom_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  stat VARCHAR(50),
  image VARCHAR(255),
  type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indici
CREATE INDEX idx_custom_items_user ON custom_items(user_id);
CREATE INDEX idx_custom_items_category ON custom_items(category);
```

---

## Deploy Backend

### Opzioni Cloud

1. **AWS**:
   - Lambda + API Gateway (serverless)
   - EC2 + RDS
   - Elastic Beanstalk

2. **Vercel/Netlify**:
   - Serverless Functions
   - Edge Functions

3. **Heroku**:
   - Deploy semplice
   - Database PostgreSQL incluso

4. **Railway/Render**:
   - Deploy da GitHub
   - Database incluso

### Esempio Deploy con Railway

```bash
# 1. Crea account su railway.app
# 2. Installa CLI
npm i -g @railway/cli

# 3. Login
railway login

# 4. Inizializza progetto
railway init

# 5. Deploy
railway up
```

---

## Testing

### Frontend Testing

```typescript
// Test store
import { setActivePinia, createPinia } from 'pinia'
import { useCustomDataStore } from '@/store/customData'

describe('CustomDataStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should set API key', () => {
    const store = useCustomDataStore()
    store.setApiKey('test-key-123')
    expect(store.apiKey).toBe('test-key-123')
  })

  it('should merge custom items without duplicates', () => {
    const store = useCustomDataStore()
    const items = [
      { title: 'Item 1', type: 'Armor', group: 'items' }
    ]
    
    store.addCustomItems('customArmor', items)
    store.addCustomItems('customArmor', items)
    
    expect(store.customArmor.length).toBe(1)
  })
})
```

### Backend Testing

```javascript
const request = require('supertest')
const app = require('./app')

describe('API Endpoints', () => {
  const validToken = 'test-token-123'

  it('GET /api/test should return 401 without token', async () => {
    const res = await request(app).get('/api/test')
    expect(res.statusCode).toBe(401)
  })

  it('GET /api/sync should return custom data', async () => {
    const res = await request(app)
      .get('/api/sync')
      .set('Authorization', `Bearer ${validToken}`)
    
    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('armor')
  })
})
```

---

## Roadmap Future Features

- [ ] Autenticazione OAuth (Google, GitHub)
- [ ] Condivisione pubblica di custom items
- [ ] Votazione community per items
- [ ] Marketplace per items premium
- [ ] Sync real-time con WebSocket
- [ ] Import/Export bulk di items
- [ ] Versioning di items
- [ ] Tags e ricerca avanzata

---

## Contribuire

Per contribuire al backend:

1. Fork del repository
2. Crea branch feature (`git checkout -b feature/amazing-feature`)
3. Commit modifiche (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Apri Pull Request

---

## Supporto

Per domande o problemi:
- **Issues**: [GitHub Issues](https://github.com/BrightsDays/mausritter-online-sheet/issues)
- **Discussioni**: [GitHub Discussions](https://github.com/BrightsDays/mausritter-online-sheet/discussions)
- **Email**: [brightsdays](https://brightsdays.github.io/contacts)

---

## Licenza

MIT License - vedi [LICENSE](../LICENSE) per dettagli
