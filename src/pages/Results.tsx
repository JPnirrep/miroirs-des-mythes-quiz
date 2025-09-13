import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Crown, Sparkles, Star, Target, Download, PartyPopper } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  key: string;
  name: string;
  subtitle: string;
  image: string;
  title: string;
  description: string;
  declics: {
    title: string;
    content: string;
  }[];
}

interface ProfileAnalysis {
  type: 'dominant' | 'nuance' | 'combine';
  primary: string;
  secondary?: string;
  lowestScore: string;
}

// Questions mapping selon les nouvelles consignes
const questionMapping = {
  orphee: [1, 7, 10, 15, 20, 23], // Cœur Vibrant
  athena: [2, 5, 12, 16, 19, 21], // Phare de Clarté
  cassandre: [3, 8, 11, 14, 17, 22], // Antenne Subtile
  hestia: [4, 6, 9, 13, 18, 24] // Force Tranquille
};

// Questions inversées
const reversedQuestions = [5, 8, 13, 19];

const archetypesData: Record<string, ArchetypeData> = {
  athena: {
    key: "athena",
    name: "L'Architecte (Athéna)",
    subtitle: "Phare de Clarté",
    image: athenaImage,
    title: "Ton pouvoir caché : L'Architecte de la Clarté",
    description: "Tu ne le savais peut-être pas, mais ta sensibilité t'a doté(e) d'un super-pouvoir: celui de voir la structure là où les autres voient le chaos. Ton esprit traite l'information en profondeur, analysant, comparant et organisant les idées jusqu'à ce qu'elles forment une cathédrale de logique et de clarté. En prise de parole, ta puissance n'est pas dans l'improvisation, mais dans la construction. Tu bâtis la confiance de ton auditoire brique par brique, grâce à la solidité de ton raisonnement. Ta préparation méticuleuse n'est pas un signe d'anxiété, c'est ton rituel pour te sentir en sécurité et offrir le meilleur de ta pensée.",
    declics: [
      {
        title: 'Le Déclic "Présence"',
        content: "Assume ton besoin de structure. Avant une prise de parole, dessine ton plan sur une feuille (ton \"blueprint\"). Cet ancrage visuel libérera ton esprit et calmera ton trac."
      },
      {
        title: 'Le Déclic "Expression"',
        content: "Ta force est la pédagogie. Utilise des expressions comme \"Voici les trois points clés\", \"Pour résumer simplement\", \"La conséquence logique est...\". Tu deviens un guide rassurant pour ton public."
      }
    ]
  },
  orphee: {
    key: "orphee",
    name: "L'Enchanteur (Orphée)",
    subtitle: "Cœur Vibrant",
    image: orpheeImage,
    title: "Ton pouvoir caché : L'Enchanteur des Cœurs",
    description: "Ta sensibilité n'est pas une fragilité, c'est ton instrument de musique. Comme Orphée, tu as la capacité de toucher l'âme de ton auditoire parce que tu parles depuis le cœur. Ta grande réactivité émotionnelle, souvent perçue comme \"trop\", est en réalité la source de ta plus grande force de persuasion. En prise de parole, ta puissance n'est pas dans la perfection technique, mais dans l'authenticité vibrante. Tu ne transmets pas une information, tu partages une émotion. Le public ne se souviendra peut-être pas de tous tes mots, mais il n'oubliera jamais ce que tu lui as fait ressentir. Ton empathie est le fil invisible qui tisse le lien.",
    declics: [
      {
        title: 'Le Déclic "Paix Intérieure"',
        content: "Ton émotion est ton alliée, pas ton ennemie. Avant de parler, identifie l'émotion principale que tu veux transmettre (la joie, la conviction, l'espoir). C'est ta note de musique fondamentale, ton diapason."
      },
      {
        title: 'Le Déclic "Expression"',
        content: "Ose le \"Je\". Partage une courte anecdote personnelle qui illustre ton propos. C'est en osant une vulnérabilité maîtrisée que ton message devient universel et inoubliable."
      }
    ]
  },
  cassandre: {
    key: "cassandre",
    name: "La Vigie (Cassandre)",
    subtitle: "Antenne Subtile",
    image: cassandreImage,
    title: "Ton pouvoir caché : La Vigie des Signaux Faibles",
    description: "Ton système nerveux est une antenne haute-fidélité. Grâce à ta sensibilité aux stimuli subtils, tu perçois les nuances que 90% des gens ignorent : un changement de ton, une hésitation dans le regard, l'énergie d'un groupe. Ce n'est pas de l'imagination, c'est de l'information. En prise de parole, ta puissance n'est pas dans le discours figé, mais dans l'ajustement permanent. Ta capacité à \"lire la salle\" te permet d'adapter ton message en temps réel, de répondre aux objections avant même qu'elles ne soient formulées, et de créer une connexion incroyablement pertinente.",
    declics: [
      {
        title: 'Le Déclic "Présence"',
        content: "Ton regard n'est pas fait pour \"scanner\" un public, mais pour \"écouter\" avec les yeux. Choisis un ou deux visages bienveillants et connecte-toi réellement à eux. Ils deviendront tes alliés et tes baromètres."
      },
      {
        title: 'Le Déclic "Stimulation"',
        content: "Transforme ta perception en interaction. \"Je sens que ce point soulève des questions...\" ou \"J'imagine que certains d'entre vous pensent que...\". En nommant ce que tu perçois, tu montres à quel point tu es connecté(e) et tu crées un dialogue."
      }
    ]
  },
  hestia: {
    key: "hestia",
    name: "Le Gardien du Foyer (Hestia)",
    subtitle: "Force Tranquille",
    image: hestiaImage,
    title: "Ton pouvoir caché : Le Gardien du Calme",
    description: "Dans un monde bruyant et sur-stimulant, ta sensibilité t'a appris une compétence rare et précieuse : l'art de la régulation. Tu sais instinctivement que pour être efficace, tu dois d'abord protéger ta propre flamme intérieure. Ta tendance à la surstimulation n'est pas une faiblesse, c'est elle qui t'a forcé à devenir un expert de la paix intérieure. En prise de parole, ta puissance n'est pas dans l'explosion d'énergie, mais dans le rayonnement d'une force tranquille. Ton calme est contagieux. Il sécurise ton auditoire et donne un poids immense à chacun de tes mots. Tes silences sont plus puissants que les cris des autres.",
    declics: [
      {
        title: 'Le Déclic "Préparation"',
        content: "Ta préparation la plus importante n'est pas celle de tes slides, mais celle de ton état interne. Planifie 15 minutes de solitude et de silence absolu avant toute prise de parole. C'est non négociable. C'est ton sanctuaire."
      },
      {
        title: 'Le Déclic "Paix Intérieure"',
        content: "Ancre-toi physiquement. Juste avant de commencer, sens fermement le sol sous tes deux pieds. Prends trois respirations lentes et profondes en te concentrant sur l'expiration. Tu ne cherches pas à \"gagner\" en énergie, tu cherches à \"contenir\" la tienne. C'est là que réside ton véritable impact."
      }
    ]
  }
};

