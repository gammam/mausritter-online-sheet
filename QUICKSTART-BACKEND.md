# Quick Start - Backend Sync

Guida rapida per iniziare a usare la funzionalità di sincronizzazione backend.

## 🚀 Per Utenti

### 1. Ottieni una API Key

Se hai già un account su un server Mausritter backend:
1. Accedi al portale del provider
2. Genera la tua API key
3. Copia la chiave (sarà mostrata una sola volta!)

### 2. Connetti il Character Sheet

1. Apri l'applicazione Mausritter Character Sheet
2. Nel menu laterale, espandi la sezione **"🔗 Backend Sync"**
3. Inserisci:
   - **URL Backend**: l'indirizzo del server (es: `https://api.mausritter-custom.com`)
   - **Chiave API**: la tua chiave segreta
4. Clicca **"Connetti"**

### 3. Sincronizza Contenuti

Una volta connesso:
- Clicca **"🔄 Sincronizza Tutto"** per scaricare tutti i contenuti custom
- Oppure sincronizza solo categorie specifiche (Armature, Armi, ecc.)

### 4. Usa i Contenuti Custom

I nuovi contenuti appariranno automaticamente nelle sezioni del menu:
- **Weapons** - include armi custom
- **Armors** - include armature custom
- **Spells** - include incantesimi custom
- **Utilities** - include utility custom

Puoi usare questi items come quelli standard, tramite drag & drop!

---

## 🛠️ Per Developer - Setup Backend Locale

### Opzione 1: Backend Esempio (Minimal)

Il progetto include un backend di esempio pronto all'uso.

```bash
# 1. Installa dipendenze backend
npm install express cors better-sqlite3 dotenv

# 2. Avvia il server
node backend-example.js
```

Il server sarà disponibile su `http://localhost:3000`

### Opzione 2: Crea il Tuo Backend

Vedi [BACKEND-API.md](BACKEND-API.md) per le specifiche complete dell'API.

Requisiti minimi:
- Endpoint `/api/test` per verifica connessione
- Endpoint `/api/sync` per sincronizzazione dati
- Autenticazione con Bearer token

---

## 🧪 Test Rapido

### 1. Genera API Key

```bash
curl -X POST http://localhost:3000/api/register
```

Risposta:
```json
{
  "success": true,
  "apiKey": "abc123def456..."
}
```

### 2. Testa Connessione

```bash
curl -H "Authorization: Bearer abc123def456..." \
     http://localhost:3000/api/test
```

### 3. Popola con Dati di Esempio

```bash
curl -X POST \
     -H "Authorization: Bearer abc123def456..." \
     http://localhost:3000/api/seed
```

### 4. Verifica Sincronizzazione

```bash
curl -H "Authorization: Bearer abc123def456..." \
     http://localhost:3000/api/sync
```

---

## 📱 Uso nell'App

1. Apri `http://localhost:5173` (dev server Vite)
2. Nel menu **Backend Sync**:
   - URL: `http://localhost:3000`
   - API Key: `abc123def456...` (quella generata prima)
3. Clicca **Connetti**
4. Clicca **Sincronizza Tutto**
5. I dati di esempio appariranno nelle liste!

---

## 🎯 Esempi di Uso

### Aggiungere Item Custom via API

```bash
curl -X POST http://localhost:3000/api/items/weapons \
  -H "Authorization: Bearer abc123def456..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lightning Blade",
    "stat": "d10",
    "type": "Weapon",
    "description": "Strikes with the power of thunder"
  }'
```

### Sincronizzare Solo Armi

```bash
curl -H "Authorization: Bearer abc123def456..." \
     http://localhost:3000/api/sync/weapons
```

---

## 🌐 Deploy Backend su Cloud

### Railway (Consigliato)

1. Vai su [railway.app](https://railway.app)
2. Clicca **"New Project"** → **"Deploy from GitHub repo"**
3. Seleziona il tuo fork di questo repository
4. Railway rileverà automaticamente Node.js
5. Aggiungi variabile d'ambiente: `PORT=3000`
6. Deploy automatico! 🎉

URL esempio: `https://mausritter-api.up.railway.app`

### Heroku

```bash
# Installa Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Crea app
heroku create mausritter-api

# Deploy
git push heroku main

# Visualizza
heroku open
```

### Vercel (Serverless)

Crea `api/sync.js`:
```javascript
export default function handler(req, res) {
  // La tua logica qui
  res.json({ success: true })
}
```

Deploy:
```bash
npm i -g vercel
vercel
```

---

## ❓ Troubleshooting

### "Invalid API key"
- Verifica di aver copiato correttamente la chiave
- Controlla che l'header sia `Authorization: Bearer YOUR_KEY`

### "CORS Error"
Il backend deve permettere richieste dal frontend:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com']
}))
```

### "Connection refused"
- Verifica che il backend sia avviato
- Controlla che l'URL sia corretto (con http:// o https://)
- Verifica firewall/antivirus

### Items non appaiono dopo sync
- Apri DevTools → Console per vedere errori
- Verifica il formato dei dati (deve includere `title`, `type`, `group`)
- Controlla localStorage: cerca `mr__customData`

---

## 🔒 Sicurezza

**IMPORTANTE**: 
- Non condividere mai la tua API key
- Usa HTTPS in produzione
- Implementa rate limiting nel backend
- Hash delle API key nel database (usa bcrypt)

---

## 📚 Risorse

- [Documentazione API Completa](BACKEND-API.md)
- [Esempio Backend](backend-example.js)
- [Issues & Support](https://github.com/BrightsDays/mausritter-online-sheet/issues)

---

Buon divertimento! 🐭⚔️
