import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useSubmitToGoogleSheet } from "@/hooks/useSubmitToGoogleSheet";
import { useToast } from "@/components/ui/use-toast";

export const GoogleSheetsTester = () => {
  const { submitData, isLoading, isSuccess, error } = useSubmitToGoogleSheet();
  const { toast } = useToast();

  const shouldShow = useMemo(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    return params.get("test") === "1";
  }, []);

  const handleTest = async () => {
    const payload = {
      prenom: "Test",
      email: "dev@test.local",
      consentementRgpd: false,
      scores: { architecte: 1, enchanteur: 1, vigie: 1, gardien: 1 },
      archetypeDominant: "orphee",
      declicDeCroissance: "Test automatique",
      answers: Array.from({ length: 24 }, () => 3),
      inscriptionWebinaire: false,
    };

    await submitData(payload as any);
  };

  useEffect(() => {
    if (isSuccess) {
      toast({ title: "Test réussi", description: "Connexion Google Sheets OK." });
    }
    if (error) {
      toast({ title: "Test échoué", description: error, variant: "destructive" });
    }
  }, [isSuccess, error, toast]);

  if (!shouldShow) return null;

  return (
    <div className="flex justify-center mt-4">
      <Button variant="secondary" onClick={handleTest} disabled={isLoading}>
        {isLoading ? "Test en cours…" : "Tester la connexion Google Sheets"}
      </Button>
    </div>
  );
};
