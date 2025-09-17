import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UpdateWebinarPayload {
  email: string;
  inscriptionWebinaire: boolean;
}

interface UseUpdateWebinarRegistrationReturn {
  updateWebinarStatus: (payload: UpdateWebinarPayload) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

/**
 * Hook personnalisé pour mettre à jour le statut d'inscription au webinaire
 * dans Google Sheets via une Edge Function Supabase sécurisée
 */
export const useUpdateWebinarRegistration = (): UseUpdateWebinarRegistrationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWebinarStatus = async (payload: UpdateWebinarPayload) => {
    // Reset des états
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);

    try {
      console.log('Mise à jour statut webinaire:', {
        email: payload.email,
        inscription: payload.inscriptionWebinaire
      });

      // Appel de l'Edge Function via le client Supabase
      const { data, error: functionError } = await supabase.functions.invoke('updateWebinarRegistration', {
        body: payload
      });

      if (functionError) {
        throw new Error(functionError.message || 'Erreur lors de l\'appel à la fonction');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erreur inconnue lors de la mise à jour');
      }

      console.log('Statut webinaire mis à jour avec succès:', data);
      setIsSuccess(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur lors de la mise à jour webinaire:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateWebinarStatus,
    isLoading,
    isSuccess,
    error
  };
};