// Fonction pour calculer les scores selon les nouvelles consignes
const calculateScores = (answers: number[]): ArchetypeScore => {
  const scores: ArchetypeScore = { athena: 0, orphee: 0, cassandre: 0, hestia: 0 };
  
  Object.entries(questionMapping).forEach(([archetype, questions]) => {
    const archetypeScore = questions.reduce((sum, questionIndex) => {
      const answerIndex = questionIndex - 1; // Convertir en index 0-based
      let answerValue = answers[answerIndex] || 3; // Valeur par défaut si pas de réponse
      
      // Inverser les scores pour les questions inversées
      if (reversedQuestions.includes(questionIndex)) {
        answerValue = 6 - answerValue; // 1->5, 2->4, 3->3, 4->2, 5->1
      }
      
      return sum + answerValue;
    }, 0);
    
    scores[archetype as keyof ArchetypeScore] = archetypeScore;
  });
  
  return scores;
};

// Fonction pour analyser le profil
const analyzeProfile = (scores: ArchetypeScore): ProfileAnalysis => {
  const sortedScores = Object.entries(scores)
    .sort(([,a], [,b]) => b - a)
    .map(([key, value]) => ({ key, value }));

  const highest = sortedScores[0];
  const second = sortedScores[1];
  const lowest = sortedScores[sortedScores.length - 1];
  
  // Profil "Dominant" : 2+ points d'écart avec le second
  if (highest.value - second.value >= 2) {
    return {
      type: 'dominant',
      primary: highest.key,
      lowestScore: lowest.key
    };
  }
  
  // Profil "Combiné" : égalité en tête
  if (highest.value === second.value) {
    return {
      type: 'combine',
      primary: highest.key,
      secondary: second.key,
      lowestScore: lowest.key
    };
  }
  
  // Profil "Nuancé" : 1 point d'écart seulement
  return {
    type: 'nuance',
    primary: highest.key,
    secondary: second.key,
    lowestScore: lowest.key
  };
};

