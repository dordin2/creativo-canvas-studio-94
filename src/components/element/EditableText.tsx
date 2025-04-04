
import { CSSProperties, RefObject, useRef } from "react";
import { DesignElement, useDesignState } from "@/context/DesignContext";
import { getTextStyle } from "@/utils/elementStyles";

interface EditableTextProps {
  element: DesignElement;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  textInputRef: RefObject<HTMLInputElement | HTMLTextAreaElement>;
}

const EditableText = ({ element, isEditing, setIsEditing, textInputRef }: EditableTextProps) => {
  const { updateElement, setActiveElement } = useDesignState();
  const textElementTypes = ['heading', 'subheading', 'paragraph'];
  
  if (!textElementTypes.includes(element.type)) {
    return null;
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateElement(element.id, { content: e.target.value });
  };
  
  const handleTextBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only exit editing mode if Escape key is pressed or if Ctrl+Enter is pressed
    if (e.key === 'Escape' || (e.key === 'Enter' && e.ctrlKey)) {
      e.preventDefault();
      setIsEditing(false);
    }
    // Let Enter key create a new line naturally for all text elements,
    // especially for paragraphs without needing to press Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey && element.type === 'paragraph') {
      e.preventDefault();
      const start = textInputRef.current?.selectionStart || 0;
      const end = textInputRef.current?.selectionEnd || 0;
    
      const currentValue = element.content || '';
      const newValue = currentValue.substring(0, start) + '\n' + currentValue.substring(end);
    
      updateElement(element.id, { content: newValue });
    
      // Update the cursor position to be after the new line
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.selectionStart = start + 1;
          textInputRef.current.selectionEnd = start + 1;
        }
      }, 0);
    }
  };

  const textStyle = getTextStyle(element);

  if (isEditing) {
    if (element.type === 'paragraph') {
      const textareaStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        resize: 'none',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        ...textStyle
      };
      
      return (
        <textarea
          ref={textInputRef as RefObject<HTMLTextAreaElement>}
          value={element.content || ''}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleKeyDown}
          style={textareaStyle}
          autoFocus
        />
      );
    } else {
      const inputStyle: CSSProperties = {
        width: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        ...textStyle
      };
      
      return (
        <input
          ref={textInputRef as RefObject<HTMLInputElement>}
          type="text" 
          value={element.content || ''}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onKeyDown={handleKeyDown}
          style={inputStyle}
          autoFocus
        />
      );
    }
  } else {
    const divStyle: CSSProperties = {
      width: '100%',
      height: '100%',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      ...textStyle
    };
    
    return (
      <div 
        style={divStyle}
        onClick={(e) => {
          e.stopPropagation();
          setActiveElement(element);
        }}
      >
        {element.content}
      </div>
    );
  }
};

export default EditableText;
