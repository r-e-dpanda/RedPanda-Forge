import React, { forwardRef, useState, useRef, useImperativeHandle } from "react";
import KonvaEditor from "./KonvaEditor";
import RightPanel from "../panels/RightPanel";
import { useEditorStore } from "../../stores/editorStore";
import { useTranslation } from "../../lib/i18n";
import { 
  Undo2, Redo2, Download, Image as ImageIcon, Code, FileText, View, LayoutTemplate, PanelRightOpen,
  X, AlertTriangle
} from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { cn } from "../../lib/utils";

const EditorWorkspace = forwardRef((props, ref) => {
  const [rightExpanded, setRightExpanded] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'data' | 'design'>('data');
  const konvaRef = useRef<any>(null);
  const [exportOpen, setExportOpen] = useState(false);
  
  // Dirty check state
  const [sessionToClose, setSessionToClose] = useState<string | null>(null);

  // Renaming state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  
  const { t } = useTranslation();
  const { 
    sessions, 
    activeSessionId, 
    setActiveSession, 
    closeSession, 
    undo, 
    redo,
    renameSession
  } = useEditorStore();

  useImperativeHandle(ref, () => ({
     // Forward ref if App.tsx needs it
  }));

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const startRenaming = (id: string, currentName: string) => {
    setEditingSessionId(id);
    setEditingName(currentName);
  };

  const handleRename = () => {
    if (editingSessionId && editingName.trim()) {
      renameSession(editingSessionId, editingName.trim());
    }
    setEditingSessionId(null);
  };

  const handleCloseSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const session = sessions.find(s => s.id === id);
    // Check if session is "dirty" (has overrides or manual inputs)
    const hasOverrides = session?.elementOverrides && Object.keys(session.elementOverrides).length > 0;
    const hasManualInputs = session?.manualInputs && Object.keys(session.manualInputs).length > 0;
    
    if (hasOverrides || hasManualInputs) {
      setSessionToClose(id);
    } else {
      closeSession(id);
    }
  };

  const confirmClose = () => {
    if (sessionToClose) {
      closeSession(sessionToClose);
      setSessionToClose(null);
    }
  };

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
         <div className="flex items-center overflow-x-auto overflow-y-hidden no-scrollbar h-full pt-2">
            {sessions.map(s => (
               <div 
                 key={s.id} 
                 onClick={() => setActiveSession(s.id)}
                 onDoubleClick={() => startRenaming(s.id, s.name)}
                 className={cn(
                   "h-full px-4 text-ui-xs rounded-t-lg transition-colors flex items-center gap-3 relative min-w-[120px] max-w-[200px] group cursor-pointer",
                   s.id === activeSessionId 
                     ? "bg-app-bg text-app-text font-medium border-t border-x border-app-border border-b-0 after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-app-bg" 
                     : "bg-transparent text-app-muted hover:bg-app-sidebar hover:text-app-text border-t border-x border-transparent"
                 )}
               >
                 {editingSessionId === s.id ? (
                   <input
                     autoFocus
                     value={editingName}
                     onChange={(e) => setEditingName(e.target.value)}
                     onBlur={handleRename}
                     onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                     className="bg-transparent text-app-text focus:outline-none w-full"
                     onClick={(e) => e.stopPropagation()}
                   />
                 ) : (
                   <span className="truncate flex-1 text-left">{s.name || "Untitled Session"}</span>
                 )}
                 <span 
                   className={cn(
                     "w-5 h-5 rounded-md flex items-center justify-center transition-colors text-[14px]",
                     s.id === activeSessionId ? "hover:bg-app-card opacity-100" : "opacity-0 group-hover:opacity-100 hover:bg-app-card"
                   )}
                   onClick={(e) => handleCloseSession(s.id, e)}
                  >
                    &times;
                  </span>
               </div>
            ))}
         </div>

         {/* Actions */}
         <div className="flex items-center gap-1.5 pl-4 ml-auto bg-gradient-to-r from-transparent via-app-card to-app-card shrink-0">
            <button 
              onClick={undo} 
              disabled={!activeSession?.history || activeSession.historyIndex <= -1} 
              className="w-8 h-8 flex items-center justify-center text-app-muted hover:text-app-text hover:bg-app-bg disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
              title={t.workspace.actions.undo}
            >
              <Undo2 size={18} />
            </button>
            <button 
              onClick={redo} 
              disabled={!activeSession?.history || activeSession.historyIndex >= activeSession.history.length - 1} 
              className="w-8 h-8 flex items-center justify-center text-app-muted hover:text-app-text hover:bg-app-bg disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
              title={t.workspace.actions.redo}
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
                 {t.workspace.actions.export}
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
        <div className="flex-1 flex relative items-stretch justify-stretch bg-app-sidebar/30 overflow-hidden">
           {!rightExpanded && (
             <button 
               onClick={() => setRightExpanded(true)}
               className="absolute top-4 right-4 z-40 p-2 bg-app-card border border-app-border text-app-accent hover:opacity-90 rounded-md shadow-xl transition-all active:scale-95"
               title="Open Properties"
             >
               <PanelRightOpen size={18} />
             </button>
           )}
           <div className="flex-1 flex relative overflow-hidden">
             <KonvaEditor 
                ref={konvaRef}
                rightExpanded={rightExpanded}
                setRightExpanded={setRightExpanded}
                setActiveRightTab={setActiveRightTab}
             />
           </div>
        </div>
        
        {/* Right Panel Wrapper */}
        <RightPanel 
           rightExpanded={rightExpanded}
           setRightExpanded={setRightExpanded}
           activeRightTab={activeRightTab}
           setActiveRightTab={setActiveRightTab}
        />
      </div>

      <AlertDialog open={!!sessionToClose} onOpenChange={(open) => !open && setSessionToClose(null)}>
        <AlertDialogContent className="bg-app-card border-app-border">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 text-amber-500 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <AlertDialogTitle className="text-app-text">Unsaved Changes</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-app-muted">
              This session has unsaved overrides or manual data. Closing it will permanently discard these changes. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-app-border text-app-text hover:bg-app-sidebar">
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmClose}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

EditorWorkspace.displayName = "EditorWorkspace";
export default EditorWorkspace;
