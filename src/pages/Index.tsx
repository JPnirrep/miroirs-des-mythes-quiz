import { ArchetypeCard } from "@/components/ArchetypeCard";
import { CaptureForm } from "@/components/CaptureForm";
import { GoogleSheetsTester } from "@/components/GoogleSheetsTester";
import athenaImage from "@/assets/athena.jpg";
import orpheeImage from "@/assets/orphee.jpg";
import cassandreImage from "@/assets/cassandre.jpg";
import hestiaImage from "@/assets/hestia.jpg";

const Index = () => {
  const archetypes = [
    {
      name: "Athéna",
      image: athenaImage,
      description: "L'Archétype de la Stratège Sage. Athéna incarne la sagesse stratégique, l'intelligence pratique et la capacité à voir au-delà des apparences. Elle guide ceux qui cherchent à comprendre les enjeux complexes et à agir avec discernement."
    },
    {
      name: "Orphée", 
      image: orpheeImage,
      description: "L'Archétype de l'Artiste Visionnaire. Orphée représente la créativité transformatrice, la capacité à toucher les âmes et à révéler la beauté cachée du monde. Il inspire ceux qui utilisent leur art pour guérir et élever."
    },
    {
      name: "Cassandre",
      image: cassandreImage, 
      description: "L'Archétype de la Visionnaire Incomprise. Cassandre symbolise l'intuition profonde, la capacité à percevoir les vérités cachées et le courage de les exprimer malgré l'incompréhension. Elle guide les précurseurs et les éveilleurs de conscience."
    },
    {
      name: "Hestia",
      image: hestiaImage,
      description: "L'Archétype de la Gardienne du Foyer. Hestia incarne la stabilité bienveillante, la capacité à créer des espaces sacrés et à nourrir la croissance des autres. Elle inspire ceux qui construisent et préservent l'harmonie."
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

      {/* Dev/Test: visible avec ?test=1 */}
      <GoogleSheetsTester />

      {/* Hero Section */}
      <section className="container mx-auto px-4 text-center mb-16">
        <h1 className="font-poppins font-bold text-5xl md:text-6xl text-primary mb-6 animate-fade-in">
          Découvrez les 4 Archétypes
        </h1>
        <p className="font-lato text-xl text-soft-gray max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "200ms" }}>
          Plongez dans l'univers fascinant de la mythologie grecque et découvrez quel archétype guide votre destinée. 
          Chaque archétype révèle une facette unique de votre personnalité et de votre potentiel.
        </p>
      </section>

      {/* Cartes des Archétypes */}
      <section className="container mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {archetypes.map((archetype, index) => (
            <ArchetypeCard
              key={archetype.name}
              name={archetype.name}
              image={archetype.image}
              description={archetype.description}
              delay={index * 150}
            />
          ))}
        </div>
      </section>

      {/* Section de Capture */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <CaptureForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-lato">
            © 2024 La Fabrique PEPPS - Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
