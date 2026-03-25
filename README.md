# Krypt ⚡️
### The Modern "Secret Ops" Platform for Faster Development

Krypt is a minimalist, secure, and developer-first platform for managing environment variables. Stop sharing `.env` files over Slack or Discord. Sync your secrets across your team and infrastructure with zero friction.

---

## 🌪 Introduction
Krypt is built for developers who value speed and security. It centralizes your secrets, providing a single source of truth for your configuration across development, staging, and production environments.

## 🔴 The Problem
Managing `.env` files is a mess:
- **Security Risks:** Secrets leaked in git history or shared over insecure channels.
- **Project Drift:** "It works on my machine" because someone forgot to share a new variable.
- **Onboarding Friction:** New devs spend hours hunting for the right configuration.

## 🟢 The Solution
Krypt solves this by:
- **Centralized Dashboard:** A premium UI to manage all your project secrets.
- **Environment Isolation:** Scope-specific tokens and environment separation.
- **Developer-First CLI:** Pull secrets directly into your workspace with one command.

---

## 🚀 Quick Start (Self-Hosted)

### 1. Requirements
- Node.js 18+
- PostgreSQL
- Supabase (Recommended for DB)

### 2. Setup
```bash
git clone https://github.com/GarzvR/krypt.git
cd krypt/krypt
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

---

## 🛠 Quick Start: Use the CLI

Krypt CLI is the bridge between your cloud secrets and your local machine.

### 1. Installation
```bash
# Install globally from our repo
npm install -g github:GarzvR/krypt-cli
```

### 2. Authentication
```bash
krypt login
```
*Securely authenticate once per machine.*

### 3. Connect Project
Navigate to your project folder:
```bash
krypt link
```
*Interactively select your project and environment.*

### 4. Pull Secrets
```bash
krypt pull
```

### Example Output
```text
Krypt Login
Email: user@example.com
Password: ********
✓ Successfully logged in as user@example.com

Fetching projects... done
Select a project:
  [1] My Startup (my-startup)
✓ Selected: My Startup

Fetching environments... done
Select an environment:
  [1] development
  [2] staging
✓ Linked to My Startup → development

Pulling secrets... ✓ Pulled 12 variables
✓ Wrote .env.development
```

---

## ⚙️ How It Works
1. **Encrypt:** Secrets are encrypted using **AES-256-GCM** before being stored in the database.
2. **Authorize:** The CLI uses **Personal Access Tokens (PAT)** to securely communicate with the API.
3. **Pull:** When you run `krypt pull`, the CLI decrypts and formats variables into your local `.env` file.

## 🛡 Security
- **Encryption at Rest:** All sensitive values are encrypted in the database.
- **Secure Communication:** All API calls are made over HTTPS using Bearer authentication.
- **No Persistence:** The CLI only writes to your authorized `.env` files; it never stores secrets in its own config.

---

## 🌈 Get Started Today
Ready to fix your secret ops? 
[Visit getkrypt.dev](https://getkrypt.dev) | [Read the Docs](https://getkrypt.dev/docs)

---
*Built with ❤️ by GarzvR*
