// /supabase/functions/_shared/gcp_auth.ts

import { SignJWT } from "https://deno.land/x/jose@v5.6.3/index.ts";

export async function getGoogleAuthToken(): Promise<string> {
  const serviceAccountEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKeyRaw = Deno.env.get("GOOGLE_PRIVATE_KEY");

  if (!serviceAccountEmail || !privateKeyRaw) {
    throw new Error("Les secrets GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_PRIVATE_KEY sont requis.");
  }

  // Nettoyer et normaliser la clé privée
  let privateKey = privateKeyRaw.trim();
  // Retirer d'éventuels guillemets ajoutés lors de la saisie
  if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
    privateKey = privateKey.slice(1, -1);
  }
  // Remplacer les sauts de ligne échappés et trimmer
  privateKey = privateKey.replace(/\\n/g, '\n').trim();

  // Corriger d'éventuels en-têtes/pieds tronqués
  // Exemple courant: "BEGIN PRIVATE KEY-----" (il manque les 5 tirets d'ouverture)
  if (privateKey.includes('BEGIN PRIVATE KEY-----') && !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    privateKey = privateKey.replace(/BEGIN PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----');
  }
  if (privateKey.includes('END PRIVATE KEY-----') && !privateKey.includes('-----END PRIVATE KEY-----')) {
    privateKey = privateKey.replace(/END PRIVATE KEY-----/g, '-----END PRIVATE KEY-----');
  }

  // Vérifier le format de la clé (PKCS#8)
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error('Format de clé privée invalide. Utilisez une clé au format PKCS#8 avec "-----BEGIN PRIVATE KEY-----".');
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