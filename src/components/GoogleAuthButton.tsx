import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, LogOut, User } from "lucide-react";

export const GoogleAuthButton = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <Button variant="outline" disabled className="font-lato">
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
        className="font-lato border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
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
      className="font-lato border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
    >
      <LogIn className="w-4 h-4 mr-2" />
      Connexion Google
    </Button>
  );
};