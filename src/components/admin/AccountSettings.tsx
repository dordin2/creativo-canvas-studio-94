
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { KeyRound, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const AccountSettings = () => {
  const { user, profile } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Handle password change
  const handlePasswordChange = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match.");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    
    try {
      setLoading(true);
      
      // First verify the current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: currentPassword,
      });
      
      if (signInError) {
        toast.error("Current password is incorrect.");
        throw signInError;
      }
      
      // Then update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) throw updateError;
      
      toast.success("Password changed successfully.");
      
      // Reset the form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password reset via email
  const handlePasswordResetEmail = async () => {
    if (!user || !user.email) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      setResetEmailSent(true);
      toast.success("Password reset link sent to your email.");
      
    } catch (error) {
      console.error("Error sending password reset email:", error);
      toast.error("Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Account Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-amber-500" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and password settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-1">Change Password</h3>
              <p className="text-sm text-gray-500 mb-4">
                Update your password to maintain account security
              </p>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <KeyRound className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Your Password</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>Password requirements:</p>
                      <ul className="list-disc ml-5 mt-1">
                        <li>At least 8 characters long</li>
                        <li>Include a mix of letters, numbers and symbols for best security</li>
                      </ul>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button 
                      onClick={handlePasswordChange} 
                      disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    >
                      {loading ? "Changing..." : "Change Password"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-1">Forgot Password</h3>
              <p className="text-sm text-gray-500 mb-4">
                Request a password reset link via email
              </p>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reset Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                  </DialogHeader>
                  
                  {resetEmailSent ? (
                    <div className="py-6 text-center">
                      <Mail className="h-12 w-12 mx-auto text-primary mb-4" />
                      <h3 className="text-lg font-medium mb-2">Email Sent</h3>
                      <p className="text-gray-500 mb-4">
                        A password reset link has been sent to your email address: <br />
                        <span className="font-medium">{user?.email}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Check your inbox and follow the instructions to reset your password.
                      </p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <p className="mb-4">
                        We'll send a secure password reset link to your email address:
                        <br />
                        <span className="font-medium">{user?.email}</span>
                      </p>
                      
                      <div className="text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-md p-3">
                        <p className="font-medium text-amber-700 mb-1">Security Note:</p>
                        <p>
                          The link will expire in 24 hours and can only be used once.
                          For security reasons, we recommend not sharing this email with anyone.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                    </DialogClose>
                    {!resetEmailSent && (
                      <Button 
                        onClick={handlePasswordResetEmail} 
                        disabled={loading}
                      >
                        {loading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Display Name</span>
              <span className="font-medium">{profile?.display_name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className="font-medium">Admin</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account Created</span>
              <span className="font-medium">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString() 
                  : 'Unknown'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
