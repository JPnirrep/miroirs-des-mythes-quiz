import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ArchetypeCardProps {
  name: string;
  image: string;
  description: string;
  className?: string;
  delay?: number;
}

export const ArchetypeCard = ({ name, image, description, className, delay = 0 }: ArchetypeCardProps) => {
  return (
    <Card 
      className={cn(
        "group overflow-hidden border-0 shadow-mythical hover:shadow-divine transition-all duration-500 hover:-translate-y-2 animate-fade-in bg-gradient-to-br from-card to-muted/20",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="aspect-[4/5] overflow-hidden">
        <img 
          src={image} 
          alt={`Archétype ${name}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>
      <div className="p-6 space-y-4">
        <h3 className="font-poppins font-bold text-2xl text-primary group-hover:text-secondary transition-colors duration-300">
          {name}
        </h3>
        <p className="font-lato text-soft-gray leading-relaxed text-sm">
          {description}
        </p>
        <div className="h-1 w-0 group-hover:w-full bg-gradient-golden transition-all duration-500 rounded-full" />
      </div>
    </Card>
  );
};