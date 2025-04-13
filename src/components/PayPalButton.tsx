
import { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PayPalButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  onError?: (error: any) => void;
  currency?: string;
  disabled?: boolean;
  mode?: "sandbox" | "production";
}

export function PayPalButton({
  amount,
  onSuccess,
  onError,
  currency = "USD",
  disabled = false,
  mode = "production"
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paypalClientId, setPaypalClientId] = useState<string>("");

  useEffect(() => {
    const fetchPayPalClientId = async () => {
      try {
        // For production use, you should store this securely
        // Here we're using the configuration from your Supabase project
        // This is a placeholder - replace with your actual client ID from PayPal
        const clientId = "YOUR_PAYPAL_CLIENT_ID";
        
        if (!clientId || clientId === "YOUR_PAYPAL_CLIENT_ID") {
          console.error("Missing PayPal Client ID! Please configure a valid client ID.");
          toast.error("Payment configuration error. Please contact support.");
          return;
        }
        
        setPaypalClientId(clientId);
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("Payment system is currently unavailable.");
      }
    };

    fetchPayPalClientId();
  }, []);

  if (!paypalClientId) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
        Payment system is currently unavailable. Please try again later.
      </div>
    );
  }

  return (
    <div className="w-full">
      <PayPalScriptProvider 
        options={{ 
          clientId: paypalClientId,
          currency: currency,
          intent: "capture",
          components: "buttons",
          "debug": mode === "sandbox"
        }}
      >
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        
        <PayPalButtons
          disabled={disabled}
          forceReRender={[amount, currency, paypalClientId]}
          createOrder={(data, actions) => {
            return actions.order.create({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    value: amount.toString(),
                    currency_code: currency
                  }
                }
              ]
            });
          }}
          onApprove={(data, actions) => {
            setIsLoading(true);
            return actions.order.capture().then((details) => {
              setIsLoading(false);
              onSuccess(details);
            });
          }}
          onError={(err) => {
            setIsLoading(false);
            console.error("PayPal payment failed:", err);
            toast.error("Payment failed. Please try again or use a different payment method.");
            if (onError) onError(err);
          }}
          onCancel={() => {
            setIsLoading(false);
            toast.info("Payment cancelled");
          }}
          style={{ layout: "vertical" }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
