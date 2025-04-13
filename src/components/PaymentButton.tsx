import { Button } from "@/components/ui/button";
import { Heart, UserCheck, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentButtonProps {
  projectId: string | null;
  currency?: string;
}

export function PaymentButton({ projectId, currency = "USD" }: PaymentButtonProps) {
  const navigate = useNavigate();
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
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .limit(1);

        if (error) throw error;
        
        setIsPro(data && data.length > 0);
      } catch (error) {
        console.error("Error checking user status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserPayments();
  }, [user]);

  if (!projectId) return null;
  if (isLoading) return null;

  const handleClick = () => {
    navigate(`/payment/${projectId}?currency=${currency}`);
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="bg-white hover:bg-gray-50 flex items-center"
    >
      {user ? (
        <>
          {isPro ? (
            <UserCheck className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <User className="mr-2 h-4 w-4 text-gray-500" />
          )}
        </>
      ) : (
        <Heart className="mr-2 h-4 w-4 text-red-500" />
      )}
      {user ? (isPro ? "Pro" : "") : "Support Project"}
    </Button>
  );
}
