const admin = require("firebase-admin");
const functions = require("firebase-functions");
const OpenAI = require("openai");

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Thesis Ch.4.5 — Callable proxy for OpenAI (keys stay in Firebase / server config).
 *
 *   firebase functions:config:set openai.key="sk-..."
 *   firebase deploy --only functions
 */
exports.chatJson = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }
  const key = process.env.OPENAI_API_KEY || (functions.config().openai && functions.config().openai.key);
  if (!key) {
    throw new functions.https.HttpsError("failed-precondition", "openai.key is not configured.");
  }
  const model = (data && data.model) || "gpt-4o";
  const system = (data && data.system) || "You are a helpful assistant that replies with strict JSON only.";
  const user = data && data.user;
  if (!user || typeof user !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "Missing `user` prompt string.");
  }
  const client = new OpenAI({ apiKey: key });
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
  });
  return { raw: completion };
});
