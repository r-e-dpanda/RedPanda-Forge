import React, { useState, forwardRef, useImperativeHandle, useRef } from "react";
import KonvaEditor, { EditorRef as KonvaEditorRef } from "../editor/KonvaEditor";
import RightPanel from "../panels/RightPanel";

export interface EditorRef {
  exportPNG: () => void;
}

const EditorWorkspace = forwardRef<EditorRef, any>((props, ref) => {
  const [rightExpanded, setRightExpanded] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'match' | 'editor'>('match');
  const innerEditorRef = useRef<KonvaEditorRef>(null);

  useImperativeHandle(ref, () => ({
    exportPNG: () => {
      if (innerEditorRef.current) {
        innerEditorRef.current.exportPNG();
      }
    }
  }));

  return (
    <div className="flex-1 flex overflow-hidden">
      <KonvaEditor 
        ref={innerEditorRef} 
        rightExpanded={rightExpanded} 
        setRightExpanded={setRightExpanded} 
        setActiveRightTab={setActiveRightTab} 
      />
      <RightPanel 
        rightExpanded={rightExpanded}
        setRightExpanded={setRightExpanded}
        activeRightTab={activeRightTab}
        setActiveRightTab={setActiveRightTab}
      />
    </div>
  );
});

export default EditorWorkspace;
