
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PaymentButtonProps {
  projectId: string | null;
}

export function PaymentButton({ projectId }: PaymentButtonProps) {
  const navigate = useNavigate();

  if (!projectId) return null;

  const handleClick = () => {
    navigate(`/payment/${projectId}`);
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="bg-white hover:bg-gray-50 flex items-center"
    >
      <Heart className="mr-2 h-4 w-4 text-red-500" />
      Support Project
    </Button>
  );
}
