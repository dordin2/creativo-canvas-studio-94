
import GameModeToggle from "./GameModeToggle";
import InteractionModeToggle from "./InteractionModeToggle";
import ElementControls from "./element/ElementControls";
import { useDesignState } from "@/context/DesignContext";

const Header = () => {
  const { isGameMode } = useDesignState();

  if (isGameMode) return null;

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <InteractionModeToggle />
        <GameModeToggle />
      </div>
      <ElementControls />
    </div>
  );
};

export default Header;
