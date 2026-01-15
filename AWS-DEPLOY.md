# Deploy su AWS - Guida Completa

Questa guida ti mostrerà come deployare Mausritter Online Sheet su AWS utilizzando S3 e CloudFront.

## 📋 Prerequisiti

1. **Account AWS** - [Crea un account](https://aws.amazon.com/)
2. **AWS CLI installato** - [Guida installazione](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
3. **Node.js e npm** - già installati per questo progetto

## 🔧 Setup Iniziale

### 1. Installare AWS CLI (se non già installato)

**macOS:**
```bash
brew install awscli
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Windows:**
Scarica l'installer da [qui](https://aws.amazon.com/cli/)

### 2. Configurare le credenziali AWS

```bash
aws configure
```

Ti verrà chiesto:
- **AWS Access Key ID**: Ottienilo dalla console AWS (IAM → Users → Security Credentials)
- **AWS Secret Access Key**: Lo ricevi insieme all'Access Key
- **Default region name**: Suggerito `eu-west-1` (Irlanda) o `us-east-1` (Virginia)
- **Default output format**: `json`

### 3. Configurare lo script di deploy

Apri `deploy-aws.sh` e modifica questi valori:

```bash
S3_BUCKET="mausritter-online-sheet"  # Cambia con un nome univoco
AWS_REGION="eu-west-1"                # Scegli la tua region preferita
```

### 4. Dare permessi di esecuzione allo script

```bash
chmod +x deploy-aws.sh
```

## 🚀 Deploy Base (Solo S3)

### Opzione 1: Deploy Automatico

Esegui semplicemente:

```bash
./deploy-aws.sh
```

Lo script farà:
1. Build del progetto
2. Creazione del bucket S3 (se non esiste)
3. Configurazione per hosting statico
4. Upload dei file
5. Mostrerà l'URL del sito

### Opzione 2: Deploy Manuale

```bash
# 1. Build
npm run build

# 2. Crea bucket
aws s3 mb s3://mausritter-online-sheet --region eu-west-1

# 3. Configura per web hosting
aws s3 website s3://mausritter-online-sheet \
    --index-document index.html \
    --error-document index.html

# 4. Upload file
aws s3 sync dist/ s3://mausritter-online-sheet --delete

# 5. Rendi pubblico il bucket
aws s3api put-bucket-policy \
    --bucket mausritter-online-sheet \
    --policy file://s3-bucket-policy.json
```

## 🔐 Rendere il Bucket Pubblico

Crea un file `s3-bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mausritter-online-sheet/*"
    }
  ]
}
```

Poi applica la policy:

```bash
aws s3api put-bucket-policy \
    --bucket mausritter-online-sheet \
    --policy file://s3-bucket-policy.json
```

## 🌐 Setup CloudFront (CDN + HTTPS) - Raccomandato

CloudFront offre:
- ✅ HTTPS gratuito
- ✅ Velocità migliorate (CDN globale)
- ✅ Supporto per domini personalizzati
- ✅ Protezione DDoS

### Creazione Distribuzione CloudFront

1. **Via Console AWS:**
   - Vai su CloudFront nella console AWS
   - Click "Create Distribution"
   - Origin Domain: seleziona il tuo bucket S3
   - Viewer Protocol Policy: "Redirect HTTP to HTTPS"
   - Default Root Object: `index.html`
   - Click "Create Distribution"

2. **Via AWS CLI:**

```bash
aws cloudfront create-distribution \
    --origin-domain-name mausritter-online-sheet.s3.eu-west-1.amazonaws.com \
    --default-root-object index.html
```

3. **Configurare Error Pages per Vue Router:**
   - Vai su CloudFront → Distributions → tua distribuzione → Error Pages
   - Crea una custom error response:
     - HTTP Error Code: 403
     - Response Page Path: `/index.html`
     - HTTP Response Code: 200

4. **Aggiorna deploy-aws.sh:**

Dopo aver creato la distribuzione, copia l'ID e aggiungilo allo script:

```bash
CLOUDFRONT_DISTRIBUTION_ID="E1234EXAMPLE"
```

## 🔗 Dominio Personalizzato

### Con Route 53 (dominio AWS)

1. Registra o trasferisci il dominio su Route 53
2. In CloudFront, aggiungi "Alternate Domain Name (CNAME)"
3. Richiedi un certificato SSL in ACM (AWS Certificate Manager) per `tuodominio.com`
4. In Route 53, crea un record A/ALIAS che punta a CloudFront

### Con dominio esterno

1. Richiedi certificato SSL in ACM
2. Aggiungi CNAME in CloudFront
3. Nel tuo DNS provider, aggiungi un record CNAME:
   ```
   www.tuodominio.com → d123456abcdef.cloudfront.net
   ```

## 💰 Costi Stimati

### S3 (solo storage)
- Storage: ~$0.023/GB al mese
- Richieste: ~$0.0004 per 1000 richieste GET
- **Stima mensile**: $0.50 - $2 (per traffico basso/medio)

### S3 + CloudFront
- CloudFront: primo 1TB transfer gratis/mese
- Dopo: ~$0.085/GB
- **Stima mensile**: $1 - $5 (include CDN globale e HTTPS)

💡 **CloudFront include sempre il free tier!**

## 📝 Script npm

Puoi aggiungere questi script in `package.json`:

```json
{
  "scripts": {
    "deploy:aws": "./deploy-aws.sh",
    "deploy:gh": "./deploy.sh"
  }
}
```

Così puoi usare:
```bash
npm run deploy:aws   # Deploy su AWS
npm run deploy:gh    # Deploy su GitHub Pages (esistente)
```

## 🔄 Workflow di Deploy Consigliato

1. **Sviluppo locale:**
   ```bash
   npm run dev
   ```

2. **Test build:**
   ```bash
   npm run build
   npm run preview
   ```

3. **Deploy:**
   ```bash
   npm run deploy:aws
   ```

## ⚠️ Note Importanti

1. **Nome Bucket Univoco**: I nomi dei bucket S3 devono essere univoci globalmente. Se `mausritter-online-sheet` è già preso, cambialo (es. `mausritter-sheet-tuonome`)

2. **Region**: Scegli una region vicina ai tuoi utenti:
   - Europa: `eu-west-1` (Irlanda), `eu-central-1` (Francoforte)
   - USA: `us-east-1` (Virginia), `us-west-2` (Oregon)

3. **CORS**: Se hai problemi con API esterne, potrebbe servire configurare CORS sul bucket S3

4. **Cache**: CloudFront può cachare i file fino a 24h. Usa l'invalidazione per forzare aggiornamenti

## 🐛 Troubleshooting

### "Bucket already exists"
Il nome è già in uso globalmente. Cambia `S3_BUCKET` in `deploy-aws.sh`

### 403 Forbidden
Verifica che la bucket policy sia corretta e il bucket sia pubblico

### CloudFront mostra contenuto vecchio
Crea un'invalidazione:
```bash
aws cloudfront create-invalidation \
    --distribution-id E1234EXAMPLE \
    --paths "/*"
```

### Vue Router non funziona (404 su routes)
Configura le error pages di CloudFront (vedi sezione CloudFront sopra)

## 📚 Risorse Utili

- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/)
- [AWS Free Tier](https://aws.amazon.com/free/)

## 🎯 Prossimi Passi

1. ✅ Deploy base su S3
2. ⬜ Setup CloudFront per HTTPS
3. ⬜ Configurazione dominio personalizzato
4. ⬜ Setup CI/CD con GitHub Actions (opzionale)

---

Per domande o problemi, contatta: [brightsdays](https://brightsdays.github.io/contacts)
