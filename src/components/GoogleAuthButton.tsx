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
      className="font-lato border-primary/50 text-primary bg-cloud-white/90 backdrop-blur-sm hover:bg-gradient-divine hover:text-primary-foreground hover:border-transparent transition-all duration-300 shadow-mythical hover:shadow-divine animate-fade-in hover:scale-105"
    >
      <LogIn className="w-4 h-4 mr-2" />
      Connexion Google
    </Button>
  );
};