
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Shield, Key, Mail } from "lucide-react";

const AccountSettings = () => {
  const { user } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState("");
  
  // For changing password
  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    
    try {
      setIsResetting(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password',
      });
      
      if (error) throw error;
      
      toast.success("Password reset link sent to your email.");
    } catch (error: any) {
      console.error("Error sending reset password email:", error);
      toast.error(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Account Settings</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5 text-blue-500" />
              Admin Account
            </CardTitle>
            <CardDescription>
              Manage your admin account settings and security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">User ID:</span>
                <span className="ml-2 text-gray-500">{user?.id}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Email:</span>
                <span className="ml-2 text-gray-500">{user?.email}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Role:</span>
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                  Admin
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5 text-orange-500" />
              Password Management
            </CardTitle>
            <CardDescription>
              Reset your password securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Confirm your email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder={user?.email || "Enter your email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Password Reset Email
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset your password?</AlertDialogTitle>
                  <AlertDialogDescription>
                    We'll send a secure link to your email that will allow you to reset your password. This link will expire after 1 hour for security.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isResetting}
                    onClick={handleResetPassword}
                  >
                    {isResetting ? "Sending..." : "Send Reset Link"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-md">
        <h3 className="text-amber-800 font-medium mb-2 flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Security Information
        </h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
          <li>Password reset links are sent to your verified email address</li>
          <li>For security reasons, reset links expire after 1 hour</li>
          <li>Your new password must be at least 8 characters long</li>
          <li>Use a combination of letters, numbers, and special characters</li>
          <li>Never share your admin credentials with others</li>
        </ul>
      </div>
    </div>
  );
};

export default AccountSettings;
