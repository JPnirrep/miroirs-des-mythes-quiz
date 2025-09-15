// /supabase/functions/submitToGoogleSheet/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getGoogleAuthToken } from "../_shared/gcp_auth.ts";

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
    const payload: QuizPayload = await req.json();
    const sheetId = Deno.env.get('SHEET_ID');

    if (!sheetId) {
      throw new Error('Le secret SHEET_ID est manquant.');
    }

    // Validation simple du payload
    if (!payload.email || !payload.answers || payload.answers.length !== 24) {
        throw new Error("Payload invalide : email ou nombre de réponses incorrect.");
    }
    
    // Obtenir le token d'authentification
    const authToken = await getGoogleAuthToken();

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

    // API endpoint pour ajouter une ligne
    const G_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Feuille 1!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const response = await fetch(G_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur de l'API Google: ${JSON.stringify(errorData)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
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