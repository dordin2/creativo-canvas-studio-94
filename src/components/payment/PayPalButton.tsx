
import { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
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
  const [orderId, setOrderId] = useState<string | null>(null);
  const { user } = useAuth();

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

      setOrderId(data.id);
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

  return (
    <div className="w-full">
      <PayPalScriptProvider
        options={{
          clientId: "sb", // "sb" is a special value for sandbox mode, PayPal will replace it with the correct value
          currency: "USD",
          intent: "capture",
        }}
      >
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
          />
        )}
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalButton;
