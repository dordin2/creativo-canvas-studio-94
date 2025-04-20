import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { DesignProvider } from "@/context/DesignContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { AuthProvider } from "@/context/AuthContext";
import { InteractiveModeProvider } from "@/context/InteractiveModeContext";
import { MobileProvider } from './context/MobileContext';
import Projects from "./pages/Projects";
import Editor from "./pages/Editor";
import Play from "./pages/Play";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Payment from "./pages/Payment";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  return (
    <MobileProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <AuthProvider>
                      <Projects />
                    </AuthProvider>
                  } 
                />
                <Route 
                  path="/auth" 
                  element={
                    <AuthProvider>
                      <Auth />
                    </AuthProvider>
                  } 
                />
                <Route 
                  path="/editor/:projectId" 
                  element={
                    <AuthProvider>
                      <ProtectedRoute>
                        <InteractiveModeProvider>
                          <DesignProvider>
                            <ProjectProvider>
                              <Editor />
                            </ProjectProvider>
                          </DesignProvider>
                        </InteractiveModeProvider>
                      </ProtectedRoute>
                    </AuthProvider>
                  } 
                />
                <Route 
                  path="/play/:projectId" 
                  element={
                    <AuthProvider>
                      <Play />
                    </AuthProvider>
                  } 
                />
                <Route 
                  path="/payment/:projectId" 
                  element={
                    <AuthProvider>
                      <ProtectedRoute>
                        <Payment />
                      </ProtectedRoute>
                    </AuthProvider>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </LanguageProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </MobileProvider>
  );
};

export default App;
