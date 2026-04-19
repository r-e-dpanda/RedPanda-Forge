import React, { useState, useRef, useEffect } from 'react';
import { Match, Template, Sport, Ratio } from './types/template';
import { MOCK_MATCHES, MOCK_TEMPLATES } from './lib/mockData';
import EditorWorkspace, { EditorRef } from './components/Editor/EditorWorkspace';
import PasteTemplateModal from './components/PasteTemplateModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { useSettingsStore } from './stores/settingsStore';
import { LayoutTemplate, Trophy, Calendar, Settings, Image as ImageIcon, Menu, Check, PanelLeftClose, PanelLeftOpen, Upload, Code, Download, Undo2, Redo2, AlertTriangle, X } from 'lucide-react';
import { cn } from './lib/utils';
import { useEditorStore } from './stores/editorStore';
import { LeftSidebar } from './components/LeftSidebar';

export default function App() {
  const [selectedSport, setSelectedSport] = useState<Sport>("football");
  const [selectedLeague, setSelectedLeague] = useState<string>("All");
  const [selectedRatio, setSelectedRatio] = useState<Ratio | "All">("16:9");
  const [leftExpanded, setLeftExpanded] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState<'matches' | 'templates'>('matches');
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const editorRef = useRef<EditorRef>(null);

  // Get active session states from store
  const sessions = useEditorStore(state => state.sessions);
  const activeSessionId = useEditorStore(state => state.activeSessionId);
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeTemplate = activeSession?.template || null;
  const activeMatch = activeSession?.match || null;

  const setEditorMatch = useEditorStore(state => state.setMatch);
  const setEditorTemplate = useEditorStore(state => state.setTemplate);
  const { undo, redo, canUndo, canRedo } = useEditorStore();
  const loadSettings = useSettingsStore(state => state.loadSettings);
  const toggleSettingsModal = useSettingsStore(state => state.toggleModal);

  const [confirmPrompt, setConfirmPrompt] = useState<{isOpen: boolean, type: 'match'|'template'|'sport'|'close_tab', data: any} | null>(null);

  const availableLeagues = React.useMemo(() => {
    const matches = MOCK_MATCHES.filter(m => m.sport === selectedSport);
    const leagues = new Set(matches.map(m => m.league).filter(Boolean));
    return ["All", ...Array.from(leagues)];
  }, [selectedSport]);

  const filteredMatches = MOCK_MATCHES.filter(m => m.sport === selectedSport);
  const filteredTemplates = templates.filter(t => t.sport === selectedSport && (selectedRatio === "All" || t.ratio === selectedRatio));
  const tab2Templates = templates.filter(t => t.sport === selectedSport);

  const checkSessionDirty = (session: any) => {
    if (!session) return false;
    return Object.keys(session.elementOverrides || {}).length > 0 || 
           Object.keys(session.manualInputs || {}).length > 0 ||
           session.historyIndex >= 0;
  };

  const isSessionDirty = checkSessionDirty(activeSession);

  const handleCloseTab = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const sessionToClose = sessions.find(s => s.id === sessionId);
    if (checkSessionDirty(sessionToClose)) {
      setConfirmPrompt({ isOpen: true, type: 'close_tab', data: sessionId });
    } else {
      useEditorStore.getState().closeSession(sessionId);
    }
  };

  const handleSelectTemplate = (tpl: any) => {
    if (activeTemplate?.id === tpl.id) return;
    if (isSessionDirty) {
      setConfirmPrompt({ isOpen: true, type: 'template', data: tpl });
    } else {
      setEditorTemplate(tpl);
    }
  };

  const handleSelectMatch = (m: any) => {
    if (activeMatch?.id === m.id) return;
    if (isSessionDirty && activeMatch && activeMatch.sport !== m.sport) {
      setConfirmPrompt({ isOpen: true, type: 'match', data: m });
    } else {
      setEditorMatch(m);
    }
  };

  const handleConfirmAction = (action: 'new' | 'overwrite' | 'discard_close' | 'export_close') => {
    if (!confirmPrompt) return;

    if (action === 'discard_close' || action === 'export_close') {
      const sessionIdToClose = confirmPrompt.type === 'close_tab' ? confirmPrompt.data : activeSessionId;
      
      const doClose = () => {
         if (sessionIdToClose) useEditorStore.getState().closeSession(sessionIdToClose);
         if (confirmPrompt.type === 'sport') {
            setSelectedSport(confirmPrompt.data);
         }
         setConfirmPrompt(null);
      };

      if (action === 'export_close' && sessionIdToClose) {
         if (activeSessionId !== sessionIdToClose) {
            useEditorStore.getState().setActiveSession(sessionIdToClose);
            setTimeout(() => {
               editorRef.current?.exportPNG();
               setTimeout(doClose, 500);
            }, 100);
         } else {
            editorRef.current?.exportPNG();
            setTimeout(doClose, 500);
         }
      } else {
         doClose();
      }
      return;
    }

    if (action === 'new') {
      const newSessionId = useEditorStore.getState().addSession();
      useEditorStore.getState().setActiveSession(newSessionId);
      // Wait for re-render logically, then apply state
      setTimeout(() => {
        if (confirmPrompt.type === 'template') useEditorStore.getState().setTemplate(confirmPrompt.data);
        if (confirmPrompt.type === 'match') useEditorStore.getState().setMatch(confirmPrompt.data);
      }, 0);
    } else if (action === 'overwrite') {
      if (confirmPrompt.type === 'template') setEditorTemplate(confirmPrompt.data);
      if (confirmPrompt.type === 'match') setEditorMatch(confirmPrompt.data);
    }
    setConfirmPrompt(null);
  };

  const batchGenerate = () => {
    if (activeMatch && filteredTemplates.length > 0) {
      useEditorStore.getState().createBatchSessions(activeMatch, filteredTemplates);
    }
  };

  useEffect(() => {
    setSelectedLeague("All");
  }, [selectedSport]);

  useEffect(() => {
    if (activeSession) {
      const sport = activeSession.template?.sport || activeSession.match?.sport;
      if (sport && sport !== selectedSport) {
        setSelectedSport(sport);
      }
    }
  }, [activeSessionId, activeSession, selectedSport]);

  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSport = e.target.value as Sport;
    
    // Find the first tab that belongs to this sport
    const existingSession = sessions.find(s => 
      s.template?.sport === newSport || s.match?.sport === newSport
    );

    if (existingSession) {
      useEditorStore.getState().setActiveSession(existingSession.id);
    } else {
      // Find an empty session (no template and no match applied yet)
      const emptySession = sessions.find(s => !s.template && !s.match);
      if (emptySession) {
        useEditorStore.getState().setActiveSession(emptySession.id);
      } else {
        const newSessionId = useEditorStore.getState().addSession();
        useEditorStore.getState().setActiveSession(newSessionId);
      }
    }
    
    setSelectedSport(newSport);
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const currentTheme = useSettingsStore(state => state.settings?.theme) || 'dark';
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  return (
    <div className="flex flex-col h-screen bg-app-bg text-app-text font-sans antialiased overflow-hidden selection:bg-app-accent/30">
      
      {/* TOP BAR (Fixed) */}
      <div className="h-[56px] border-b border-app-border bg-app-sidebar flex items-center justify-between px-5 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-app-accent font-[800] tracking-[-0.5px] text-[1.1rem]">
            <span className="text-[1.2rem]">🐼</span>
            <span>RedPanda Forge</span>
          </div>
          <div className="w-[1px] h-4 bg-app-border"></div>
          <div className="flex items-center gap-4 text-[12px]">
            <div className="flex items-center gap-2">
              <span className="text-app-muted font-[600]">Sport:</span>
              <select 
                value={selectedSport} 
                onChange={handleSportChange}
                className="bg-app-card border border-app-border rounded px-2 py-1 text-app-text outline-none focus:border-app-accent text-[11px]"
              >
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="tennis">Tennis</option>
                <option value="esports">Esports</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-app-muted font-[600]">
                {selectedSport === 'tennis' ? 'Tour' : 'League'}:
              </span>
              <select 
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="bg-app-card border border-app-border rounded px-2 py-1 text-app-text outline-none focus:border-app-accent text-[11px]"
              >
                {availableLeagues.map((league) => (
                  <option key={league} value={league}>{league}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
             onClick={() => toggleSettingsModal()}
             className="text-app-muted hover:text-app-text transition-colors p-1.5 mr-2"
             title="Settings"
          >
             <Settings size={18} />
          </button>
          
          <div className="w-px h-4 bg-app-border mx-2"></div>
          
          <div className="flex items-center gap-2 mr-4">
            <button 
              onClick={undo}
              disabled={!canUndo()}
              className="text-app-muted hover:text-app-text disabled:opacity-30 disabled:hover:text-app-muted transition-colors p-1"
              title="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button 
              onClick={redo}
              disabled={!canRedo()}
              className="text-app-muted hover:text-app-text disabled:opacity-30 disabled:hover:text-app-muted transition-colors p-1"
              title="Redo"
            >
              <Redo2 size={16} />
            </button>
          </div>
          <button className="text-[10px] font-bold text-app-muted hover:text-app-text px-3 py-1.5 transition-colors uppercase tracking-wider">
            Save
          </button>
          <button 
            onClick={batchGenerate}
            disabled={!activeMatch || filteredTemplates.length === 0}
            className="text-[10px] font-bold text-app-text bg-app-card hover:bg-app-border disabled:opacity-30 px-4 py-1.5 rounded transition-all uppercase tracking-wider"
          >
            Batch Generate
          </button>
          <button 
            onClick={() => editorRef.current?.exportPNG()}
            className="text-[10px] font-bold text-white bg-app-accent border border-app-accent-light hover:brightness-110 px-4 py-1.5 rounded transition-all flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            <Download size={13} />
            Export PNG
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT COLLAPSED NAV */}
        {!leftExpanded && (
          <div className="w-[56px] flex flex-col items-center bg-app-sidebar border-r border-app-border shrink-0 py-4 gap-6 z-10 transition-all">
            <button 
              onClick={() => setLeftExpanded(true)} 
              className="p-2 text-app-muted hover:text-app-text hover:bg-app-card rounded-md transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
            <div className="w-6 h-[1px] bg-app-border"></div>
            <div className="flex flex-col gap-4">
              <button onClick={() => { setLeftExpanded(true); setActiveLeftTab('matches'); }} className="p-2 text-app-muted hover:text-app-text hover:bg-app-card rounded-md transition-colors" title="Matches">
                <Calendar size={18} />
              </button>
              <button onClick={() => { setLeftExpanded(true); setActiveLeftTab('templates'); }} className="p-2 text-app-muted hover:text-app-text hover:bg-app-card rounded-md transition-colors" title="Templates">
                <LayoutTemplate size={18} />
              </button>
            </div>
          </div>
        )}

        {/* LEFT EXPANDED SIDEBAR (Toggleable) */}
         {leftExpanded && (
            <LeftSidebar 
               selectedSport={selectedSport}
               selectedRatio={selectedRatio}
               selectedLeague={selectedLeague}
               activeLeftTab={activeLeftTab}
               setActiveLeftTab={setActiveLeftTab}
               setSelectedRatio={setSelectedRatio}
               templates={templates}
               setEditorTemplate={handleSelectTemplate}
               activeTemplate={activeTemplate}
               activeMatch={activeMatch}
               setEditorMatch={handleSelectMatch}
               setIsModalOpen={setIsModalOpen}
            />
         )}

        {/* MAIN PANEL: Workspace with Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden bg-app-bg">
          {/* TAB BAR */}
          <div className="flex h-[36px] border-b border-app-border bg-app-sidebar overflow-x-auto shrink-0 select-none">
             {sessions.map(session => (
               <div 
                 key={session.id}
                 onClick={() => useEditorStore.getState().setActiveSession(session.id)}
                 className={cn(
                   "flex items-center justify-between min-w-[140px] max-w-[200px] px-3 border-r border-app-border cursor-pointer transition-colors group",
                   activeSessionId === session.id 
                     ? "bg-app-bg text-app-text border-t-2 border-t-app-accent" 
                     : "text-app-muted hover:bg-app-card border-t-2 border-t-transparent"
                 )}
               >
                 <span className="text-[11px] font-medium truncate flex-1 leading-none">{session.name}</span>
                 <button 
                   onClick={(e) => handleCloseTab(e, session.id)}
                   title="Close tab"
                   className={cn(
                     "ml-2 shrink-0 p-0.5 rounded-sm hover:bg-app-bg transition-colors",
                     activeSessionId === session.id ? "text-app-text" : "text-app-muted group-hover:text-app-text"
                   )}
                 >
                   <X className="w-3 h-3" />
                 </button>
               </div>
             ))}
             <button 
               onClick={() => useEditorStore.getState().addSession()}
               className="h-full px-4 flex items-center justify-center text-app-muted hover:text-app-text hover:bg-app-card transition-colors border-r border-app-border"
             >
                <div className="text-lg leading-none mb-1">+</div>
             </button>
          </div>
          
          <EditorWorkspace ref={editorRef} template={activeTemplate} match={activeMatch} />
        </div>
      </div>

      {/* BOTTOM STATUS BAR */}
      <div className="h-[28px] border-t border-app-border bg-app-bg shrink-0 flex items-center px-4 justify-between text-[10px] text-app-muted font-mono z-20">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Ready</span>
          {activeTemplate && (
            <>
              <span>•</span>
              <span>{activeTemplate.canvas.width}×{activeTemplate.canvas.height}</span>
              <span>•</span>
              <span>{activeTemplate.layers?.length || 0} layers</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
           <span>{sessions.length} OPEN {sessions.length === 1 ? 'TAB' : 'TABS'}</span>
        </div>
      </div>

      {/* MODALS */}
      <PasteTemplateModal 
        isOpen={isModalOpen}
        existingTemplates={templates}
        onClose={() => setIsModalOpen(false)}
        onSave={(newTemplate, isUpdate) => {
          if (isUpdate) {
            setTemplates(prev => prev.map(t => t.id === newTemplate.id ? newTemplate : t));
          } else {
            setTemplates(prev => [...prev, newTemplate]);
          }
          setEditorTemplate(newTemplate);
        }}
      />
      <SettingsModal />

      {confirmPrompt && confirmPrompt.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-app-sidebar border border-app-border rounded-lg shadow-2xl p-6 max-w-md w-full">
             <h3 className="text-lg font-bold text-app-text mb-2 text-yellow-500 flex items-center gap-2">
               <AlertTriangle size={20} /> Unsaved Changes Target
             </h3>
             <p className="text-sm text-app-muted mb-6 mt-2">
               {confirmPrompt.type === 'close_tab' ? `You have unsaved changes in this session. Do you want to export your work before closing this tab?` : confirmPrompt.type === 'sport' 
                 ? `You have unsaved changes in the current editor. Do you want to export your work before closing this editor to switch to ${confirmPrompt.data}?`
                 : `You are about to change the ${confirmPrompt.type} to `}
               {confirmPrompt.type !== 'sport' && confirmPrompt.type !== 'close_tab' && <strong className="text-white">{confirmPrompt.data.name || confirmPrompt.data.league}</strong>}
               {confirmPrompt.type !== 'sport' && confirmPrompt.type !== 'close_tab' && `. The current session has user overrides which might be lost or look incorrect. Do you want to open this in a new tab or replace the current tab?`}
             </p>
             <div className="flex items-center justify-end gap-3 font-medium text-[13px]">
               <button 
                 onClick={() => setConfirmPrompt(null)}
                 className="px-4 py-2 rounded text-app-muted hover:text-white hover:bg-app-card transition-colors"
               >
                 Cancel
               </button>
               {confirmPrompt.type === 'sport' || confirmPrompt.type === 'close_tab' ? (
                 <>
                   <button 
                     onClick={() => handleConfirmAction('discard_close')}
                     className="px-4 py-2 rounded bg-app-card border border-app-border text-app-text hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all uppercase tracking-wider text-[11px] font-bold"
                   >
                     Discard & Close
                   </button>
                   <button 
                     onClick={() => handleConfirmAction('export_close')}
                     className="px-4 py-2 rounded bg-app-accent border border-app-accent text-white hover:brightness-110 transition-all uppercase tracking-wider text-[11px] font-bold shadow-lg flex items-center gap-2"
                   >
                     <Download size={13} />
                     Export & Close
                   </button>
                 </>
               ) : (
                 <>
                   <button 
                     onClick={() => handleConfirmAction('overwrite')}
                     className="px-4 py-2 rounded bg-app-card border border-app-border text-app-text hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all uppercase tracking-wider text-[11px] font-bold"
                   >
                     Replace Current
                   </button>
                   <button 
                     onClick={() => handleConfirmAction('new')}
                     className="px-4 py-2 rounded bg-app-accent border border-app-accent text-white hover:brightness-110 transition-all uppercase tracking-wider text-[11px] font-bold shadow-lg"
                   >
                     Open in New Tab
                   </button>
                 </>
               )}
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
