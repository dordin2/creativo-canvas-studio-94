
import { useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

/**
 * A hook to navigate between Play and Editor modes using the correct routes.
 */
export function useGameModeNavigation() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();

  const goToPlayMode = useCallback(() => {
    if (projectId) {
      navigate(`/play/${projectId}`);
    }
  }, [navigate, projectId]);

  const goToEditor = useCallback(() => {
    if (projectId) {
      navigate(`/editor/${projectId}`);
    }
  }, [navigate, projectId]);

  // הוא במצב Game אם הנתיב כולל '/play/'
  const isInGameModeRoute = location.pathname.startsWith("/play/");

  return { goToPlayMode, goToEditor, isInGameModeRoute };
}
