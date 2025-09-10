import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, LogOut, User } from "lucide-react";

export const GoogleAuthButton = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <Button 
        variant="outline" 
        disabled 
        className="font-lato border-primary/30 text-primary bg-cloud-white/80 backdrop-blur-sm shadow-mythical"
      >
        <User className="w-4 h-4 mr-2" />
        Chargement...
      </Button>
    );
  }

  if (user) {
    return (
      <Button 
        onClick={signOut} 
        variant="outline" 
        className="font-lato border-primary/50 text-primary bg-cloud-white/90 backdrop-blur-sm hover:bg-gradient-divine hover:text-primary-foreground hover:border-transparent transition-all duration-300 shadow-mythical hover:shadow-divine animate-fade-in"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Se déconnecter
      </Button>
    );
  }

  return (
    <Button 
      onClick={signInWithGoogle}
      variant="outline"
      className="group relative font-lato font-semibold text-primary border-2 border-primary/30 bg-gradient-to-r from-cloud-white/95 to-cloud-white/85 backdrop-blur-sm hover:border-transparent hover:from-indigo-deep hover:to-sky-blue hover:text-cloud-white transition-all duration-500 shadow-mythical hover:shadow-divine hover:shadow-xl transform hover:scale-105 animate-fade-in overflow-hidden"
    >
      {/* Effet de lueur doré au survol */}
      <div className="absolute inset-0 bg-gradient-golden opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
      
      {/* Icône et texte */}
      <div className="relative flex items-center">
        <LogIn className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
        <span className="relative">
          Connexion Google
          {/* Effet de brillance sur le texte */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-solar-yellow/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </span>
      </div>
      
      {/* Particules de lumière */}
      <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-solar-yellow rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 delay-100" />
      <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-sky-blue rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 delay-200" />
    </Button>
  );
};