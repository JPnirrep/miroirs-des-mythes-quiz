// /supabase/functions/submitToGoogleSheet/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getGoogleAuthToken } from "../_shared/gcp_auth.ts";

console.log("=== DEBUT DE L'EDGE FUNCTION ===");

// Interface pour le payload du quiz
interface QuizPayload {
  prenom?: string;
  email: string;
  consentementRgpd?: boolean;
  scores?: {
    architecte?: number;
    enchanteur?: number;
    vigie?: number;
    gardien?: number;
  };
  archetypeDominant?: string;
  declicDeCroissance?: string;
  answers?: number[]; // Optionnel - 26 réponses si présent
  inscriptionWebinaire?: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction principale du serveur
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== RECEPTION REQUETE ===");
    const payload: QuizPayload = await req.json();
    console.log("Payload reçu:", payload);
    
    const sheetId = Deno.env.get('SHEET_ID');
    console.log("Sheet ID:", sheetId ? "OK" : "MANQUANT");

    if (!sheetId) {
      console.error("ERREUR: SHEET_ID manquant");
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Le secret SHEET_ID est manquant.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

// Validation souple du payload
if (!payload.email) {
  console.error("ERREUR: Payload invalide - email manquant");
  return new Response(JSON.stringify({
    success: false,
    error: "Payload invalide : email requis."
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 400,
  });
}
// Si des réponses sont fournies, elles doivent être au nombre de 26
if (payload.answers && payload.answers.length !== 26) {
  console.error("ERREUR: Payload invalide - answers doit contenir 26 éléments lorsqu'il est présent");
  return new Response(JSON.stringify({
    success: false,
    error: "Payload invalide : answers doit contenir 26 éléments si fourni."
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 400,
  });
}
    
    console.log("=== DEBUT AUTHENTIFICATION REELLE ===");
    let authToken;
    try {
      authToken = await getGoogleAuthToken();
      console.log("Token obtenu:", authToken ? "OK" : "KO");
    } catch (authError) {
      console.error("ERREUR AUTHENTIFICATION:", authError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Erreur d'authentification Google: ${authError.message}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

// Préparer la ligne de données dans l'ordre EXACT des colonnes
const timestamp = new Date().toISOString();

// Valeurs sûres (laisser vide si non fourni)
const safePrenom = payload.prenom ?? '';
const safeConsent = payload.consentementRgpd ? 'Oui' : 'Non';
const safeScores = {
  architecte: payload.scores?.architecte ?? '',
  enchanteur: payload.scores?.enchanteur ?? '',
  vigie: payload.scores?.vigie ?? '',
  gardien: payload.scores?.gardien ?? '',
};
const safeArchetype = payload.archetypeDominant ?? '';
const safeDeclic = payload.declicDeCroissance ?? '';
const safeAnswers = Array.isArray(payload.answers)
  ? payload.answers.slice(0, 26)
  : Array(26).fill('');
const safeWebinar = payload.inscriptionWebinaire ? 'Oui' : 'Non';

const row = [
  timestamp,
  safePrenom,
  payload.email,
  safeConsent,
  safeScores.architecte,
  safeScores.enchanteur,
  safeScores.vigie,
  safeScores.gardien,
  safeArchetype,
  safeDeclic,
  ...safeAnswers,
  safeWebinar,
];

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Feuille%201!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
    console.log("Appel Google Sheets:", url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("Réponse Google Sheets KO:", response.status, txt);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Erreur de l'API Google (${response.status}): ${txt}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const data = await response.json();
    console.log("Réponse Google Sheets OK:", data);

    return new Response(JSON.stringify({ success: true, result: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erreur dans la fonction submitToGoogleSheet:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Erreur inconnue' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});