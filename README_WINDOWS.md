# Aria Marketing Dashboard — Setup Windows

## Prerequisiti
- Python 3.10+ (python.org)
- Pip

## Setup Rapido

### 1. Crea cartella e copia i file
```powershell
mkdir C:\aria-dashboard
cd C:\aria-dashboard
```
Copia `server.py`, `requirements.txt`, `.env.example` nella cartella.

### 2. Installa dipendenze
```powershell
pip install fastapi uvicorn requests
```

### 3. Configura file
#### A. `google_token.json` — Token Google Sheets
Copialo dalla vecchia installazione WSL:
- File: `/opt/data/profiles/aria-scalping/google_token.json`
- Deve avere: `token`, `refresh_token`, `client_id`, `client_secret`, `expiry`
- Il service account `aria-marketing-bot@...` deve avere **Editor** su Google Sheet "Aria Marketing"

#### B. `.env` — Variabili d'ambiente
Copia `.env.example` in `.env` e compila il tuo token Telegram.

### 4. Avvia il server
```powershell
python server.py
```

### 5. Test
```powershell
curl http://localhost:8000/health
```

### 6. Cloudflare Tunnel (accesso remoto)
```powershell
winget install Cloudflare.cloudflared
cloudflared tunnel --url http://localhost:8000
```
Copia l'URL che ti dà (es. `https://xxx.trycloudflare.com/summary`).

### 7. Tailscale (alternativa)
1. Installa Tailscale: https://tailscale.com/download/windows
2. Accedi con tuo account
3. `tailscale ip -4` → IP tipo `100.x.x.x`
4. Da qualsiasi device: `http://100.x.x.x:8000/summary`

## File necessari
```
C:\aria-dashboard\
├── server.py          # Server principale
├── requirements.txt   # Dipendenze
├── .env               # Variabili d'ambiente
├── google_token.json  # Token Google Sheets (OAuth)
├── state.json         # Si crea automaticamente
└── README_WINDOWS.md  # Questo file
```

## Nota Importante
Su Windows `hermes` CLI non è disponibile → il check "Cron Jobs" mostrerà errore (normale).
Il dashboard funziona comunque: Sheets, Telegram, GitHub Pages OK.
I cron jobs su Windows usa Task Scheduler o esegui gli script manualmente.
