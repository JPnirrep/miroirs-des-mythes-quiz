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

// Questions complètes du quiz - 24 questions explorant les 4 archétypes
const questions = [
  // Questions Orphée - L'Artiste Visionnaire (6 questions)
  {
    id: 1,
    text: "Les histoires touchantes (films, livres, récits personnels) me transportent et peuvent facilement me faire monter les larmes aux yeux.",
    archetype: "orphee"
  },
  {
    id: 2,
    text: "Avant de présenter une idée importante, j'aime explorer tous les angles et peser le pour et le contre en détail.",
    archetype: "athena"
  },
  {
    id: 3,
    text: "Je suis très sensible aux atmosphères et je peux sentir immédiatement si l'ambiance d'un lieu est tendue ou détendue.",
    archetype: "cassandre"
  },
  {
    id: 4,
    text: "Face à l'agitation ou au bruit, je sais instinctivement comment créer un espace de calme à l'intérieur de moi.",
    archetype: "hestia"
  },
  {
    id: 5,
    text: "Je préfère largement improviser plutôt que de passer beaucoup de temps à préparer mes interventions.",
    archetype: "orphee"
  },
  {
    id: 6,
    text: "Après une journée très active ou sociale, un moment de solitude n'est pas un luxe, c'est une nécessité vitale pour me recharger.",
    archetype: "hestia"
  },

  // Questions Cassandre - La Visionnaire Incomprise (6 questions)
  {
    id: 7,
    text: "Je ressens intensément les émotions des autres, parfois comme si elles étaient les miennes.",
    archetype: "cassandre"
  },
  {
    id: 8,
    text: "Les subtilités et les détails d'une situation ont tendance à m'échapper.",
    archetype: "orphee"
  },
  {
    id: 9,
    text: "Je suis très conscient(e) de mes limites et je sais quand il est temps pour moi de faire une pause pour rester efficace.",
    archetype: "hestia"
  },
  {
    id: 10,
    text: "Les critiques négatives me touchent profondément et peuvent occuper mes pensées pendant un certain temps.",
    archetype: "cassandre"
  },
  {
    id: 11,
    text: "Je perçois intuitivement les \"non-dits\" dans une conversation, juste en observant le langage corporel.",
    archetype: "cassandre"
  },
  {
    id: 12,
    text: "On me dit souvent que j'ai un talent pour expliquer des choses compliquées de manière simple et claire.",
    archetype: "athena"
  },

  // Questions Athéna - La Stratège Sage (6 questions)
  {
    id: 13,
    text: "Je puise mon énergie dans les environnements très stimulants et je m'y sens parfaitement à l'aise pendant des heures.",
    archetype: "orphee"
  },
  {
    id: 14,
    text: "Les micro-expressions du visage et les non-dits dans son langage corporel captent particulièrement mon attention.",
    archetype: "cassandre"
  },
  {
    id: 15,
    text: "Quand j'écoute quelqu'un parler, ce qui capte le plus mon attention, c'est la passion et la sincérité qui se dégagent de sa voix.",
    archetype: "orphee"
  },
  {
    id: 16,
    text: "L'analyse approfondie d'un sujet m'aide à me sentir plus en sécurité avant d'en parler.",
    archetype: "athena"
  },
  {
    id: 17,
    text: "Un environnement esthétiquement beau et harmonieux a un effet direct et positif sur mon bien-être.",
    archetype: "hestia"
  },
  {
    id: 18,
    text: "Je prends le temps de m'ancrer et de me recentrer avant un événement important ou une prise de parole.",
    archetype: "hestia"
  },

  // Questions Hestia - La Gardienne du Foyer (6 questions)
  {
    id: 19,
    text: "Je me sens contraint(e) et peu créatif(ve) lorsque je dois suivre un plan trop détaillé.",
    archetype: "orphee"
  },
  {
    id: 20,
    text: "Ma plus grande peur en m'exprimant est de paraître froid(e) ou déconnecté(e) de mon message.",
    archetype: "orphee"
  },
  {
    id: 21,
    text: "Ma plus grande peur en présentant mes idées est de perdre le fil ou de présenter quelque chose d'imprécis.",
    archetype: "athena"
  },
  {
    id: 22,
    text: "J'ai un \"sixième sens\" pour deviner l'humeur d'une personne, même si elle essaie de la cacher.",
    archetype: "cassandre"
  },
  {
    id: 23,
    text: "Après une conversation émotionnellement chargée, j'ai besoin d'un moment pour \"digérer\" et retrouver mon calme.",
    archetype: "hestia"
  },
  {
    id: 24,
    text: "Ma plus grande crainte avant une intervention est de me sentir submergé(e) par l'anxiété au point de perdre tes moyens.",
    archetype: "athena"
  }
];

// Textes de pause
const pauseTexts = {
  6: "Petite pause! Respirez un coup. Vous faites ça très bien. On continue ?",
  12: "Super! La moitié du chemin est faite. Prenez une gorgée d'eau, et c'est reparti !",
  18: "On y est presque ! Plus que quelques questions pour découvrir votre profil unique."
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
      // Quiz terminé - sauvegarder et rediriger vers les résultats
      const orderedAnswers = Array.from({ length: totalQuestions }, (_, i) => answers[i + 1] ?? 3);
      localStorage.setItem('quizAnswers', JSON.stringify(orderedAnswers));
      console.log("Quiz terminé:", orderedAnswers);
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
    <div className="min-h-screen bg-gradient-joyful">
        {/* Header avec logo */}
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
    <div className="min-h-screen bg-gradient-joyful">
      {/* Header avec logo */}
      <header className="w-full py-6 border-b border-primary/20">
        <div className="container mx-auto px-4">
          <img 
            src="/lovable-uploads/10522b09-8aa7-4d45-aa5d-61907e365b88.png" 
            alt="La Fabrique PEPPS" 
            className="h-16 mx-auto"
          />
        </div>
      </header>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <div className="max-w-4xl w-full space-y-6">
          {/* Navigation header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-primary hover:text-primary hover:bg-primary/10"
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