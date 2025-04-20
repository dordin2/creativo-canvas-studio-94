
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function UserStatus() {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkUserPayments = async () => {
      try {
        // Check if user has any completed payments
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .limit(1);

        if (error) throw error;
        
        // User is pro if they have at least one completed payment
        setIsPro(data && data.length > 0);
      } catch (error) {
        console.error("Error checking user status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserPayments();
  }, [user]);

  if (!user || isLoading) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {isPro ? (
              <Badge variant="default" className="bg-gradient-to-r from-canvas-purple to-canvas-indigo flex gap-1 items-center">
                <UserCheck className="h-3 w-3" />
                Pro
              </Badge>
            ) : (
              <Badge variant="outline" className="flex gap-1 items-center">
                Regular
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isPro ? "Thank you for supporting!" : "Support this project to become Pro"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
