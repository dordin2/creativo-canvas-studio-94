
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, UserCog } from "lucide-react";
import LibraryManager from "@/components/admin/LibraryManager";
import AccountSettings from "@/components/admin/AccountSettings";

const Admin = () => {
  const { user, profile } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      try {
        const { data, error } = await supabase.rpc('get_user_role');
        
        if (error) throw error;
        
        if (data === 'admin') {
          setIsAdmin(true);
        } else {
          // Not an admin, redirect back
          toast.error("Access denied. Admin privileges required.");
          navigate('/');
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Error checking permissions. Please try again.");
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user, navigate]);
  
  const goBack = () => {
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-canvas-purple mb-4">
            CreativoCanvas Admin
          </h1>
          <div className="w-12 h-12 border-4 border-canvas-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={goBack}
            className="mr-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Canvas
          </Button>
          <h1 className="text-xl font-semibold text-canvas-purple">Admin Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Logged in as {profile?.display_name || user?.email}
          </span>
        </div>
      </div>
      
      <div className="container mx-auto py-6 px-4">
        <Tabs defaultValue="library" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="library">Library Elements</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="library" className="bg-white p-6 rounded-lg shadow">
            <LibraryManager />
          </TabsContent>
          
          <TabsContent value="account" className="bg-white p-6 rounded-lg shadow">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
