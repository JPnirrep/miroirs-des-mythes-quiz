// /supabase/functions/_shared/gcp_auth.ts

import { SignJWT } from "https://deno.land/x/jose@v5.6.3/index.ts";

export async function getGoogleAuthToken(): Promise<string> {
  const serviceAccountEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKeyRaw = Deno.env.get("GOOGLE_PRIVATE_KEY");

  if (!serviceAccountEmail || !privateKeyRaw) {
    throw new Error("Les secrets GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_PRIVATE_KEY sont requis.");
  }

  // Nettoyer la clé privée
  let privateKey = privateKeyRaw;
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  // Vérifier le format de la clé
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('Format de clé privée invalide. Utilisez une clé au format PKCS#8 (BEGIN PRIVATE KEY)');
  }

  try {
    // Importer la clé privée pour la signature
    const keyData = privateKey
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');

    const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );

    // Créer le JWT pour Google Service Account
    const now = Math.floor(Date.now() / 1000);
    
    const jwt = await new SignJWT({
      iss: serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
      .setProtectedHeader({ alg: 'RS256' })
      .sign(cryptoKey);

    // Échanger le JWT contre un token d'accès
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur d'authentification Google: ${error}`);
    }

    const tokenData = await response.json();
    return tokenData.access_token;
    
  } catch (error) {
    console.error('Erreur lors de l\'authentification Google:', error);
    throw new Error(`Échec de l'authentification: ${error.message}`);
  }
}