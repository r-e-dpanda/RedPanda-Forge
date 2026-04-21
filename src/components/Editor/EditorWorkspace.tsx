import React, { useState, forwardRef, useImperativeHandle, useRef } from "react";
import KonvaEditor, { EditorRef as KonvaEditorRef } from "../editor/KonvaEditor";
import RightPanel from "../panels/RightPanel";
import { useEditorStore } from "../../stores/editorStore";
import { cn } from "../../lib/utils";
import { Plus, X, Image as ImageIcon, RotateCcw, RotateCw, Download, AlertTriangle } from "lucide-react";
import { useTranslation } from "../../lib/i18n";

export interface EditorRef {
  exportPNG: () => void;
}

const EditorWorkspace = forwardRef<EditorRef, any>((props, ref) => {
  const { t } = useTranslation();
  const [rightExpanded, setRightExpanded] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'data' | 'design'>('data');
  const innerEditorRef = useRef<KonvaEditorRef>(null);

  const { 
    sessions, 
    activeSessionId, 
    setActiveSession, 
    addSession, 
    closeSession,
    renameSession,
    undo,
    redo,
    canUndo,
    canRedo
  } = useEditorStore();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState("");
  const [showConfirmClose, setShowConfirmClose] = useState<string | null>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useImperativeHandle(ref, () => ({
    exportPNG: () => {
      if (innerEditorRef.current) {
        innerEditorRef.current.exportPNG();
      }
    }
  }));

  const handleCloseSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const session = sessions.find(s => s.id === id);
    const isDirty = session && (
      Object.keys(session.elementOverrides).length > 0 || 
      Object.keys(session.manualInputs).length > 0 ||
      session.historyIndex >= 0
    );

    if (isDirty) {
      setShowConfirmClose(id);
    } else {
      closeSession(id);
    }
  };

  const confirmClose = () => {
    if (showConfirmClose) {
      closeSession(showConfirmClose);
      setShowConfirmClose(null);
    }
  };

  const startRenaming = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenamingName(name);
  };

  const submitRename = () => {
    if (renamingId && renamingName.trim()) {
      renameSession(renamingId, renamingName.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-app-bg border-l border-app-border">
      {/* Editor Tab Bar - Localized to Editor Area with Actions */}
      <div className="h-[36px] bg-app-sidebar/40 border-b border-app-border shrink-0 flex items-center justify-between px-2 relative z-20 overflow-hidden">
          <div className="flex items-end gap-0.5 h-full overflow-x-auto scrollbar-hide flex-1">
            {sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                onDoubleClick={(e) => startRenaming(session.id, session.name, e)}
                className={cn(
                  "h-[28px] px-3 flex items-center gap-2 rounded-t-md min-w-[100px] max-w-[180px] cursor-pointer transition-all border-x border-t relative text-[12px] font-bold tracking-wider group",
                  activeSessionId === session.id 
                    ? "bg-app-bg border-app-border border-b-app-bg -mb-[1px] text-app-text z-10" 
                    : "bg-transparent border-transparent text-app-muted hover:text-app-text hover:bg-app-card/30"
                )}
              >
                <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                  {session.template?.thumbnail ? (
                    <img src={session.template.thumbnail} className="w-full h-full object-contain opacity-80" alt="" />
                  ) : <ImageIcon size={9} className="opacity-40" />}
                </div>
                
                {renamingId === session.id ? (
                  <input 
                    autoFocus
                    value={renamingName}
                    onChange={e => setRenamingName(e.target.value)}
                    onBlur={submitRename}
                    onKeyDown={e => e.key === 'Enter' && submitRename()}
                    onClick={e => e.stopPropagation()}
                    className="bg-app-card border border-app-accent rounded px-1 w-full text-[12px] h-6 outline-none font-bold"
                  />
                ) : (
                  <span className="truncate flex-1 leading-none">{session.name}</span>
                )}

                <button 
                  onClick={(e) => handleCloseSession(session.id, e)}
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
                    activeSessionId === session.id ? "opacity-100 bg-app-card text-app-muted hover:bg-red-500 hover:text-white" : "text-app-muted hover:bg-app-accent hover:text-black"
                  )}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => addSession()}
              className="px-2 h-[28px] text-app-muted hover:text-app-accent transition-colors flex items-center justify-center mb-0.5"
              title={t.workspace.actions.newGraphic}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Localized Actions */}
          <div className="flex items-center gap-2 pl-4">
            <div className="flex items-center rounded overflow-hidden border border-app-border h-6 shadow-sm">
                <button 
                  onClick={undo}
                  disabled={!canUndo()}
                  className="w-7 h-full bg-app-bg flex items-center justify-center text-app-muted hover:text-app-text disabled:opacity-30 disabled:pointer-events-none border-r border-app-border transition-colors outline-none"
                  title={t.workspace.actions.undo}
                >
                  <RotateCcw size={11} />
                </button>
                <button 
                  onClick={redo}
                  disabled={!canRedo()}
                  className="w-7 h-full bg-app-bg flex items-center justify-center text-app-muted hover:text-app-text disabled:opacity-30 disabled:pointer-events-none transition-colors outline-none"
                  title={t.workspace.actions.redo}
                >
                  <RotateCw size={11} />
                </button>
            </div>

            <button 
              onClick={() => innerEditorRef.current?.exportPNG()}
              className="h-6 bg-app-accent hover:bg-app-accent/80 text-black px-3 rounded flex items-center justify-center gap-2 text-[12px] font-[900] transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              disabled={!activeSession?.template}
            >
              <Download size={11} /> {t.workspace.actions.export}
            </button>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
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

        {/* Global Confirmation for Closing Tab */}
        {showConfirmClose && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-app-sidebar border border-app-border w-full max-w-[400px] p-6 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <AlertTriangle size={24} />
                <h2 className="text-lg font-bold text-app-text tracking-tight uppercase">{t.workspace.modals.closeTab.header}</h2>
              </div>
              
              <p className="text-app-muted text-sm leading-relaxed mb-6">
                This graphic has <span className="text-app-text font-bold">UNSAVED CHANGES</span>. Closing this tab will permanently discard all your adjustments.
              </p>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={confirmClose}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors text-sm uppercase tracking-wider"
                >
                  {t.workspace.modals.closeTab.confirm}
                </button>
                <button 
                  onClick={() => setShowConfirmClose(null)}
                  className="w-full bg-app-card hover:bg-app-bg text-app-text border border-app-border font-bold py-3 rounded-lg transition-colors text-sm uppercase tracking-wider"
                >
                  {t.common.cancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default EditorWorkspace;
