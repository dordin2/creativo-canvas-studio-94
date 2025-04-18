
import React from "react";
import GameModeToggle from "./GameModeToggle";
import InteractionModeToggle from "./InteractionModeToggle";
import { useDesignState } from "@/context/DesignContext";

const Header = () => {
  const { isGameMode, isInteractionMode } = useDesignState();

  if (isGameMode) return null;

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <InteractionModeToggle />
        <GameModeToggle />
      </div>
      {/* Only show ElementControls if in interaction mode */}
      {isInteractionMode && <div>Interaction Mode Controls</div>}
    </div>
  );
};

export default Header;
