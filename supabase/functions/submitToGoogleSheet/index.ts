// /supabase/functions/submitToGoogleSheet/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("=== DEBUT DE L'EDGE FUNCTION ===");

// Fonction d'authentification Google simplifiée pour test
async function getGoogleAuthTokenSimple(): Promise<string> {
  console.log("=== DEBUT AUTHENTIFICATION ===");
  
  const serviceAccountEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKeyRaw = Deno.env.get("GOOGLE_PRIVATE_KEY");

  console.log("Email:", serviceAccountEmail ? "OK" : "MANQUANT");
  console.log("Private Key:", privateKeyRaw ? "OK" : "MANQUANT");

  if (!serviceAccountEmail || !privateKeyRaw) {
    throw new Error("Les secrets GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_PRIVATE_KEY sont requis.");
  }

  // Test basique - retourner un token factice pour détecter où ça casse
  console.log("=== TEST: RETOUR TOKEN FACTICE ===");
  return "test_token_123";
}

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
    
    console.log("=== DEBUT AUTHENTIFICATION ===");
    // Test avec token factice d'abord
    const authToken = await getGoogleAuthTokenSimple();
    console.log("Token obtenu:", authToken);

    // Test simple sans appeler Google Sheets - juste retourner succès
    console.log("=== TEST: RETOUR SUCCES SANS APPEL GOOGLE ===");
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Test réussi - pas d'appel Google Sheets encore",
      sheetId: sheetId.substring(0, 10) + "...",
      payloadValid: true
    }), {
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