
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type PaymentStatus = "free" | "pro";

type PaymentContextType = {
  paymentStatus: PaymentStatus;
  isLoading: boolean;
  refreshPaymentStatus: () => Promise<void>;
  hasProjectPaid: (projectId: string) => Promise<boolean>;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("free");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const refreshPaymentStatus = async () => {
    if (!user) {
      setPaymentStatus("free");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if user has any successful payments
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // If user has any completed payments, they're a pro user
      if (payments && payments.length > 0) {
        setPaymentStatus("pro");
      } else {
        setPaymentStatus("free");
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
      // Default to free if there's an error
      setPaymentStatus("free");
    } finally {
      setIsLoading(false);
    }
  };
  
  const hasProjectPaid = async (projectId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if there's a successful payment for this specific project
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .eq('status', 'completed')
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking project payment status:', error);
      return false;
    }
  };
  
  // Load payment status on mount or when user changes
  useEffect(() => {
    refreshPaymentStatus();
  }, [user]);
  
  const value = {
    paymentStatus,
    isLoading,
    refreshPaymentStatus,
    hasProjectPaid
  };
  
  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  
  return context;
};
