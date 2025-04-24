
import React, { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ElementMenuDialog } from "./ElementMenuDialog";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FloatingAddButtonProps {
  className?: string;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (error) throw error;
        setIsAdmin(!!data);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleOpenDialog = () => {
    if (!user) {
      toast.error("יש להתחבר כדי להוסיף אלמנטים");
      return;
    }
    
    if (!isAdmin) {
      toast.error("רק מנהלים יכולים להוסיף אלמנטים");
      return;
    }
    
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        title="הוסף אלמנט"
        onClick={handleOpenDialog}
        className={cn(
          "fixed z-40 bottom-8 right-8 bg-canvas-purple text-white rounded-full shadow-lg hover:bg-canvas-purple-dark transition-colors duration-200 flex items-center justify-center w-14 h-14 border-4 border-white outline-none focus:ring-2 focus:ring-canvas-purple-dark",
          className
        )}
        aria-label="Add element"
      >
        <Plus size={32} />
      </button>
      <ElementMenuDialog open={open} onOpenChange={setOpen} />
    </>
  );
};

export default FloatingAddButton;
