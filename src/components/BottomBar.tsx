
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useDesignState } from "@/context/DesignContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Square,
  Circle,
  Triangle,
  Image,
  Text,
  Lock,
  Puzzle,
  SlidersHorizontal,
  MousePointerClick,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LibraryModal } from "@/components/library/LibraryModal";

const BottomBar = () => {
  const { addElement } = useDesignState();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-t-lg rounded-b-none border-t border-x"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-4 max-h-[40vh] overflow-y-auto">
          {/* Basic Shapes */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">{t('sidebar.shapes')}</h3>
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => addElement('rectangle')}>
                <Square className="h-6 w-6" />
                <span className="text-xs">{t('sidebar.rectangle')}</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => addElement('circle')}>
                <Circle className="h-6 w-6" />
                <span className="text-xs">{t('sidebar.circle')}</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => addElement('triangle')}>
                <Triangle className="h-6 w-6" />
                <span className="text-xs">{t('sidebar.triangle')}</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => addElement('textElement')}>
                <Text className="h-6 w-6" />
                <span className="text-xs">{t('sidebar.text')}</span>
              </Button>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">{t('sidebar.media')}</h3>
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => addElement('image')}>
                <Image className="h-6 w-6" />
                <span className="text-xs">{t('sidebar.image')}</span>
              </Button>
              <LibraryModal />
            </div>
          </div>

          {/* Interactive Elements */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">{t('sidebar.interactive')}</h3>
            <div className="grid grid-cols-4 gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Lock className="h-6 w-6" />
                    <span className="text-xs">{t('sidebar.puzzles')}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <div className="grid grid-cols-2 gap-4 p-4">
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col gap-2 p-4"
                      onClick={() => addElement('puzzle', {
                        puzzleConfig: {
                          name: t('sidebar.imagePuzzle'),
                          type: 'image',
                          placeholders: 3,
                          images: [],
                          solution: [0, 0, 0]
                        }
                      })}
                    >
                      <Puzzle className="h-8 w-8" />
                      <span>{t('sidebar.imagePuzzle')}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col gap-2 p-4"
                      onClick={() => addElement('sequencePuzzle', {
                        name: t('sidebar.sequencePuzzle'),
                        sequencePuzzleConfig: {
                          name: t('sidebar.sequencePuzzle'),
                          images: [],
                          solution: [],
                          currentOrder: []
                        }
                      })}
                    >
                      <MousePointerClick className="h-8 w-8" />
                      <span>{t('sidebar.sequencePuzzle')}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex flex-col gap-2 p-4"
                      onClick={() => addElement('sliderPuzzle', {
                        name: t('sidebar.sliderPuzzle'),
                        sliderPuzzleConfig: {
                          name: t('sidebar.sliderPuzzle'),
                          orientation: 'horizontal',
                          sliderCount: 3,
                          solution: [5, 7, 3],
                          currentValues: [0, 0, 0],
                          maxValue: 10
                        }
                      })}
                    >
                      <SlidersHorizontal className="h-8 w-8" />
                      <span>{t('sidebar.sliderPuzzle')}</span>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomBar;
