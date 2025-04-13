
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PayPalButton } from "@/components/PayPalButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard } from "lucide-react";

export default function Payment() {
  const { projectId } = useParams<{ projectId: string }>();
  const [amount, setAmount] = useState(5); // Default payment amount
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePaymentSuccess = async (details: any) => {
    try {
      setIsProcessing(true);
      
      // Store payment details in the database
      const { error } = await supabase.from("payments").insert({
        amount: amount,
        currency: "USD",
        status: "completed",
        payment_id: details.id,
        payment_method: "paypal",
        project_id: projectId,
        user_id: user?.id
      });

      if (error) throw error;
      
      toast.success("Payment successful! Thank you for your support.");
      
      // Navigate back to project
      setTimeout(() => {
        navigate(`/editor/${projectId}`);
      }, 2000);
      
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Payment was processed but we couldn't record it. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment error:", error);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/editor/${projectId}`)}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Project
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Support This Project</h1>
            <p className="text-gray-600 mt-2">Your contribution helps the creator continue their work</p>
          </div>
          
          <div className="mb-6">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold mb-2">Select Amount</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[5, 10, 20, 50].map((value) => (
                  <Badge 
                    key={value}
                    variant={amount === value ? "default" : "outline"}
                    className={`text-lg py-2 px-4 cursor-pointer hover:bg-gray-100 ${
                      amount === value ? "bg-canvas-purple hover:bg-canvas-purple/90" : ""
                    }`}
                    onClick={() => setAmount(value)}
                  >
                    ${value}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="mt-8">
              <p className="text-center mb-4 flex items-center justify-center text-gray-700">
                <CreditCard className="mr-2 h-5 w-5" />
                Secure payment via PayPal
              </p>
              
              <PayPalButton
                amount={amount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
