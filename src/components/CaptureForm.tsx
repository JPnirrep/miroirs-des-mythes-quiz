import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";


export const CaptureForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    rgpdConsent: false
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.rgpdConsent) {
      toast({
        title: "Consentement requis",
        description: "Veuillez accepter les conditions de traitement des données.",
        variant: "destructive"
      });
      return;
    }

    // Sauvegarde des données utilisateur pour les résultats
    localStorage.setItem('quizUserData', JSON.stringify(formData));

    // Here we would typically send data to a backend
    toast({
      title: "Inscription réussie !",
      description: "Redirection vers le quiz en cours...",
    });
    
    console.log("Form submitted:", formData);
    
    // Redirection vers le quiz après un court délai
    setTimeout(() => {
      navigate("/quiz-intro");
    }, 1500);
  };

  return (
    <Card className="p-8 shadow-divine bg-gradient-ethereal border-0 animate-scale-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-divine mb-4 animate-glow">
          <Sparkles className="w-8 h-8 text-cloud-white" />
        </div>
        <h2 className="font-poppins font-bold text-3xl text-primary mb-4">
          Le Grand Quiz Miroir des Mythes
        </h2>
        <p className="font-lato text-soft-gray text-lg">
          Découvrez quel archétype mythologique sommeille en vous et révélez votre potentiel caché
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="font-poppins font-medium text-primary">
            Prénom *
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Votre prénom"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="font-lato border-2 border-muted focus:border-secondary transition-colors h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="font-poppins font-medium text-primary">
            Nom *
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Votre nom"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="font-lato border-2 border-muted focus:border-secondary transition-colors h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="font-poppins font-medium text-primary">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="font-lato border-2 border-muted focus:border-secondary transition-colors h-12"
          />
        </div>


        <div className="flex items-start space-x-3 p-4 bg-cloud-white/50 rounded-lg">
          <Checkbox
            id="rgpd"
            checked={formData.rgpdConsent}
            onCheckedChange={(checked) => 
              setFormData(prev => ({ ...prev, rgpdConsent: checked as boolean }))
            }
            className="mt-1"
          />
          <Label htmlFor="rgpd" className="font-lato text-sm text-soft-gray leading-relaxed cursor-pointer">
            J'accepte que mes données personnelles soient traitées conformément à la politique de confidentialité pour recevoir les résultats de ce quiz et des contenus personnalisés. *
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full h-14 font-poppins font-bold text-lg bg-gradient-golden hover:bg-gradient-divine transition-all duration-300 transform hover:scale-105 shadow-mythical"
        >
          DÉCOUVRIR MON ARCHÉTYPE
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-6 font-lato">
        * Champs obligatoires
      </p>
    </Card>
  );
};