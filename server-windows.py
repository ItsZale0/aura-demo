#!/usr/bin/env python3
"""
Aria Marketing Dashboard — FastAPI Server (Windows-Compatible)
Dashboard dark+arancio, dati live da Google Sheets
Summary privato con status check e action buttons
"""
import json, os, subprocess, requests
from datetime import datetime
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
import uvicorn

app = FastAPI(title="Aria Marketing Dashboard")
BASE_DIR = Path(__file__).parent.resolve()
STATE_FILE = BASE_DIR / "state.json"
SHEETS_TOKEN_FILE = BASE_DIR / "google_token.json"
ENV_FILE = BASE_DIR / ".env"
cached_state = {"last_update": None, "data": {}}
SHEET_ID = '1MzyBh6-Nvu463wagninA44rtmq5D-_9SShyEYyM3ESA'
RANGES = ['gruppi_fb!A2:K', 'outreach!A2:J', 'post!A2:I', 'contenuti!A2:I', 'conversion!A2:I', 'log!A2:F']

def load_sheets_token():
    if SHEETS_TOKEN_FILE.exists():
        with open(SHEETS_TOKEN_FILE) as f:
            return json.load(f).get('token')
    return None

def fetch_sheet_data():
    token = load_sheets_token()
    if not token:
        return {"error": "No token"}
    headers = {'Authorization': f'Bearer {token}'}
    data = {}
    for r in RANGES:
        sheet_name = r.split('!')[0]
        url = f'https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{r}'
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            data[sheet_name] = resp.json().get('values', [])
        else:
            data[sheet_name] = []
    return data

def compute_kpis(sd):
    gruppi = sd.get('gruppi_fb', [])
    outreach = sd.get('outreach', [])
    post = sd.get('post', [])
    conversion = sd.get('conversion', [])
    today = datetime.now().strftime('%Y-%m-%d')
    return {
        "gruppi_scoperti": len(gruppi),
        "gruppi_postati_oggi": sum(1 for g in gruppi if len(g) > 9 and g[9] == today),
        "gruppi_postati_totali": sum(1 for g in gruppi if len(g) > 8 and g[8].lower() in ['sì', 'si', 'yes', 'postato', 'true']),
        "email_inviate": sum(1 for o in outreach if len(o) > 4 and o[4] in ['inviata', 'sent']),
        "wa_inviati": sum(1 for o in outreach if len(o) > 2 and o[2].lower() == 'whatsapp' and len(o) > 4 and o[4] in ['inviata', 'sent']),
        "risposte_totali": sum(1 for o in outreach if len(o) > 6 and o[6] and o[6].lower() not in ['', 'no', 'nessuna']),
        "engagement_totale": sum(int(p[4]) if len(p) > 4 and p[4].isdigit() else 0 for p in post) + sum(int(p[5]) if len(p) > 5 and p[5].isdigit() else 0 for p in post),
        "lead_totali": len(conversion),
        "lead_oggi": sum(1 for c in conversion if len(c) > 3 and c[3] == today),
        "last_update": datetime.now().isoformat()
    }

