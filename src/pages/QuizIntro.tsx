import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const QuizIntro = () => {
  const navigate = useNavigate();

  const responseScale = [
    { 
      id: 1, 
      src: "/lovable-uploads/f7e35bac-50ab-4ab1-baba-cbdf112aa9a4.png", 
      label: "Pas du tout moi",
      number: "1"
    },
    { 
      id: 2, 
      src: "/lovable-uploads/77f48106-df33-4c0a-b245-17550f61dc6d.png", 
      label: "Rarement moi",
      number: "2"
    },
    { 
      id: 3, 
      src: "/lovable-uploads/1b688dd7-eaf1-4d4e-a99c-3bbcc4d3cacd.png", 
      label: "Parfois moi",
      number: "3"
    },
    { 
      id: 4, 
      src: "/lovable-uploads/deb4807e-bef1-4d0b-bfb0-795404d114ac.png", 
      label: "Souvent moi",
      number: "4"
    },
    { 
      id: 5, 
      src: "/lovable-uploads/ae8cfc36-5cfa-4046-b24a-10eb51162452.png", 
      label: "Totalement moi",
      number: "5"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-ethereal">
      {/* Header avec le logo */}
      <header className="w-full py-6 border-b border-primary/20">
        <div className="container mx-auto px-4">
          <img 
            src="/lovable-uploads/10522b09-8aa7-4d45-aa5d-61907e365b88.png" 
            alt="La Fabrique PEPPS" 
            className="h-16 mx-auto"
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Message de bienvenue */}
          <Card className="p-8 mb-12 border-0 shadow-mythical bg-gradient-to-br from-card to-muted/20">
            <div className="text-center space-y-6">
              <h1 className="font-poppins font-bold text-4xl md:text-5xl text-primary mb-6 animate-fade-in">
                Bienvenue !
              </h1>
              <div className="space-y-4 text-soft-gray font-lato leading-relaxed animate-fade-in" style={{ animationDelay: "200ms" }}>
                <p className="text-lg">
                  Vous vous apprêtez à vivre une expérience ludique pour mettre en lumière les forces cachées de votre sensibilité.
                </p>
                <p className="text-lg">
                  Oubliez les tests classiques! Ici, il n'y a pas de bonnes ou de mauvaises réponses, juste une invitation à vous découvrir sous un nouveau jour.
                </p>
                <p className="text-lg">
                  En <strong className="text-primary">24 questions rapides</strong> (environ 5 minutes), nous allons dessiner le profil unique de votre super-pouvoir de communicant(e).
                </p>
                <p className="text-xl font-medium text-primary">
                  Prêt(e) à célébrer ce qui vous rend si spécial(e)?
                </p>
              </div>
            </div>
          </Card>

          {/* Échelle de réponse */}
          <Card className="p-8 border-0 shadow-mythical bg-gradient-to-br from-card to-muted/20 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <h2 className="font-poppins font-bold text-3xl text-primary text-center mb-8">
              Échelle de réponse
            </h2>
            <p className="font-lato text-lg text-soft-gray text-center mb-8">
              Pour chaque affirmation, choisissez le smiley qui vous correspond le mieux.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {responseScale.map((response, index) => (
                <div 
                  key={response.id} 
                  className="text-center space-y-3 animate-fade-in"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="font-poppins font-bold text-2xl text-primary">
                      {response.number}
                    </span>
                    <img 
                      src={response.src} 
                      alt={response.label}
                      className="w-16 h-16 object-contain transition-transform hover:scale-110"
                    />
                  </div>
                  <p className="font-lato text-sm text-soft-gray">
                    {response.label}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Bouton de démarrage */}
          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: "1100ms" }}>
            <Button 
              onClick={() => navigate('/quiz')}
              size="lg"
              className="font-poppins font-semibold text-lg px-12 py-6 bg-gradient-golden hover:shadow-divine transition-all duration-300 hover:-translate-y-1"
            >
              Commencer le Quiz
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="font-lato">
            © 2024 La Fabrique PEPPS - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
};

export default QuizIntro;