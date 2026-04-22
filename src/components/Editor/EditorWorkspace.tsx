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
      <div className="h-[44px] bg-app-sidebar/40 border-b border-app-border shrink-0 flex items-center justify-between px-3 relative z-20 overflow-hidden select-none">
          <div className="flex items-end gap-1 h-full overflow-x-auto overflow-y-hidden scrollbar-hide flex-1">
            {sessions.map(session => (
              <div 
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                onDoubleClick={(e) => startRenaming(session.id, session.name, e)}
                className={cn(
                  "h-[34px] px-3.5 flex items-center gap-2 rounded-t-lg min-w-[120px] max-w-[220px] cursor-pointer transition-all border-x border-t relative text-ui-sm font-normal group",
                  activeSessionId === session.id 
                    ? "bg-app-bg border-app-border border-b-app-bg -mb-[1px] text-app-text z-10" 
                    : "bg-transparent border-transparent text-app-muted hover:text-app-text hover:bg-app-card/30"
                )}
              >
                <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                  {session.template?.thumbnail ? (
                    <img src={session.template.thumbnail} className="w-full h-full object-contain opacity-90" alt="" />
                  ) : <ImageIcon size={10} className="opacity-40" />}
                </div>
                
                {renamingId === session.id ? (
                  <input 
                    autoFocus
                    value={renamingName}
                    onChange={e => setRenamingName(e.target.value)}
                    onBlur={submitRename}
                    onKeyDown={e => e.key === 'Enter' && submitRename()}
                    onClick={e => e.stopPropagation()}
                    className="bg-app-card border border-app-accent rounded px-2 w-full text-ui-xs h-7 outline-none"
                  />
                ) : (
                  <span className="truncate flex-1 leading-none">{session.name}</span>
                )}

                <button 
                  onClick={(e) => handleCloseSession(session.id, e)}
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
                    activeSessionId === session.id ? "opacity-100 bg-app-card text-app-muted hover:bg-red-500 hover:text-white" : "text-app-muted hover:bg-app-accent hover:text-black"
                  )}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button 
              onClick={() => addSession()}
              className="px-3 h-[34px] text-app-muted hover:text-app-accent transition-colors flex items-center justify-center mb-0.5"
              title={t.workspace.actions.newGraphic}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Localized Actions */}
          <div className="flex items-center gap-2.5 pl-5 overflow-y-hidden">
            <div className="flex items-center rounded-md overflow-hidden border border-app-border h-8 shadow-sm">
                <button 
                  onClick={undo}
                  disabled={!canUndo()}
                  className="w-10 h-full bg-app-bg flex items-center justify-center text-app-muted hover:text-app-text disabled:opacity-30 disabled:pointer-events-none border-r border-app-border transition-colors outline-none"
                  title={t.workspace.actions.undo}
                >
                  <RotateCcw size={14} />
                </button>
                <button 
                  onClick={redo}
                  disabled={!canRedo()}
                  className="w-10 h-full bg-app-bg flex items-center justify-center text-app-muted hover:text-app-text disabled:opacity-30 disabled:pointer-events-none transition-colors outline-none"
                  title={t.workspace.actions.redo}
                >
                  <RotateCw size={14} />
                </button>
            </div>

            <button 
              onClick={() => innerEditorRef.current?.exportPNG()}
              className="h-8 bg-app-accent hover:brightness-110 text-accent-foreground px-4 rounded-md flex items-center justify-center gap-2 text-ui-xs font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
              disabled={!activeSession?.template}
            >
              <Download size={13} /> {t.workspace.actions.export}
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
                <AlertTriangle size={20} />
                <h2 className="text-ui-base font-medium text-app-text">{t.workspace.modals.closeTab.header}</h2>
              </div>
              
              <p className="text-app-muted text-ui-sm leading-relaxed mb-6">
                This graphic has <span className="text-app-text font-medium">unsaved changes</span>. Closing this tab will permanently discard all your adjustments.
              </p>

              <div className="flex flex-col gap-2.5">
                <button 
                  onClick={confirmClose}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-2.5 rounded-lg transition-all text-ui-sm active:scale-[0.98]"
                >
                  {t.workspace.modals.closeTab.confirm}
                </button>
                <button 
                  onClick={() => setShowConfirmClose(null)}
                  className="w-full bg-app-card hover:bg-app-bg text-app-muted hover:text-app-text border border-app-border font-medium py-2.5 rounded-lg transition-all text-ui-sm active:scale-[0.98]"
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
