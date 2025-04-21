
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState("");
  const [gameCodeLoading, setGameCodeLoading] = useState(false);

  // Redirect if already authenticated
  if (user) {
    navigate("/");
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(email, password, name);
      // Clear fields after sign up
      setEmail("");
      setPassword("");
      setName("");
    } finally {
      setLoading(false);
    }
  };

  // New: Handle "Join Game" with code
  const handleGameCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim()) {
      toast.error("Please enter a code.");
      return;
    }
    setGameCodeLoading(true);
    try {
      // Lookup the project by code
      const { data, error } = await supabase
        .from("projects")
        .select("id")
        .eq("game_code", gameCode.trim())
        .maybeSingle();

      if (error || !data) {
        toast.error("No game found with this code.");
        return;
      }
      navigate(`/play/${data.id}`);
    } catch (err) {
      toast.error("Could not validate code. Try again.");
    } finally {
      setGameCodeLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-canvas-purple mb-2">CreativoCanvas</h1>
          <p className="text-gray-600">Create interactive experiences</p>
        </div>

        {/* Game Mode Join Box */}
        <form onSubmit={handleGameCodeSubmit} className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Play by Game Code</CardTitle>
              <CardDescription>
                Enter your code to jump into a game instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input
                type="text"
                placeholder="Game Code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                className="w-full"
                disabled={gameCodeLoading}
              />
              <Button
                type="submit"
                variant="outline"
                className="bg-canvas-purple/90 text-white whitespace-nowrap"
                disabled={gameCodeLoading}
              >
                {gameCodeLoading ? "Joining..." : "Join"}
              </Button>
            </CardContent>
          </Card>
        </form>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your email and password to access your projects
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-canvas-purple hover:bg-canvas-purple/90"
                    disabled={loading}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Sign up to create and save your own projects
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name (Optional)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-canvas-purple hover:bg-canvas-purple/90"
                    disabled={loading}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
