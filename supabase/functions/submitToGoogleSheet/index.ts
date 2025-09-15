import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Interface pour le payload du quiz
interface QuizPayload {
  prenom: string;
  email: string;
  consentementRgpd: boolean;
  scores: {
    architecte: number;
    enchanteur: number;
    vigie: number;
    gardien: number;
  };
  archetypeDominant: string;
  declicDeCroissance: string;
  answers: number[]; // Tableau contenant les 26 réponses
  inscriptionWebinaire: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction pour obtenir le token d'accès Google
async function getGoogleAccessToken() {
  const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKeyRaw = Deno.env.get('GOOGLE_PRIVATE_KEY');

  if (!serviceAccountEmail || !privateKeyRaw) {
    throw new Error('Credentials Google manquants');
  }

  // Nettoyage simple mais robuste de la clé privée
  let cleanPrivateKey = privateKeyRaw;
  
  // Supprimer les guillemets si présents
  if (cleanPrivateKey.startsWith('"') && cleanPrivateKey.endsWith('"')) {
    cleanPrivateKey = cleanPrivateKey.slice(1, -1);
  }
  
  // Remplacer les \n littéraux par de vraies nouvelles lignes
  cleanPrivateKey = cleanPrivateKey.replace(/\\n/g, '\n');
  
  // Vérifier la présence des marqueurs PEM
  if (!cleanPrivateKey.includes('-----BEGIN') || !cleanPrivateKey.includes('-----END')) {
    throw new Error('Format de clé privée invalide (pas de marqueurs PEM)');
  }

  // Alerte explicite si la clé est au format PKCS#1 (RSA PRIVATE KEY)
  if (cleanPrivateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    throw new Error('Clé privée au format PKCS#1 (BEGIN RSA PRIVATE KEY). Générez une clé JSON de service account (BEGIN PRIVATE KEY).');
  }
  
  // Extraire seulement le contenu base64 entre les marqueurs
  const base64Match = cleanPrivateKey.match(/-----BEGIN[^-]+-----\s*([A-Za-z0-9+/=\s]+)\s*-----END[^-]+-----/);
  if (!base64Match || !base64Match[1]) {
    throw new Error('Impossible d\'extraire le contenu base64 de la clé privée');
  }
  
  const base64Content = base64Match[1].replace(/\s+/g, '');
  
  // Décoder en Uint8Array
  let binaryKey: Uint8Array;
  try {
    const binaryStr = atob(base64Content);
    binaryKey = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      binaryKey[i] = binaryStr.charCodeAt(i);
    }
  } catch (e) {
    console.error('Erreur de décodage base64:', e);
    throw new Error('Décodage base64 de la clé privée échoué');
  }

  // Import de la clé privée au format PKCS#8
  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      binaryKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    );
  } catch (e) {
    console.error('Import de la clé privée échoué:', e);
    throw new Error('Clé privée Google invalide (import)');
  }

  // Helpers Base64URL (JWT)
  const toBase64Url = (input: string | Uint8Array) => {
    const str = typeof input === 'string' ? input : String.fromCharCode(...input);
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const headerB64 = toBase64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payloadB64 = toBase64Url(JSON.stringify(jwtPayload));
  const signingInput = `${headerB64}.${payloadB64}`;

  // Signature RS256
  const signatureData = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );
  const signatureB64 = toBase64Url(new Uint8Array(signatureData));

  const jwt = `${signingInput}.${signatureB64}`;

  // Échanger le JWT contre un token d'accès
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Erreur d'authentification Google: ${error}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Fonction pour ajouter des données au Google Sheet
async function appendToSheet(payload: QuizPayload) {
  const sheetId = Deno.env.get('SHEET_ID');
  if (!sheetId) {
    throw new Error('SHEET_ID manquant');
  }

  const accessToken = await getGoogleAccessToken();

  // Préparer la ligne de données dans l'ordre des colonnes du Sheet
  const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
  const row = [
    timestamp, // Horodateur
    payload.prenom, // Prénom
    payload.email, // Email
    payload.consentementRgpd ? 'Oui' : 'Non', // Consentement RGPD
    payload.scores.architecte, // Score Architecte (Athéna)
    payload.scores.enchanteur, // Score Enchanteur (Orphée)
    payload.scores.vigie, // Score Vigie (Cassandre)
    payload.scores.gardien, // Score Gardien (Hestia)
    payload.archetypeDominant, // Archétype dominant
    payload.declicDeCroissance, // Déclic de croissance
    payload.inscriptionWebinaire ? 'Oui' : 'Non', // Inscription webinaire
    ...payload.answers // Les 24 réponses du quiz
  ];

  // Ajouter la ligne au sheet
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Feuille%201!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur lors de l'ajout au Sheet: ${error}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Méthode non autorisée' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: QuizPayload = await req.json();

    // Validation des données requises
    if (!payload.prenom || !payload.email || !payload.scores || !payload.answers) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes dans le payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que nous avons bien 24 réponses
    if (payload.answers.length !== 24) {
      return new Response(
        JSON.stringify({ error: 'Le nombre de réponses doit être exactement 24' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Réception des données:', {
      prenom: payload.prenom,
      email: payload.email,
      archetype: payload.archetypeDominant,
      answersCount: payload.answers.length
    });

    // Envoyer vers Google Sheets
    const result = await appendToSheet(payload);

    console.log('Données ajoutées avec succès au Google Sheet:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Données sauvegardées avec succès' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur dans submitToGoogleSheet:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur interne du serveur' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});