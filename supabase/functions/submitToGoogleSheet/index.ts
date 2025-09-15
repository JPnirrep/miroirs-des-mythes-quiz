// /supabase/functions/submitToGoogleSheet/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getGoogleAuthToken } from "../_shared/gcp_auth.ts";

console.log("=== DEBUT DE L'EDGE FUNCTION ===");


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
  answers: number[]; // Doit contenir 24 réponses
  inscriptionWebinaire: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonction principale du serveur
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("=== RECEPTION REQUETE ===");
    const payload: QuizPayload = await req.json();
    console.log("Payload reçu:", payload);
    
    const sheetId = Deno.env.get('SHEET_ID');
    console.log("Sheet ID:", sheetId ? "OK" : "MANQUANT");

    if (!sheetId) {
      throw new Error('Le secret SHEET_ID est manquant.');
    }

    // Validation simple du payload
    if (!payload.email || !payload.answers || payload.answers.length !== 24) {
        throw new Error("Payload invalide : email ou nombre de réponses incorrect.");
    }
    
    console.log("=== DEBUT AUTHENTIFICATION REELLE ===");
    const authToken = await getGoogleAuthToken();
    console.log("Token obtenu (début):", authToken ? "OK" : "KO");

    // Préparer la ligne de données dans l'ordre EXACT des colonnes
    const timestamp = new Date().toISOString();
    const row = [
      timestamp,
      payload.prenom,
      payload.email,
      payload.consentementRgpd ? 'Oui' : 'Non',
      payload.scores.architecte,
      payload.scores.enchanteur,
      payload.scores.vigie,
      payload.scores.gardien,
      payload.archetypeDominant,
      payload.declicDeCroissance,
      ...payload.answers,
      payload.inscriptionWebinaire ? 'Oui' : 'Non',
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
      console.error("Réponse Google Sheets KO:", txt);
      throw new Error(`Erreur de l'API Google: ${txt}`);
    }

    const data = await response.json();
    console.log("Réponse Google Sheets OK:", data);

    return new Response(JSON.stringify({ success: true, result: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erreur dans la fonction submitToGoogleSheet:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});