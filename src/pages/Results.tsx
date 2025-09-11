import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, RotateCcw, Crown, Sparkles } from "lucide-react";
import athenaImage from "@/assets/athena.jpg";
import orpheeImage from "@/assets/orphee.jpg";
import cassandreImage from "@/assets/cassandre.jpg";
import hestiaImage from "@/assets/hestia.jpg";

interface ArchetypeScore {
  athena: number;
  orphee: number;
  cassandre: number;
  hestia: number;
}

interface ArchetypeData {
  name: string;
  image: string;
  title: string;
  description: string;
  traits: string[];
  advice: string;
}

const archetypesData: Record<string, ArchetypeData> = {
  athena: {
    name: "Athéna",
    image: athenaImage,
    title: "La Stratège Sage",
    description: "Vous incarnez la sagesse stratégique d'Athéna. Votre intelligence pratique et votre capacité à voir au-delà des apparences vous permettent de naviguer avec discernement dans les situations complexes. Comme la déesse de la guerre juste et de la sagesse, vous guidez les autres vers des solutions équilibrées.",
    traits: [
      "Intelligence stratégique et analytique",
      "Capacité à prendre des décisions éclairées",
      "Vision à long terme et planification",
      "Leadership naturel et conseil avisé",
      "Équilibre entre réflexion et action"
    ],
    advice: "Continuez à cultiver votre sagesse tout en restant connectée aux émotions. Votre force réside dans l'équilibre entre raison et intuition."
  },
  orphee: {
    name: "Orphée",
    image: orpheeImage,
    title: "L'Artiste Visionnaire", 
    description: "Vous portez en vous l'âme créatrice d'Orphée. Votre sensibilité artistique et votre capacité à toucher les âmes font de vous un pont entre les mondes. Comme le musicien légendaire, vous utilisez votre créativité pour guérir, inspirer et révéler la beauté cachée du monde.",
    traits: [
      "Créativité débordante et originale",
      "Sensibilité émotionnelle profonde", 
      "Capacité à inspirer et émouvoir",
      "Vision artistique unique",
      "Don pour l'expression créative"
    ],
    advice: "Embrassez votre sensibilité comme une force. Votre art a le pouvoir de transformer le monde - continuez à créer avec passion."
  },
  cassandre: {
    name: "Cassandre",
    image: cassandreImage,
    title: "La Visionnaire Incomprise",
    description: "Vous possédez le don prophétique de Cassandre. Votre intuition profonde vous permet de percevoir des vérités que d'autres ne voient pas encore. Comme la prophétesse troyenne, vous avez le courage d'exprimer ces vérités, même face à l'incompréhension.",
    traits: [
      "Intuition développée et prémonitoire",
      "Perception des vérités cachées",
      "Courage de dire ce qui dérange", 
      "Sensibilité aux énergies subtiles",
      "Vision avant-gardiste"
    ],
    advice: "Ayez confiance en vos intuitions. Votre rôle d'éveilleur de conscience est précieux - persistez malgré l'incompréhension temporaire."
  },
  hestia: {
    name: "Hestia",
    image: hestiaImage,
    title: "La Gardienne du Foyer",
    description: "Vous incarnez la bienveillance protectrice d'Hestia. Votre capacité à créer des espaces sacrés et à nourrir la croissance des autres fait de vous un pilier de stabilité. Comme la déesse du foyer, vous construisez et préservez l'harmonie autour de vous.",
    traits: [
      "Bienveillance naturelle et protectrice",
      "Capacité à créer de l'harmonie",
      "Stabilité émotionnelle rassurante",
      "Don pour prendre soin des autres",
      "Sagesse du quotidien"
    ],
    advice: "Votre force tranquille est un don précieux. N'oubliez pas de prendre soin de vous tout en veillant sur les autres."
  }
};

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scores, setScores] = useState<ArchetypeScore>({ athena: 0, orphee: 0, cassandre: 0, hestia: 0 });
  const [dominantArchetype, setDominantArchetype] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler le calcul des scores basé sur les réponses du quiz
    // Dans une vraie application, vous récupéreriez les réponses du localStorage ou des paramètres
    const mockCalculateScores = () => {
      // Simulation de scores pour démonstration
      const mockScores: ArchetypeScore = {
        athena: Math.floor(Math.random() * 30) + 1,
        orphee: Math.floor(Math.random() * 30) + 1, 
        cassandre: Math.floor(Math.random() * 30) + 1,
        hestia: Math.floor(Math.random() * 30) + 1
      };

      // Trouver l'archétype dominant
      const dominant = Object.entries(mockScores).reduce((a, b) => 
        mockScores[a[0] as keyof ArchetypeScore] > mockScores[b[0] as keyof ArchetypeScore] ? a : b
      )[0];

      setScores(mockScores);
      setDominantArchetype(dominant);
      setIsLoading(false);
    };

    // Délai pour simuler le calcul
    setTimeout(mockCalculateScores, 1500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-joyful">
        {/* Header */}
        <header className="w-full py-6 border-b border-primary/20">
          <div className="container mx-auto px-4">
            <img 
              src="/lovable-uploads/10522b09-8aa7-4d45-aa5d-61907e365b88.png" 
              alt="La Fabrique PEPPS" 
              className="h-16 mx-auto"
            />
          </div>
        </header>

        <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4">
          <Card className="max-w-lg w-full p-8 bg-cloud-white/95 backdrop-blur-sm shadow-divine border-primary/20">
            <div className="text-center space-y-6">
              <div className="animate-spin w-12 h-12 mx-auto">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-cinzel font-bold text-primary">
                Analyse en cours...
              </h2>
              <p className="text-lg text-primary/80 font-lato">
                Nous analysons vos réponses pour révéler votre archétype mythologique.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const dominantData = archetypesData[dominantArchetype];
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return (
    <div className="min-h-screen bg-gradient-joyful">
      {/* Header */}
      <header className="w-full py-6 border-b border-primary/20">
        <div className="container mx-auto px-4">
          <img 
            src="/lovable-uploads/10522b09-8aa7-4d45-aa5d-61907e365b88.png" 
            alt="La Fabrique PEPPS" 
            className="h-16 mx-auto"
          />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Résultat Principal */}
        <section className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-cinzel font-bold text-primary">
              Votre Archétype Dominant
            </h1>
            <Crown className="w-8 h-8 text-accent" />
          </div>
          
          <Card className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-cloud-white via-cloud-white/95 to-muted/20 border-accent/30 shadow-divine">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 text-left">
                <div>
                  <h2 className="text-3xl font-poppins font-bold text-primary mb-2">
                    {dominantData.name}
                  </h2>
                  <p className="text-xl text-secondary font-cinzel italic">
                    {dominantData.title}
                  </p>
                </div>
                
                <p className="text-lg text-primary/80 font-lato leading-relaxed">
                  {dominantData.description}
                </p>

                <div className="bg-accent/10 p-4 rounded-lg">
                  <p className="font-lato font-semibold text-primary italic">
                    "{dominantData.advice}"
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src={dominantData.image}
                  alt={`Archétype ${dominantData.name}`}
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-mythical"
                />
                <div className="absolute -top-4 -right-4 bg-accent text-primary p-3 rounded-full shadow-lg">
                  <Crown className="w-6 h-6" />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Traits Caractéristiques */}
        <section className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-cinzel font-bold text-primary text-center mb-8">
            Vos Traits Caractéristiques
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dominantData.traits.map((trait, index) => (
              <Card key={index} className="p-4 bg-cloud-white/90 border-primary/20 hover:border-accent/40 transition-colors">
                <p className="font-lato text-primary/90 text-center">
                  {trait}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Profil Complet */}
        <section className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-cinzel font-bold text-primary text-center mb-8">
            Votre Profil Archétypal Complet
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(archetypesData).map(([key, data]) => {
              const percentage = Math.round((scores[key as keyof ArchetypeScore] / totalScore) * 100);
              const isDominant = key === dominantArchetype;
              
              return (
                <Card 
                  key={key}
                  className={`p-6 transition-all duration-300 ${
                    isDominant 
                      ? 'bg-gradient-to-br from-accent/20 to-secondary/20 border-accent shadow-divine scale-105' 
                      : 'bg-cloud-white/90 border-primary/20 hover:shadow-mythical'
                  }`}
                >
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <img 
                        src={data.image}
                        alt={data.name}
                        className="w-20 h-20 mx-auto rounded-full object-cover shadow-lg"
                      />
                      {isDominant && (
                        <div className="absolute -top-2 -right-2 bg-accent text-primary p-1 rounded-full">
                          <Crown className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-poppins font-bold text-lg text-primary">
                        {data.name}
                      </h4>
                      <p className="text-sm text-secondary font-cinzel">
                        {data.title}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-primary/20 rounded-full h-3">
                        <div 
                          className="bg-gradient-golden h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-sm font-lato font-semibold text-primary">
                        {percentage}%
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Actions */}
        <section className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
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
        </section>
      </div>
    </div>
  );
}