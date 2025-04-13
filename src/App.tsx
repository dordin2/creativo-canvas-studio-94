
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { DesignProvider } from "@/context/DesignContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { AuthProvider } from "@/context/AuthContext";
import { PaymentProvider } from "@/context/PaymentContext";
import Projects from "./pages/Projects";
import Editor from "./pages/Editor";
import Play from "./pages/Play";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <PaymentProvider>
              <Routes>
                <Route path="/" element={<Projects />} />
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/editor/:projectId" 
                  element={
                    <ProtectedRoute>
                      <ProjectProvider>
                        <DesignProvider>
                          <Editor />
                        </DesignProvider>
                      </ProjectProvider>
                    </ProtectedRoute>
                  } 
                />
                <Route path="/play/:projectId" element={<Play />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PaymentProvider>
          </AuthProvider>
        </TooltipProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
