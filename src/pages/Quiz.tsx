import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Images pour l'échelle de réponse
const responseImages = [
  { 
    id: 1, 
    src: "/lovable-uploads/f7e35bac-50ab-4ab1-baba-cbdf112aa9a4.png", 
    label: "Pas du tout moi",
    description: "ΠΑΡΟΣ ΕΓΩ" 
  },
  { 
    id: 2, 
    src: "/lovable-uploads/77f48106-df33-4c0a-b245-17550f61dc6d.png", 
    label: "Rarement moi",
    description: "ΚΑΗΟΛΟΥ ΕΓΩ" 
  },
  { 
    id: 3, 
    src: "/lovable-uploads/1b688dd7-eaf1-4d4e-a99c-3bbcc4d3cacd.png", 
    label: "Parfois moi",
    description: "ΣΠΆΝΙΑ ΕΓΩ" 
  },
  { 
    id: 4, 
    src: "/lovable-uploads/deb4807e-bef1-4d0b-bfb0-795404d114ac.png", 
    label: "Souvent moi",
    description: "ΣΥΧΝΑ ΕΓΩ" 
  },
  { 
    id: 5, 
    src: "/lovable-uploads/ae8cfc36-5cfa-4046-b24a-10eb51162452.png", 
    label: "Totalement moi",
    description: "ΠΑΝΤΩΣ ΕΓΩ" 
  }
];

// Questions du quiz (aperçu des 3 premières)
const questions = [
  {
    id: 1,
    text: "Je prends facilement des décisions importantes sans hésiter longtemps.",
    archetype: "leader"
  },
  {
    id: 2,
    text: "J'aime aider les autres même quand cela me demande des sacrifices personnels.",
    archetype: "caregiver"
  },
  {
    id: 3,
    text: "Je cherche constamment de nouvelles expériences et adventures.",
    archetype: "explorer"
  }
];

// Textes de pause
const pauseTexts = {
  6: "Vous progressez bien ! Prenez un moment pour réfléchir à vos réponses jusqu'ici. Les questions suivantes exploreront d'autres aspects de votre personnalité.",
  12: "À mi-parcours ! Vos réponses commencent à dessiner un profil unique. Continuons à explorer les différentes facettes de qui vous êtes.",
  18: "Presque terminé ! Les dernières questions vont affiner votre profil archétypal. Restez authentique dans vos réponses."
};

export default function Quiz() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showPause, setShowPause] = useState(false);

  const totalQuestions = 24; // Total des questions (pour l'instant on en montre 3)
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerSelect = (questionId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const nextQuestion = currentQuestion + 1;
    
    // Vérifier si on doit afficher une pause
    if ([6, 12, 18].includes(nextQuestion)) {
      setShowPause(true);
      return;
    }

    if (nextQuestion >= questions.length) {
      // Quiz terminé - rediriger vers les résultats
      console.log("Quiz terminé:", answers);
      navigate("/results");
      return;
    }

    setCurrentQuestion(nextQuestion);
  };

  const handlePauseContinue = () => {
    setShowPause(false);
    setCurrentQuestion(currentQuestion + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const currentAnswer = answers[currentQuestionData?.id];

  if (showPause) {
    const pauseText = pauseTexts[currentQuestion + 1 as keyof typeof pauseTexts];
    
    return (
      <div className="min-h-screen bg-gradient-mythical">
        {/* Header avec logo */}
        <header className="w-full py-6 border-b border-cloud-white/20">
          <div className="container mx-auto px-4">
            <h1 className="text-center text-2xl font-cinzel font-bold text-cloud-white">
              LA FABRIQUE PEPPS
            </h1>
          </div>
        </header>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)] p-4">
          <Card className="max-w-2xl w-full p-8 bg-cloud-white/95 backdrop-blur-sm shadow-divine border-primary/20">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-cinzel font-bold text-primary">Pause réflexive</h2>
              <p className="text-lg text-primary/80 font-lato leading-relaxed">
                {pauseText}
              </p>
              <Button 
                onClick={handlePauseContinue}
                className="font-lato font-semibold bg-gradient-divine hover:bg-gradient-golden text-primary-foreground shadow-mythical hover:shadow-divine transition-all duration-300"
              >
                Continuer le quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mythical">
      {/* Header avec logo */}
      <header className="w-full py-6 border-b border-cloud-white/20">
        <div className="container mx-auto px-4">
          <h1 className="text-center text-2xl font-cinzel font-bold text-cloud-white">
            LA FABRIQUE PEPPS
          </h1>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <div className="max-w-4xl w-full space-y-6">
          {/* Navigation header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-cloud-white hover:text-primary hover:bg-cloud-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            
            <div className="text-cloud-white font-lato">
              Question {currentQuestion + 1} sur {totalQuestions}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="space-y-2">
            <Progress value={progress} className="w-full h-3 bg-primary/20" />
            <div className="text-center text-cloud-white/80 text-sm font-lato">
              {Math.round(progress)}% complété
            </div>
          </div>

          {/* Question */}
          <Card className="p-8 bg-cloud-white/95 backdrop-blur-sm shadow-divine border-primary/20">
            <div className="text-center space-y-8">
              <h2 className="text-2xl font-cinzel font-bold text-primary">
                {currentQuestionData?.text}
              </h2>
              
              <p className="text-primary/70 font-lato">
                Dans quelle mesure cette affirmation vous correspond-elle ?
              </p>

              {/* Échelle de réponse avec images */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
                {responseImages.map((response) => (
                  <div
                    key={response.id}
                    onClick={() => handleAnswerSelect(currentQuestionData.id, response.id)}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      currentAnswer === response.id 
                        ? 'ring-4 ring-primary ring-offset-4 ring-offset-cloud-white' 
                        : ''
                    }`}
                  >
                    <div className="text-center space-y-3">
                      <div className="relative group">
                        <img
                          src={response.src}
                          alt={response.label}
                          className="w-24 h-24 mx-auto rounded-full shadow-mythical group-hover:shadow-divine transition-all duration-300"
                        />
                        {currentAnswer === response.id && (
                          <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-lato font-medium text-primary">
                          {response.label}
                        </p>
                        <p className="text-xs text-primary/60 font-cinzel">
                          {response.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="font-lato border-cloud-white/30 text-cloud-white hover:bg-cloud-white/20 hover:border-cloud-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <Button
              onClick={handleNext}
              disabled={!currentAnswer}
              className="font-lato font-semibold bg-gradient-divine hover:bg-gradient-golden text-primary-foreground shadow-mythical hover:shadow-divine transition-all duration-300 disabled:opacity-50"
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}