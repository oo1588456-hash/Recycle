# Optional FastAPI gateway (thesis stack)

Your dissertation names **FastAPI** alongside **Firebase** as part of the cloud side. This folder is a **minimal, optional** service that demonstrates **server-side OpenAI calls** without putting API keys in the Flutter app.

The **primary** ReCycle REST API is still **`backend/` Django**. In production you would typically:

- use **Firebase Cloud Functions** (thesis), or
- keep **Django** as the only server that holds `OPENAI_API_KEY` (current repo default).

## Run

```powershell
cd gateway
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# edit .env — set OPENAI_API_KEY
uvicorn main:app --reload --host 127.0.0.1 --port 8090
```

`GET http://127.0.0.1:8090/health`  
`POST http://127.0.0.1:8090/v1/chat-json` with JSON `{ "user": "..." }`
