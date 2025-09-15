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
  const privateKey = Deno.env.get('GOOGLE_PRIVATE_KEY');

  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Credentials Google manquants');
  }

  // Nettoyer la clé privée
  const cleanPrivateKey = privateKey.replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Créer le JWT
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const encodedPayload = btoa(JSON.stringify(payload));

  // Importer la clé privée
  const keyData = cleanPrivateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');

  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Signer le JWT
  const signatureData = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(`${header}.${encodedPayload}`)
  );

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureData)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${header}.${encodedPayload}.${signature}`;

  // Échanger le JWT contre un token d'accès
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
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
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Feuille1:append?valueInputOption=RAW`,
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