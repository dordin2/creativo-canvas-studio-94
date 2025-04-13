
import { useState, useEffect, useCallback } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { usePayment } from "@/context/PaymentContext";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type PayPalButtonProps = {
  amount: number;
  projectId: string;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
};

const PayPalButton = ({ amount, projectId, onSuccess, onCancel }: PayPalButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [paypalReady, setPaypalReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const { user } = useAuth();
  const { refreshPaymentStatus } = usePayment();

  // Create PayPal order through our edge function
  const createOrder = async () => {
    if (!user) {
      toast.error("You must be logged in to make a payment");
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("paypal/create-order", {
        body: {
          amount,
          currency: "USD",
          userId: user.id,
          projectId,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to create order");
      }

      return data.id;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      toast.error("Failed to create PayPal order");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Capture the PayPal payment
  const onApprove = async (data: any) => {
    setLoading(true);
    try {
      const { data: captureData, error } = await supabase.functions.invoke("paypal/capture-payment", {
        body: { orderId: data.orderID },
      });

      if (error) {
        throw new Error(error.message || "Failed to capture payment");
      }

      toast.success("Payment completed successfully!");
      
      // Refresh payment status after successful payment
      await refreshPaymentStatus();
      
      if (onSuccess) {
        onSuccess(captureData);
      }
      return captureData;
    } catch (error) {
      console.error("Error capturing PayPal payment:", error);
      toast.error("Failed to complete payment");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    toast.info("Payment cancelled");
    if (onCancel) {
      onCancel();
    }
  };

  // Script related event handlers
  const handleScriptLoad = useCallback(() => {
    console.log("PayPal script loaded successfully");
    setPaypalReady(true);
    setSdkError(null);
  }, []);

  const handleScriptError = useCallback((err: Error) => {
    console.error("PayPal script error:", err);
    setSdkError("PayPal payment system is currently unavailable");
    setPaypalReady(false);
  }, []);

  return (
    <div className="w-full">
      {sdkError ? (
        <div className="text-center py-4">
          <p className="text-red-500 mb-2">{sdkError}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      ) : (
        <PayPalScriptProvider
          options={{
            clientId: "sb", // Special value for sandbox mode
            currency: "USD",
            intent: "capture",
            components: "buttons",
            dataClientToken: "sandbox_cgv4ktcg_wvrh4jwcqbh9p6kn",
          }}
        >
          <div id="paypal-button-container">
            {loading ? (
              <Button disabled className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </Button>
            ) : (
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={createOrder}
                onApprove={onApprove}
                onCancel={handleCancel}
                onError={(err) => {
                  console.error("PayPal error:", err);
                  toast.error("PayPal error occurred");
                }}
                disabled={loading}
                onInit={() => setPaypalReady(true)}
              />
            )}
          </div>
        </PayPalScriptProvider>
      )}
      
      {/* Sandbox testing note */}
      <div className="mt-3 text-xs text-gray-500 border-t pt-2">
        <p>This is running in PayPal Sandbox mode for testing</p>
      </div>
    </div>
  );
};

export default PayPalButton;