def check_cron_jobs():
    try:
        result = subprocess.run(['hermes', 'cron', 'list'], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            active = sum(1 for l in lines if '[active]' in l)
            marketing = sum(1 for l in lines if 'marketing-' in l)
            return {"ok": True, "active": active, "marketing": marketing}
        return {"ok": False, "error": result.stderr[:200]}
    except FileNotFoundError:
        return {"ok": False, "error": "hermes non installato su Windows"}

def check_sheets_api():
    try:
        token = load_sheets_token()
        if not token:
            return {"ok": False, "error": "No token"}
        headers = {'Authorization': f'Bearer {token}'}
        r = requests.get(f'https://www.googleapis.com/drive/v3/files?q=name=%27Aria+Marketing%27', headers=headers, params={'fields': 'files(id)'}, timeout=10)
        return {"ok": r.status_code == 200, "status": r.status_code}
    except Exception as e:
        return {"ok": False, "error": str(e)}

def check_telegram_bot():
    try:
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token and ENV_FILE.exists():
            with open(ENV_FILE) as f:
                for line in f:
                    if 'TELEGRAM_BOT_TOKEN' in line and '=' in line:
                        bot_token = line.split('=', 1)[1].strip().strip('"').strip("'")
                        break
        if not bot_token:
            return {"ok": False, "error": "No bot token in .env"}
        resp = requests.get(f'https://api.telegram.org/bot{bot_token}/getMe', timeout=10)
        data = resp.json()
        return {"ok": data.get('ok', False), "bot": data.get('result', {}).get('username', '?')}
    except Exception as e:
        return {"ok": False, "error": str(e)}

def check_github_pages():
    try:
        r = requests.get('https://itszale0.github.io/aura-demo/', timeout=10)
        return {"ok": r.status_code == 200, "status": r.status_code}
    except Exception as e:
        return {"ok": False, "error": str(e)}

def get_all_status():
    return {
        "cron_jobs": check_cron_jobs(),
        "google_sheets": check_sheets_api(),
        "telegram_bot": check_telegram_bot(),
        "github_pages": check_github_pages(),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.now().isoformat()}

@app.get("/api/state")
async def api_state():
    global cached_state
    if cached_state["last_update"] is None or (datetime.now() - cached_state["last_update"]).seconds > 60:
        sheet_data = fetch_sheet_data()
        kpis = compute_kpis(sheet_data)
        cached_state = {"last_update": datetime.now(), "data": {**sheet_data, "kpis": kpis}}
    return JSONResponse(cached_state["data"])

@app.get("/api/status")
async def api_status():
    return JSONResponse(get_all_status())

@app.get("/api/actions/{action}")
async def api_actions(action: str):
    actions = {
        "open_sheets": "https://docs.google.com/spreadsheets/d/1MzyBh6-Nvu463wagninA44rtmq5D-_9SShyEYyM3ESA",
        "open_fb_groups": "https://docs.google.com/spreadsheets/d/1cCONnklelOyIZzeSRCb5K4Tmwz17u4YFVUvnf4qQP9k",
        "open_telegram": "https://t.me/Thedestrum",
        "open_demo": "https://itszale0.github.io/aura-demo/",
    }
    if action in actions:
        return JSONResponse({"url": actions[action], "action": action})
    return JSONResponse({"error": "Action not found"}, status_code=404)

@app.get("/", response_class=HTMLResponse)
async def dashboard():
    template = BASE_DIR / "dashboard.html"
    if template.exists():
        with open(template, encoding='utf-8') as f:
            return HTMLResponse(f.read())
    return HTMLResponse("<h1>Dashboard template non trovato</h1>")

@app.get("/summary", response_class=HTMLResponse)
async def summary():
    status = get_all_status()
    all_ok = all(v.get('ok', False) for k, v in status.items() if k != 'timestamp')
    icons = {"cron_jobs": "⏰", "google_sheets": "📊", "telegram_bot": "📱", "github_pages": "🌐"}
    names = {"cron_jobs": "Cron Jobs", "google_sheets": "Google Sheets API", "telegram_bot": "Telegram Bot", "github_pages": "GitHub Pages"}
    cards = ""
    for key, svc in status.items():
        if key == 'timestamp':
            continue
        ok = svc.get('ok', False)
        icon = icons.get(key, '⚙️')
        name = names.get(key, key)
        bc = 'ok' if ok else 'error'
        bt = 'OK' if ok else 'ERRORE'
        details = []
        if key == 'cron_jobs' and ok:
            details.append(f"Attivi: {svc.get('active', 0)} | Marketing: {svc.get('marketing', 0)}")
        if key == 'google_sheets' and ok:
            details.append(f"HTTP {svc.get('status', '?')}")
        if key == 'telegram_bot' and ok:
            details.append(f"Bot: @{svc.get('bot', '?')}")
        if key == 'github_pages' and ok:
            details.append(f"HTTP {svc.get('status', '?')}")
        detail_str = ' | '.join(details) if details else (svc.get('error', '') if not ok else '')
        cards += f'<div class="service-card"><div class="service-header"><span class="service-name">{icon} {name}</span><span class="status-badge {bc}"><span class="dot"></span>{bt}</span></div><div class="service-details">{detail_str}</div></div>'
    overall = 'ok' if all_ok else 'warn'
    label = 'TUTTI ATTIVI' if all_ok else 'QUALCHE PROBLEMA'
    html = f'''<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Aria Marketing — Summary</title><style>:root{{--bg:#0a0a0a;--card:#1a1a1a;--border:#2a2a2a;--text:#f0f0f0;--muted:#888;--accent:#ff6b00;--green:#4ade80;--red:#ef4444;--yellow:#fbbf24}}*{{margin:0;padding:0;box-sizing:border-box}}body{{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;padding:20px;line-height:1.6}}.container{{max-width:1000px;margin:0 auto}}.header{{display:flex;align-items:center;justify-content:space-between;padding:24px 0;border-bottom:1px solid var(--border);margin-bottom:32px}}.logo{{font-size:1.8em;font-weight:800;color:var(--accent);letter-spacing:-0.03em}}.logo span{{color:var(--text)}}.overall-status{{display:inline-flex;align-items:center;gap:10px;padding:10px 20px;border-radius:12px;font-weight:700}}.ok{{background:rgba(74,222,128,.15);color:var(--green)}}.warn{{background:rgba(251,191,36,.15);color:var(--yellow)}}.error{{background:rgba(239,68,68,.15);color:var(--red)}}.dot{{width:12px;height:12px;border-radius:50%;animation:pulse 2s infinite}}.ok .dot{{background:var(--green)}}.warn .dot{{background:var(--yellow)}}.error .dot{{background:var(--red)}}@keyframes pulse{{0%,100%{{opacity:1}}50%{{opacity:.4}}}}.refresh-btn{{background:var(--accent);color:#000;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;font-size:.9em}}.refresh-btn:hover{{opacity:.9}}.section{{margin-bottom:32px}}.section h2{{font-size:1.2em;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.05em}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}}.service-card{{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;transition:transform .2s,border-color .2s}}.service-card:hover{{transform:translateY(-2px);border-color:var(--accent)}}.service-header{{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}}.service-name{{font-size:1.1em;font-weight:600}}.status-badge{{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:.8em;font-weight:600}}.ok .status-badge{{background:rgba(74,222,128,.15);color:var(--green)}}.error .status-badge{{background:rgba(239,68,68,.15);color:var(--red)}}.service-details{{font-size:.85em;color:var(--muted);margin-top:8px}}.action-section{{margin-top:32px}}.action-grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}}.action-btn{{display:flex;align-items:center;justify-content:center;gap:10px;padding:16px 20px;background:var(--card);border:1px solid var(--border);border-radius:12px;color:var(--text);font-weight:600;font-size:.95em;cursor:pointer;text-decoration:none;transition:all .2s}}.action-btn:hover{{border-color:var(--accent);background:rgba(255,107,0,.05);transform:translateY(-1px)}}.action-btn.primary{{background:var(--accent);color:#000;border-color:var(--accent)}}.action-btn.primary:hover{{opacity:.9}}.manual-task{{background:rgba(251,191,36,.1);border:1px solid var(--yellow);border-radius:12px;padding:20px;margin-top:24px}}.manual-task h3{{color:var(--yellow);margin-bottom:12px}}.manual-task ul{{list-style:none}}.manual-task li{{padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between}}.manual-task li:last-child{{border-bottom:none}}.time{{color:var(--accent);font-weight:600}}.timestamp{{text-align:center;color:var(--muted);font-size:.8em;margin-top:40px;padding-top:20px;border-top:1px solid var(--border)}}@media(max-width:640px){{.logo{{font-size:1.5em}}.grid{{grid-template-columns:1fr}}.action-grid{{grid-template-columns:1fr}}}}</style></head><body><div class="container"><div class="header"><div class="logo">Aria<span> Marketing</span></div><div style="display:flex;gap:12px;align-items:center"><div class="overall-status {overall}"><span class="dot"></span><span>{label}</span></div><button class="refresh-btn" onclick="location.reload()">🔄 Aggiorna</button></div></div><div class="section"><h2>📊 Status Servizi</h2><div class="grid">{cards}</div></div><div class="section action-section"><h2>⚡ Azioni Rapide</h2><div class="action-grid"><a href="https://docs.google.com/spreadsheets/d/1MzyBh6-Nvu463wagninA44rtmq5D-_9SShyEYyM3ESA" target="_blank" class="action-btn primary">📊 Google Sheets</a><a href="https://docs.google.com/spreadsheets/d/1cCONnklelOyIZzeSRCb5K4Tmwz17u4YFVUvnf4qQP9k" target="_blank" class="action-btn">👥 FB Groups</a><a href="https://t.me/Thedestrum" target="_blank" class="action-btn">📱 Telegram</a><a href="http://localhost:8000" target="_blank" class="action-btn">🖥️ Dashboard Live</a><a href="https://itszale0.github.io/aura-demo/" target="_blank" class="action-btn">🌐 Sito Demo</a></div></div><div class="section"><div class="manual-task"><h3>👤 Task Manuali</h3><ul><li><span class="desc">Posta in gruppi FB <strong>da_postare</strong></span><span class="time">Ogni 2h: 09,11,13,15,17 UTC</span></li><li><span class="desc">Copia copy da Sheet <strong>contenuti</strong> → incolla nel gruppo</span></li><li><span class="desc">Aggiorna Sheet <strong>gruppi_fb</strong>: Postato=Sì, Data=Oggi</span><span class="time">Colonne I,J,K</span></li></ul></div></div><div class="timestamp">Ultimo check: {status['timestamp']} — <a href="/summary" style="color:var(--accent)">Ricontrolla</a></div></div></body></html>'''
    return HTMLResponse(html)

if __name__ == "__main__":
    print("Starting Aria Marketing Dashboard on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
