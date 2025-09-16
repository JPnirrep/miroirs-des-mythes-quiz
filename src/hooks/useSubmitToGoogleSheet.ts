import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  answers: number[]; // Tableau contenant les 24 réponses
  inscriptionWebinaire: boolean;
}

interface UseSubmitToGoogleSheetReturn {
  submitData: (payload: QuizPayload) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour soumettre les données du quiz vers Google Sheets
 * via une Edge Function Supabase sécurisée
 */
export const useSubmitToGoogleSheet = (): UseSubmitToGoogleSheetReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitData = async (payload: QuizPayload) => {
    // Reset des états
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);

    try {
      console.log('Envoi des données vers Google Sheets:', {
        prenom: payload.prenom,
        email: payload.email,
        archetype: payload.archetypeDominant,
        answers: payload.answers,
        answersLength: payload.answers.length
      });

      // Appel de l'Edge Function via le client Supabase
      const { data, error: functionError } = await supabase.functions.invoke('submitToGoogleSheet', {
        body: payload
      });

      if (functionError) {
        throw new Error(functionError.message || 'Erreur lors de l\'appel à la fonction');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erreur inconnue lors de la sauvegarde');
      }

      console.log('Données sauvegardées avec succès:', data);
      setIsSuccess(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors de la soumission:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitData,
    isLoading,
    isSuccess,
    error
  };
};