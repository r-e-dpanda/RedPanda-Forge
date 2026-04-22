import React, { forwardRef, useState, useRef, useImperativeHandle } from "react";
import KonvaEditor from "./KonvaEditor";
import RightPanel from "../panels/RightPanel";
import { useEditorStore } from "../../stores/editorStore";
import { useTranslation } from "../../lib/i18n";
import { 
  Undo2, Redo2, Download, Image as ImageIcon, Code, FileText, View, LayoutTemplate
} from "lucide-react";
import { cn } from "../../lib/utils";

const EditorWorkspace = forwardRef((props, ref) => {
  const [rightExpanded, setRightExpanded] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'data' | 'design'>('data');
  const konvaRef = useRef<any>(null);
  const [exportOpen, setExportOpen] = useState(false);
  
  const { t } = useTranslation();
  const { 
    sessions, 
    activeSessionId, 
    setActiveSession, 
    closeSession, 
    undo, 
    redo 
  } = useEditorStore();

  useImperativeHandle(ref, () => ({
     // Forward ref if App.tsx needs it
  }));

  const activeSession = sessions.find(s => s.id === activeSessionId);

  if (sessions.length === 0) {
     return (
       <div className="flex-1 flex flex-col items-center justify-center bg-app-bg text-app-muted relative">
         <div className="w-24 h-24 mb-6 rounded-full bg-app-sidebar border border-app-border/40 flex items-center justify-center shadow-sm">
           <LayoutTemplate className="w-10 h-10 text-app-accent/40" />
         </div>
         <h2 className="text-xl font-semibold text-app-text mb-2">RedPanda Forge</h2>
         <p className="text-ui-base text-center max-w-md">
           Select a match or template from the sidebar to begin editing a new graphic session.
         </p>
       </div>
     );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-app-bg relative">
      {/* Top Header */}
      <div className="h-[3.5rem] bg-app-card border-b border-app-border flex items-center justify-between shrink-0 select-none px-2 z-10 w-full overflow-hidden">
         {/* TABS */}
         <div className="flex items-center overflow-x-auto no-scrollbar h-full pt-2">
            {sessions.map(s => (
               <button 
                 key={s.id} 
                 onClick={() => setActiveSession(s.id)}
                 className={cn(
                   "h-full px-4 text-ui-sm rounded-t-lg transition-colors flex items-center gap-3 relative min-w-[120px] max-w-[200px] group",
                   s.id === activeSessionId 
                     ? "bg-app-bg text-app-text font-medium border-t border-x border-app-border border-b-0 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-app-bg" 
                     : "bg-transparent text-app-muted hover:bg-app-sidebar hover:text-app-text border-t border-x border-transparent"
                 )}
               >
                 <span className="truncate flex-1 text-left">{s.name || "Untitled Session"}</span>
                 <span 
                   className={cn(
                     "w-5 h-5 rounded-md flex items-center justify-center transition-colors text-[14px]",
                     s.id === activeSessionId ? "hover:bg-app-card opacity-100" : "opacity-0 group-hover:opacity-100 hover:bg-app-card"
                   )}
                   onClick={(e) => { 
                     e.stopPropagation(); 
                     closeSession(s.id); 
                   }}
                 >
                   &times;
                 </span>
               </button>
            ))}
         </div>

         {/* Actions */}
         <div className="flex items-center gap-1.5 pl-4 ml-auto bg-gradient-to-r from-transparent via-app-card to-app-card shrink-0">
            <button 
              onClick={undo} 
              disabled={!activeSession?.history || activeSession.historyIndex <= -1} 
              className="w-8 h-8 flex items-center justify-center text-app-muted hover:text-app-text hover:bg-app-bg disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
              title={t.editor.undo}
            >
              <Undo2 size={18} />
            </button>
            <button 
              onClick={redo} 
              disabled={!activeSession?.history || activeSession.historyIndex >= activeSession.history.length - 1} 
              className="w-8 h-8 flex items-center justify-center text-app-muted hover:text-app-text hover:bg-app-bg disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
              title={t.editor.redo}
            >
              <Redo2 size={18} />
            </button>
            
            <div className="w-px h-5 bg-app-border mx-2" />
            
            <div className="relative">
               <button 
                 onClick={() => setExportOpen(!exportOpen)}
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-app-accent hover:opacity-90 text-accent-foreground text-ui-sm font-medium rounded-md shadow-sm transition-all"
               >
                 <Download size={16} />
                 {t.editor.export}
               </button>
               
               {exportOpen && (
                 <>
                   <div 
                     className="fixed inset-0 z-40" 
                     onClick={() => setExportOpen(false)} 
                   />
                   <div className="absolute top-full right-0 mt-2 w-56 bg-app-card border border-app-border rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <button 
                        onClick={() => { setExportOpen(false); konvaRef.current?.exportPNG(); }} 
                        className="w-full text-left px-4 py-2 text-ui-sm text-app-text hover:bg-app-bg flex items-center gap-2.5 transition-colors"
                      >
                        <ImageIcon size={16} className="text-blue-500" /> 
                        Export PNG
                      </button>
                      <button 
                        onClick={() => { setExportOpen(false); konvaRef.current?.exportSVG(); }} 
                        className="w-full text-left px-4 py-2 text-ui-sm text-app-text hover:bg-app-bg flex items-center gap-2.5 transition-colors"
                      >
                        <View size={16} className="text-orange-500" /> 
                        Export SVG
                      </button>
                      <div className="w-full h-px bg-app-border/50 my-1"></div>
                      <button 
                        onClick={() => { setExportOpen(false); konvaRef.current?.exportHTML(); }} 
                        className="w-full text-left px-4 py-2 text-ui-sm text-app-text hover:bg-app-bg flex items-center gap-2.5 transition-colors title='Export to a standalone HTML template structure'"
                      >
                        <Code size={16} className="text-green-500" /> 
                        Export HTML Bundle
                      </button>
                   </div>
                 </>
               )}
            </div>
         </div>
      </div>
      
      {/* Main Workspace Area */}
      <div className="flex-1 flex min-h-0 relative">
        <div className="flex-1 flex relative items-center justify-center bg-app-sidebar/30 overflow-hidden">
           <KonvaEditor 
              ref={konvaRef}
              rightExpanded={rightExpanded}
              setRightExpanded={setRightExpanded}
              setActiveRightTab={setActiveRightTab}
           />
        </div>
        
        {/* Right Panel Wrapper */}
        <RightPanel 
           rightExpanded={rightExpanded}
           setRightExpanded={setRightExpanded}
           activeRightTab={activeRightTab}
           setActiveRightTab={setActiveRightTab}
        />
      </div>
    </div>
  );
});

EditorWorkspace.displayName = "EditorWorkspace";
export default EditorWorkspace;
