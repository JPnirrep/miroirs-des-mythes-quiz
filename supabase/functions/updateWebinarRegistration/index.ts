// /supabase/functions/updateWebinarRegistration/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getGoogleAuthToken } from "../_shared/gcp_auth.ts";

console.log("=== DEBUT DE L'EDGE FUNCTION UPDATE WEBINAR ===");

interface UpdateWebinarPayload {
  email: string;
  inscriptionWebinaire: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== RECEPTION REQUETE UPDATE ===");
    const payload: UpdateWebinarPayload = await req.json();
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

    if (!payload.email) {
      console.error("ERREUR: Email manquant");
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email requis pour la mise à jour.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log("=== DEBUT AUTHENTIFICATION ===");
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

    // ÉTAPE 1: Récupérer toutes les données pour trouver la ligne avec cet email
    console.log("=== RECHERCHE DE L'EMAIL DANS LE SHEET ===");
    const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Feuille%201!A:AJ`;
    
    const getResponse = await fetch(getUrl, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error("Erreur lecture sheet:", getResponse.status, errorText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Erreur lecture sheet: ${getResponse.status}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const data = await getResponse.json();
    const rows = data.values || [];
    console.log(`Recherche email: ${payload.email} dans ${rows.length} lignes`);
    
    // Trouver la ligne avec l'email correspondant (colonne C = index 2)
    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) { // Skip header row
      if (rows[i] && rows[i][2] === payload.email) {
        targetRowIndex = i + 1; // Google Sheets rows start at 1
        console.log(`Email trouvé à la ligne ${targetRowIndex}`);
        break;
      }
    }

    if (targetRowIndex === -1) {
      console.error(`Email "${payload.email}" non trouvé dans la feuille`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Email "${payload.email}" non trouvé dans la feuille` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // ÉTAPE 2: Mettre à jour UNIQUEMENT la colonne "Inscription Webinaire" (colonne AJ = 36ème index, 37ème colonne)
    console.log("=== MISE À JOUR DE LA COLONNE WEBINAIRE ===");
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Feuille%201!AJ${targetRowIndex}?valueInputOption=RAW`;
    
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[payload.inscriptionWebinaire ? 'Oui' : 'Non']]
      }),
    });

    if (!updateResponse.ok) {
      const updateError = await updateResponse.text();
      console.error("Erreur update:", updateResponse.status, updateError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Erreur update: ${updateResponse.status}` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const updateResult = await updateResponse.json();
    console.log("Update réussi:", updateResult);
    
    return new Response(JSON.stringify({ 
      success: true, 
      rowUpdated: targetRowIndex,
      email: payload.email,
      webinaire: payload.inscriptionWebinaire,
      result: updateResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erreur dans updateWebinarRegistration:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Erreur inconnue' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});