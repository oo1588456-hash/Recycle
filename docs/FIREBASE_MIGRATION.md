# Moving from Django (v1) toward the thesis Firebase stack

Your dissertation (Ch.3–4) describes **Firebase Authentication**, **Cloud Firestore**, **Cloud Storage** for blobs, and **Cloud Functions** to hold **OpenAI** keys.

This repository’s **working prototype** uses:

- **Django + DRF + SQLite** (dev) for users, listings, orders, chat, and AI audit (`AIAnalysisResult`).
- **Media on disk** (`MEDIA_ROOT`) instead of Cloud Storage.
- **OpenAI/Gemini keys on the server** via Django settings (same *security idea* as Cloud Functions: keys not in the Flutter binary).

## If you must match the thesis implementation literally

High‑level order of work (weeks, not hours):

1. Create a Firebase project; enable Auth (email/password or OAuth as needed).
2. Design Firestore collections (`users`, `listings`, `ai_cache`, …) mirroring your Ch.3.6 schema.
3. Replace or mirror JWT auth: either **Firebase token verification in Django** (`firebase-admin`) or **drop Django auth** and use Firestore security rules only (larger change).
4. Move product images to **Cloud Storage**; store download URLs in Firestore.
5. Implement **Callable Functions** (or HTTPS functions) that proxy OpenAI exactly as described; Flutter calls Functions, not OpenAI.
6. Keep or retire Django: many teams keep Django as an admin/reporting API while Firestore serves mobile — that is a design choice.

Until those steps are done, cite **`docs/HATIM_THESIS_VS_REPOSITORY.md`** in the dissertation **Implementation** chapter as “deployment variant A (prototype)” vs “target architecture B (Firebase)”.

## Flutter client

When you adopt Firebase:

```bash
dart pub global activate flutterfire_cli
flutterfire configure
```

Add `firebase_core`, `cloud_firestore`, `firebase_auth`, `firebase_storage` to `pubspec.yaml` and follow Firebase Flutter docs. Do not commit `google-services.json` / `GoogleService-Info.plist` secrets publicly.
