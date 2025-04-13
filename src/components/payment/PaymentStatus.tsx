
import { usePayment } from "@/context/PaymentContext";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock } from "lucide-react";

type PaymentStatusProps = {
  className?: string;
  showFree?: boolean;
};

const PaymentStatus = ({ className, showFree = true }: PaymentStatusProps) => {
  const { paymentStatus, isLoading } = usePayment();
  
  if (isLoading) {
    return (
      <Badge className={`bg-gray-200 text-gray-700 ${className}`}>
        <Clock className="h-3 w-3 mr-1 animate-pulse" />
        Loading...
      </Badge>
    );
  }
  
  if (paymentStatus === "pro") {
    return (
      <Badge className={`bg-amber-500 hover:bg-amber-600 ${className}`}>
        <Sparkles className="h-3 w-3 mr-1" />
        Premium
      </Badge>
    );
  }
  
  return showFree ? (
    <Badge className={`bg-gray-200 text-gray-700 ${className}`}>
      Free
    </Badge>
  ) : null;
};

export default PaymentStatus;
