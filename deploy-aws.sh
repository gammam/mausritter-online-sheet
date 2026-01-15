#!/bin/bash

# Script di deploy per AWS S3
# Assicurati di aver configurato AWS CLI con: aws configure

set -e

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurazione - MODIFICA QUESTI VALORI
S3_BUCKET="mausritter-online-sheet"
AWS_REGION="eu-west-1"
CLOUDFRONT_DISTRIBUTION_ID="" # Opzionale: aggiungi l'ID della distribuzione CloudFront

echo -e "${YELLOW}🚀 Inizio deploy su AWS S3...${NC}\n"

# Step 1: Build del progetto
echo -e "${YELLOW}📦 Building del progetto...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build fallito!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completato${NC}\n"

# Step 2: Verifica esistenza bucket S3
echo -e "${YELLOW}🪣 Verifica bucket S3...${NC}"
if aws s3 ls "s3://${S3_BUCKET}" 2>&1 | grep -q 'NoSuchBucket'; then
    echo -e "${YELLOW}Bucket non trovato. Creazione bucket...${NC}"
    aws s3 mb "s3://${S3_BUCKET}" --region ${AWS_REGION}
    
    # Configura il bucket per hosting statico
    aws s3 website "s3://${S3_BUCKET}" \
        --index-document index.html \
        --error-document index.html
    
    echo -e "${GREEN}✅ Bucket creato e configurato${NC}\n"
else
    echo -e "${GREEN}✅ Bucket già esistente${NC}\n"
fi

# Step 3: Sync file su S3
echo -e "${YELLOW}☁️  Upload file su S3...${NC}"
aws s3 sync dist/ "s3://${S3_BUCKET}" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "*.json"

# Upload index.html e JSON senza cache (per aggiornamenti immediati)
aws s3 cp dist/index.html "s3://${S3_BUCKET}/index.html" \
    --cache-control "no-cache, no-store, must-revalidate"

# Upload eventuali file JSON con cache breve
if compgen -G "dist/*.json" > /dev/null; then
    aws s3 cp dist/ "s3://${S3_BUCKET}/" \
        --recursive \
        --exclude "*" \
        --include "*.json" \
        --cache-control "public, max-age=300"
fi

echo -e "${GREEN}✅ Upload completato${NC}\n"

# Step 4: Invalidazione CloudFront (se configurato)
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "${YELLOW}🌐 Invalidazione cache CloudFront...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
        --paths "/*"
    echo -e "${GREEN}✅ Invalidazione completata${NC}\n"
fi

# Step 5: Mostra URL del sito
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deploy completato con successo!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo -e "Il tuo sito è disponibile su CloudFront"
    echo -e "(controlla la console AWS per l'URL della distribuzione)\n"
else
    WEBSITE_URL="http://${S3_BUCKET}.s3-website-${AWS_REGION}.amazonaws.com"
    echo -e "Il tuo sito è disponibile su:"
    echo -e "${GREEN}${WEBSITE_URL}${NC}\n"
fi

echo -e "Per configurare CloudFront e HTTPS, segui le istruzioni in AWS-DEPLOY.md\n"
