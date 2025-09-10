import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";

export default function Results() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-mythical p-4 flex items-center justify-center">
      <Card className="max-w-2xl w-full p-8 bg-cloud-white/95 backdrop-blur-sm shadow-divine border-primary/20">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-cinzel font-bold text-primary">
            Résultats du Quiz
          </h1>
          
          <p className="text-lg text-primary/80 font-lato">
            Félicitations ! Vous avez terminé le quiz archétypal. 
            Les résultats détaillés seront bientôt disponibles.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="font-lato border-primary/50 text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Accueil
            </Button>
            
            <Button
              onClick={() => navigate("/quiz")}
              className="font-lato bg-gradient-divine hover:bg-gradient-golden text-primary-foreground shadow-mythical hover:shadow-divine transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Refaire le quiz
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}