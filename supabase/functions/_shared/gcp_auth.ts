// /supabase/functions/_shared/gcp_auth.ts

import { SignJWT } from "https://deno.land/x/jose@v5.6.3/index.ts";

export async function getGoogleAuthToken(): Promise<string> {
  // Les secrets peuvent être fournis de 2 façons:
  // 1) Classique: GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY (PEM)
  // 2) GOOGLE_PRIVATE_KEY contient le JSON complet du compte de service -> on extrait private_key et client_email
  let serviceAccountEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL") || "";
  let privateKeyRaw = Deno.env.get("GOOGLE_PRIVATE_KEY") || "";

  // Si le secret ressemble à un JSON, essayons d'extraire les champs attendus
  if (privateKeyRaw.trim().startsWith("{")) {
    try {
      const sa = JSON.parse(privateKeyRaw);
      if (!serviceAccountEmail && sa.client_email) {
        serviceAccountEmail = sa.client_email;
      }
      if (sa.private_key) {
        privateKeyRaw = sa.private_key;
      }
    } catch (_) {
      // Ignore: on tentera avec la valeur brute
    }
  }

  if (!serviceAccountEmail || !privateKeyRaw) {
    throw new Error("Les secrets GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_PRIVATE_KEY sont requis.");
  }

  // Nettoyer et normaliser la clé privée (PEM)
  let privateKey = privateKeyRaw.trim();
  // Retirer d'éventuels guillemets ajoutés lors de la saisie
  if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
    privateKey = privateKey.slice(1, -1);
  }
  // Remplacer les sauts de ligne échappés et trimmer
  privateKey = privateKey.replace(/\\n/g, '\n').trim();

  // Corriger d'éventuels en-têtes/pieds tronqués
  if (privateKey.includes('BEGIN PRIVATE KEY-----') && !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    privateKey = privateKey.replace(/BEGIN PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----');
  }
  if (privateKey.includes('END PRIVATE KEY-----') && !privateKey.includes('-----END PRIVATE KEY-----')) {
    privateKey = privateKey.replace(/END PRIVATE KEY-----/g, '-----END PRIVATE KEY-----');
  }

  // Vérifier le format de la clé (PKCS#8)
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error('Format de clé privée invalide. Fournissez une clé PKCS#8 (-----BEGIN PRIVATE KEY-----).');
  }

  try {
    // Importer la clé privée pour la signature
    const keyData = privateKey
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\r?\n|\r/g, '')
      .trim();

    // Assainir au cas où des caractères indésirables s'y seraient glissés
    const sanitized = keyData.replace(/[^A-Za-z0-9+/=]/g, '');

    const binaryKey = Uint8Array.from(atob(sanitized), (c) => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey.buffer,
      { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    );

    // Créer le JWT pour Google Service Account
    // CORRECTION POUR LE CLOCK SKEW (DÉSYNCHRONISATION D'HORLOGE)
    const now = Math.floor(Date.now() / 1000);
    const iat = now - 60; // Date d'émission mise à 1 minute DANS LE PASSÉ pour créer une marge de tolérance
    const exp = iat + 3600; // Expiration dans 1 heure (59 minutes à partir de "now")

    const jwt = await new SignJWT({
      iss: serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: exp, // Utilise la nouvelle variable d'expiration
      iat: iat, // Utilise la nouvelle variable de date d'émission
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
  } catch (error: any) {
    console.error("Erreur lors de l'authentification Google:", error);
    throw new Error(`Échec de l'authentification: ${error.message}`);
  }
}
