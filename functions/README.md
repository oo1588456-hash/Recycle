# Firebase Cloud Functions (thesis Ch.4.5)

Callable **`chatJson`** — authenticated users only — forwards structured prompts to **OpenAI** JSON mode.

Configure the key:

```bash
firebase functions:config:set openai.key="sk-..."
firebase deploy --only functions
```

Or set `OPENAI_API_KEY` in the Google Cloud console for the Functions runtime (recommended for newer projects).

The Flutter app’s **default** pricing path uses **Django** (`analyze-with-device-visual`). This folder exists so your written architecture (Firebase Functions holding keys) is **real, deployable code**, not prose only.
