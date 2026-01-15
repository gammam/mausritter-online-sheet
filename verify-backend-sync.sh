#!/bin/bash

# Script di test per verificare l'installazione della feature Backend Sync
# Esegui questo script per verificare che tutti i file siano stati creati correttamente

echo "🔍 Verifica Feature Backend Sync..."
echo ""

# Colori
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Contatori
TOTAL=0
SUCCESS=0
FAIL=0

check_file() {
  TOTAL=$((TOTAL + 1))
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $1"
    SUCCESS=$((SUCCESS + 1))
  else
    echo -e "${RED}❌${NC} $1 - MANCANTE"
    FAIL=$((FAIL + 1))
  fi
}

echo "📁 File Frontend:"
check_file "src/store/customData.ts"
check_file "src/composables/backendSync.ts"
check_file "src/components/menu/MenuBackendSync.vue"

echo ""
echo "📁 File Backend:"
check_file "backend-example.js"
check_file "backend-package.json"

echo ""
echo "📁 Documentazione:"
check_file "BACKEND-API.md"
check_file "QUICKSTART-BACKEND.md"
check_file "FEATURE-BACKEND-SYNC.md"

echo ""
echo "📁 File Deployment:"
check_file "deploy-aws.sh"
check_file "AWS-DEPLOY.md"
check_file ".github/workflows/deploy-aws.yml"
check_file "s3-bucket-policy.json"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Risultati: ${GREEN}${SUCCESS}/${TOTAL}${NC} file presenti"

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ Tutti i file sono stati creati correttamente!${NC}"
  echo ""
  echo "Prossimi passi:"
  echo "1. npm install - Installa dipendenze frontend"
  echo "2. npm install express cors better-sqlite3 dotenv - Installa dipendenze backend"
  echo "3. node backend-example.js - Avvia backend di test"
  echo "4. npm run dev - Avvia frontend"
  echo ""
  echo "Leggi QUICKSTART-BACKEND.md per iniziare!"
else
  echo -e "${RED}⚠️  Alcuni file mancano. Controlla l'output sopra.${NC}"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
