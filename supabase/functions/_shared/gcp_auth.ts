// /supabase/functions/_shared/gcp_auth.ts

import { JWT } from "https://deno.land/x/google_jwt@v0.2.0/mod.ts";

export async function getGoogleAuthToken() {
  const serviceAccountEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = Deno.env.get("GOOGLE_PRIVATE_KEY");

  if (!serviceAccountEmail || !privateKey) {
    throw new Error("Les secrets GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_PRIVATE_KEY sont requis.");
  }
  
  // La librairie JWT gère la complexité du formatage de la clé.
  // Elle remplace toute la logique manuelle précédente.
  const jwt = new JWT({
    email: serviceAccountEmail,
    key: privateKey.replace(/\\n/g, '\n'), // Assure le bon formatage de la clé
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const token = await jwt.getToken();
  return token.access_token;
}