// Fonction pour obtenir le message de déclic de croissance
const getGrowthMessage = (lowestArchetype: string): string => {
  const messages = {
    athena: "Votre cœur sait déjà toucher les gens. Imaginez la puissance de votre message si vous y ajoutiez une touche de structure pour le rendre encore plus clair !",
    orphee: "Votre analyse est remarquable. Imaginez l'impact si vous osiez y ajouter une pincée d'émotion personnelle pour toucher le cœur autant que l'esprit !",
    cassandre: "Votre présence est déjà rassurante. Imaginez votre pouvoir si vous développiez encore plus votre capacité à capter les signaux subtils de votre auditoire !",
    hestia: "Votre énergie est communicative. Imaginez l'équilibre parfait si vous appreniez à doser cette intensité avec des moments de calme apaisant !"
  };
  return messages[lowestArchetype as keyof typeof messages] || "";
};

// Fonction pour générer et télécharger le PDF des résultats
const generatePDF = async (
  profileAnalysis: ProfileAnalysis, 
  scores: ArchetypeScore, 
  userData?: { firstName: string; lastName: string; email: string }
) => {
  try {
    // Masquer temporairement la section Actions pour la capture
    const actionsSection = document.querySelector('[data-actions-section]') as HTMLElement;
    if (actionsSection) {
      actionsSection.style.display = 'none';
    }

    // Capturer la page de résultats (sans les boutons)
    const element = document.querySelector('.container.mx-auto.px-4.py-12') as HTMLElement;
    if (!element) {
      throw new Error('Impossible de trouver le contenu à capturer');
    }

    const canvas = await html2canvas(element, {
      scale: 2, // Haute qualité
      useCORS: true,
      backgroundColor: null,
      width: element.offsetWidth,
      height: element.offsetHeight,
      scrollX: 0,
      scrollY: 0,
    });

    // Remettre la section Actions
    if (actionsSection) {
      actionsSection.style.display = '';
    }

    const imgData = canvas.toDataURL('image/png');

    // Créer le PDF avec format A4
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    
    // Marges
    const margin = 15;
    const contentWidth = pdfWidth - (2 * margin);
    
    // Calculer les dimensions de l'image
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    
    // Adapter l'image au format PDF
    let scaledWidth = contentWidth;
    let scaledHeight = scaledWidth / ratio;
    
    // Si l'image est trop haute, l'adapter
    const maxHeight = pdfHeight - (2 * margin) - 40; // 40mm pour l'en-tête et pied de page
    if (scaledHeight > maxHeight) {
      scaledHeight = maxHeight;
      scaledWidth = scaledHeight * ratio;
    }

    // ===== EN-TÊTE =====
    pdf.setFontSize(16);
    pdf.setTextColor(51, 51, 102);
    pdf.text('LA FABRIQUE PEPPS', pdfWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setTextColor(102, 102, 153);
    pdf.text('Résultats du Quiz des Super-Pouvoirs de Communicant(e)', pdfWidth / 2, 28, { align: 'center' });

    // Ligne de séparation
    pdf.setDrawColor(51, 51, 102);
    pdf.setLineWidth(0.5);
    pdf.line(margin, 32, pdfWidth - margin, 32);

    // ===== INFORMATIONS UTILISATEUR =====
    if (userData) {
      pdf.setFontSize(11);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Participant(e) : ${userData.firstName} ${userData.lastName}`, margin, 40);
      pdf.text(`Email : ${userData.email}`, margin, 45);
      pdf.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, pdfWidth - margin, 40, { align: 'right' });
    } else {
      pdf.setFontSize(11);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, pdfWidth - margin, 40, { align: 'right' });
    }

    // ===== CONTENU PRINCIPAL (IMAGE) =====
    const yPosition = userData ? 55 : 50;
    
    // Centrer l'image horizontalement
    const imgX = (pdfWidth - scaledWidth) / 2;
    
    // Si l'image dépasse une page, la diviser
    if (scaledHeight > pdfHeight - yPosition - 20) {
      // Première page
      const firstPageHeight = pdfHeight - yPosition - 20;
      const cropRatio = firstPageHeight / scaledHeight;
      const cropPixelHeight = imgHeight * cropRatio;
      
      // Créer une image tronquée pour la première page
      const firstCanvas = document.createElement('canvas');
      const firstCtx = firstCanvas.getContext('2d');
      firstCanvas.width = imgWidth;
      firstCanvas.height = cropPixelHeight;
      
      const img = new Image();
      img.onload = () => {
        if (firstCtx) {
          firstCtx.drawImage(img, 0, 0, imgWidth, cropPixelHeight, 0, 0, imgWidth, cropPixelHeight);
          const firstImgData = firstCanvas.toDataURL('image/png');
          
          pdf.addImage(firstImgData, 'PNG', imgX, yPosition, scaledWidth, firstPageHeight);
          
          // Pied de page première page
          addFooter(pdf, pdfWidth, pdfHeight, margin, 1);
          
          // Nouvelle page pour le reste
          pdf.addPage();
          
          // En-tête deuxième page
          pdf.setFontSize(12);
          pdf.setTextColor(51, 51, 102);
          pdf.text('LA FABRIQUE PEPPS - Suite des résultats', pdfWidth / 2, 20, { align: 'center' });
          pdf.line(margin, 25, pdfWidth - margin, 25);
          
          // Reste de l'image
          const secondCanvas = document.createElement('canvas');
          const secondCtx = secondCanvas.getContext('2d');
          secondCanvas.width = imgWidth;
          secondCanvas.height = imgHeight - cropPixelHeight;
          
          if (secondCtx) {
            secondCtx.drawImage(img, 0, cropPixelHeight, imgWidth, imgHeight - cropPixelHeight, 0, 0, imgWidth, imgHeight - cropPixelHeight);
            const secondImgData = secondCanvas.toDataURL('image/png');
            
            const remainingHeight = scaledHeight - firstPageHeight;
            pdf.addImage(secondImgData, 'PNG', imgX, 35, scaledWidth, remainingHeight);
            
            // Pied de page deuxième page
            addFooter(pdf, pdfWidth, pdfHeight, margin, 2);
          }
          
          // Télécharger le PDF
          const fileName = userData 
            ? `quiz-pepps-${userData.firstName}-${userData.lastName}.pdf`
            : 'quiz-pepps-resultats.pdf';
          
          pdf.save(fileName);
        }
      };
      img.src = imgData;
    } else {
      // L'image tient sur une page
      pdf.addImage(imgData, 'PNG', imgX, yPosition, scaledWidth, scaledHeight);
      
      // Pied de page
      addFooter(pdf, pdfWidth, pdfHeight, margin, 1);
      
      // Télécharger le PDF
      const fileName = userData 
        ? `quiz-pepps-${userData.firstName}-${userData.lastName}.pdf`
        : 'quiz-pepps-resultats.pdf';
      
      pdf.save(fileName);
    }

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
  }
};

// Fonction pour ajouter un pied de page professionnel
const addFooter = (pdf: jsPDF, pdfWidth: number, pdfHeight: number, margin: number, pageNumber: number) => {
  const footerY = pdfHeight - 15;
  
  // Ligne de séparation
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(margin, footerY - 5, pdfWidth - margin, footerY - 5);
  
  // Texte du pied de page
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.text('La Fabrique PEPPS - Quiz des Super-Pouvoirs de Communicant(e)', margin, footerY);
  pdf.text(`Page ${pageNumber}`, pdfWidth - margin, footerY, { align: 'right' });
};

export default function Results() {
  const navigate = useNavigate();
  const [scores, setScores] = useState<ArchetypeScore>({ athena: 0, orphee: 0, cassandre: 0, hestia: 0 });
  const [profileAnalysis, setProfileAnalysis] = useState<ProfileAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const calculateResults = () => {
      // Récupérer les réponses depuis le localStorage
      const savedAnswers = localStorage.getItem('quizAnswers');
      let answers: number[] = [];
      
      if (savedAnswers) {
        answers = JSON.parse(savedAnswers);
      } else {
        // Génération d'exemple si pas de réponses sauvegardées
        answers = Array.from({ length: 24 }, () => Math.floor(Math.random() * 5) + 1);
      }
      
      const calculatedScores = calculateScores(answers);
      const analysis = analyzeProfile(calculatedScores);
      
      setScores(calculatedScores);
      setProfileAnalysis(analysis);
      setIsLoading(false);
    };

    // Délai pour simuler le calcul
    setTimeout(calculateResults, 1500);
  }, []);

  if (isLoading || !profileAnalysis) {
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
                Nous analysons vos réponses pour révéler votre profil unique.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const primaryData = archetypesData[profileAnalysis.primary];
  const secondaryData = profileAnalysis.secondary ? archetypesData[profileAnalysis.secondary] : null;
  const growthData = archetypesData[profileAnalysis.lowestScore];
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  const getProfileTitle = () => {
    switch (profileAnalysis.type) {
      case 'dominant':
        return `Votre Profil : ${primaryData.name}`;
      case 'combine':
        return `Votre Profil Combiné : ${primaryData.name} & ${secondaryData?.name}`;
      case 'nuance':
        return `Votre Profil Nuancé : ${primaryData.name}`;
      default:
        return `Votre Profil : ${primaryData.name}`;
    }
  };

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
        {/* Titre Principal */}
        <section className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-primary">
              {getProfileTitle()}
            </h1>
            <Crown className="w-8 h-8 text-accent" />
          </div>
        </section>

        {/* Profil Principal */}
        <section className="max-w-6xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-cloud-white via-cloud-white/95 to-muted/20 border-accent/30 shadow-divine">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl font-poppins font-bold text-primary mb-2">
                    {primaryData.name}
                  </h2>
                  <p className="text-lg text-secondary font-cinzel italic mb-4">
                    {primaryData.subtitle}
                  </p>
                  <h3 className="text-xl font-poppins font-semibold text-primary mb-4">
                    {primaryData.title}
                  </h3>
                </div>
                
                <p className="text-base text-primary/80 font-lato leading-relaxed">
                  {primaryData.description}
                </p>
              </div>
              
              <div className="flex justify-center lg:justify-end">
                <div className="relative">
                  <img 
                    src={primaryData.image}
                    alt={`Archétype ${primaryData.name}`}
                    className="w-64 h-80 object-cover rounded-2xl shadow-mythical"
                  />
                  <div className="absolute -top-4 -right-4 bg-accent text-primary p-3 rounded-full shadow-lg">
                    <Crown className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Profil Secondaire (si applicable) */}
        {secondaryData && (
          <section className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-cinzel font-bold text-primary text-center mb-8">
              {profileAnalysis.type === 'combine' ? 'Votre Second Profil Dominant' : 'Votre Nuance Secondaire'}
            </h3>
            <Card className="p-6 bg-gradient-to-br from-muted/20 to-cloud-white border-secondary/30 shadow-mythical">
              <div className="grid lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-xl font-poppins font-bold text-primary mb-2">
                      {secondaryData.name} - {secondaryData.subtitle}
                    </h4>
                    <p className="text-lg font-poppins font-semibold text-primary/90 mb-3">
                      {secondaryData.title}
                    </p>
                  </div>
                  <p className="text-sm text-primary/80 font-lato leading-relaxed">
                    {secondaryData.description}
                  </p>
                </div>
                <div className="flex justify-center">
                  <img 
                    src={secondaryData.image}
                    alt={`Archétype ${secondaryData.name}`}
                    className="w-32 h-40 object-cover rounded-xl shadow-lg"
                  />
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Déclics PEPPS */}
        <section className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-cinzel font-bold text-primary text-center mb-8">
            Tes déclics PEPPS pour briller
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {primaryData.declics.map((declic, index) => (
              <Card key={index} className="p-6 bg-accent/10 border-accent/30 hover:shadow-mythical transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-accent" />
                    <h4 className="font-poppins font-semibold text-primary">
                      {declic.title}
                    </h4>
                  </div>
                  <p className="font-lato text-primary/90 leading-relaxed">
                    {declic.content}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Déclic de Croissance */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="w-6 h-6 text-secondary" />
              <h3 className="text-2xl font-cinzel font-bold text-primary">
                Votre "Déclic de Croissance"
              </h3>
              <Target className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-lg text-primary/80 font-lato">
              Votre score le plus faible n'est pas une faiblesse, c'est votre plus belle opportunité d'évolution !
            </p>
          </div>
          
          <Card className="p-6 bg-gradient-to-br from-secondary/10 to-accent/5 border-secondary/30">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="text-center">
                <img 
                  src={growthData.image}
                  alt={growthData.name}
                  className="w-24 h-24 mx-auto rounded-full object-cover shadow-lg mb-3"
                />
                <h4 className="font-poppins font-bold text-primary mb-1">
                  {growthData.name}
                </h4>
                <p className="text-sm text-secondary font-cinzel">
                  {growthData.subtitle}
                </p>
              </div>
              <div className="md:col-span-2 space-y-4">
                <h5 className="font-poppins font-semibold text-primary text-lg">
                  Votre opportunité de croissance :
                </h5>
                <p className="font-lato text-primary/90 leading-relaxed">
                  {getGrowthMessage(profileAnalysis.lowestScore)}
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Profil Archétypal Complet */}
        <section className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-cinzel font-bold text-primary text-center mb-8">
            Votre Répartition Complète
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(archetypesData).map(([key, data]) => {
              const percentage = Math.round((scores[key as keyof ArchetypeScore] / totalScore) * 100);
              const score = scores[key as keyof ArchetypeScore];
              const isPrimary = key === profileAnalysis.primary;
              const isSecondary = key === profileAnalysis.secondary;
              const isLowest = key === profileAnalysis.lowestScore;
              
              return (
                <Card 
                  key={key}
                  className={`p-6 transition-all duration-300 ${
                    isPrimary 
                      ? 'bg-gradient-to-br from-accent/20 to-secondary/20 border-accent shadow-divine' 
                      : isSecondary
                      ? 'bg-gradient-to-br from-secondary/10 to-accent/5 border-secondary/50 shadow-mythical'
                      : isLowest
                      ? 'bg-gradient-to-br from-muted/20 to-background border-muted'
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
                      {isPrimary && (
                        <div className="absolute -top-2 -right-2 bg-accent text-primary p-1 rounded-full">
                          <Crown className="w-4 h-4" />
                        </div>
                      )}
                      {isSecondary && (
                        <div className="absolute -top-2 -right-2 bg-secondary text-primary-foreground p-1 rounded-full">
                          <Star className="w-4 h-4" />
                        </div>
                      )}
                      {isLowest && (
                        <div className="absolute -top-2 -right-2 bg-muted text-primary p-1 rounded-full">
                          <Target className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-poppins font-bold text-lg text-primary">
                        {data.name}
                      </h4>
                      <p className="text-sm text-secondary font-cinzel">
                        {data.subtitle}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-primary/20 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            isPrimary 
                              ? 'bg-gradient-golden' 
                              : isSecondary 
                              ? 'bg-secondary' 
                              : 'bg-primary/60'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-lato font-semibold text-primary">
                          {score}/30
                        </span>
                        <span className="font-lato font-semibold text-primary">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <div className="webinar-transition-section">
          {/* Message de transition personnalisé en fonction de l'archétype */}
          <div className="transition-message">
            <h3 id="transition-title"></h3>
            <p id="transition-text"></p>
          </div>
          {/* Card webinaire */}
          <div className="webinar-card">
            <div className="webinar-header">
              <h4>✨ Webinaire Inédit pour Voix Sensibles & Ambitieuses</h4>
              <div className="webinar-badge">VOTRE ACCÈS OFFERT</div>
            </div>
            
            <div className="webinar-content">
              <h5>"Les 3 Déclics PEPPS pour passer de la peur de déranger à la joie d'incarner votre message"</h5>
              
              <div className="webinar-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">🔑</span>
                  <span>Comprendre le sens caché de votre sensibilité. Découvrez pourquoi votre "peur de déranger" n'est pas une faiblesse, mais la conséquence d'un super-pouvoir mal compris.</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">💫</span>
                  <span>Recevoir 3 "Déclics PEPPS" pour en faire votre boussole. Repartez avec des outils concrets et incarnés pour canaliser votre intensité et ne plus jamais la subir.</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🎯</span>
                  <span>Incarner enfin votre juste place, avec calme et impact. Apprenez la méthode pour vous sentir légitime et en sécurité, et faire de votre voix un instrument de connexion puissant.</span>
                </div>
              </div>
              
              <div className="webinar-urgency">
                <p><strong>🗓️ Prochaine session live :</strong> Mardi 7 octobre 2025 à 10h00 (heure de Paris)</p>
                <p>Les places sont limitées pour garantir la qualité des échanges.</p>
              </div>
            </div>
            <div className="webinar-cta">
              <button 
                className="webinar-signup-btn primary-btn"
                onClick={() => window.open('LIEN_INSCRIPTION_ICI', '_blank')}
              >
                <span className="btn-text">Je réserve ma place offerte</span>
                <span className="btn-icon">✨</span>
              </button>
              <p className="webinar-disclaimer">
                Inscription 100% gratuite. Les participants recevront une offre exclusive pour acquérir le livret et un accompagnement personnalisé.
              </p>
            </div>
          </div>
        </div>

        {/* Dialog de confirmation */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-md">
            <DialogHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <PartyPopper className="w-12 h-12 text-accent" />
              </div>
              <DialogTitle className="text-xl font-poppins text-primary leading-relaxed">
                Je te remercie pour ton inscription. Tu vas recevoir dans les prochaines minutes un email de confirmation avec un mot d'accueil. Si tu ne l'as pas dans ta boite de réception, regarde dans tes spams. A Bientôt.
                <br /><br />
                Sandrina
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => {
                  const googleCalendarUrl = "https://www.google.com/calendar/render?action=TEMPLATE&text=Passer+de+la+peur+de+d%C3%A9ranger+%C3%A0+la+joie+de+t%27exprimer&dates=20251007T080000Z/20251007T100000Z&details=Webinaire+exclusif+pour+transformer+votre+sensibilit%C3%A9+en+super-pouvoir+de+communication.+D%C3%A9couvrez+comment+r%C3%A9v%C3%A9ler+votre+potentiel+unique.&location=https://meet.google.com/hnt-uosa-ocf";
                  window.open(googleCalendarUrl, '_blank');
                  setShowConfirmation(false);
                }}
                className="font-poppins font-semibold bg-gradient-divine hover:bg-gradient-golden text-primary-foreground px-8 py-3"
              >
                Parfait !
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Actions */}
        <section data-actions-section className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="font-lato border-primary/50 text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Accueil
            </Button>
            
            <Button
              onClick={() => {
                const userData = localStorage.getItem('quizUserData');
                const parsedUserData = userData ? JSON.parse(userData) : undefined;
                generatePDF(profileAnalysis, scores, parsedUserData);
              }}
              variant="outline"
              className="font-lato border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
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