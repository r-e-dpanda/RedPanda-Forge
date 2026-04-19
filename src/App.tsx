import React, { useState, useRef, useEffect } from 'react';
import { Match, Template, Sport, Ratio } from './types/template';
import { MOCK_MATCHES, MOCK_TEMPLATES } from './lib/mockData';
import EditorWorkspace, { EditorRef } from './components/Editor/EditorWorkspace';
import PasteTemplateModal from './components/PasteTemplateModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { useSettingsStore } from './stores/settingsStore';
import { LayoutTemplate, Trophy, Calendar, Settings, Image as ImageIcon, Menu, Check, PanelLeftClose, PanelLeftOpen, Upload, Code, Download, Undo2, Redo2 } from 'lucide-react';
import { cn } from './lib/utils';
import { useEditorStore } from './stores/editorStore';
import { LeftSidebar } from './components/LeftSidebar';

export default function App() {
  const [selectedSport, setSelectedSport] = useState<Sport>("football");
  const [selectedLeague, setSelectedLeague] = useState<string>("All");
  const [selectedRatio, setSelectedRatio] = useState<Ratio>("16:9");
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

  const availableLeagues = React.useMemo(() => {
    const matches = MOCK_MATCHES.filter(m => m.sport === selectedSport);
    const leagues = new Set(matches.map(m => m.league).filter(Boolean));
    return ["All", ...Array.from(leagues)];
  }, [selectedSport]);

  useEffect(() => {
    setSelectedLeague("All");
  }, [selectedSport]);

  const filteredMatches = MOCK_MATCHES.filter(m => m.sport === selectedSport);
  const filteredTemplates = templates.filter(t => t.sport === selectedSport && t.ratio === selectedRatio);
  const tab2Templates = templates.filter(t => t.sport === selectedSport);

  const batchGenerate = () => {
    if (activeMatch && filteredTemplates.length > 0) {
      useEditorStore.getState().createBatchSessions(activeMatch, filteredTemplates);
    }
  };

  useEffect(() => {
    if (!activeMatch && filteredMatches.length > 0) {
       setEditorMatch(filteredMatches[0]);
    }
  }, [activeMatch, filteredMatches, setEditorMatch]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

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
                onChange={(e) => setSelectedSport(e.target.value as Sport)}
                className="bg-black/20 border border-app-border rounded px-2 py-1 text-white outline-none focus:border-app-accent text-[11px]"
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
                className="bg-black/20 border border-app-border rounded px-2 py-1 text-white outline-none focus:border-app-accent text-[11px]"
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
             className="text-app-muted hover:text-white transition-colors p-1.5 mr-2"
             title="Settings"
          >
             <Settings size={18} />
          </button>
          
          <div className="w-px h-4 bg-app-border mx-2"></div>
          
          <div className="flex items-center gap-2 mr-4">
            <button 
              onClick={undo}
              disabled={!canUndo()}
              className="text-app-muted hover:text-white disabled:opacity-30 disabled:hover:text-app-muted transition-colors p-1"
              title="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button 
              onClick={redo}
              disabled={!canRedo()}
              className="text-app-muted hover:text-white disabled:opacity-30 disabled:hover:text-app-muted transition-colors p-1"
              title="Redo"
            >
              <Redo2 size={16} />
            </button>
          </div>
          <button className="text-[10px] font-bold text-app-muted hover:text-white px-3 py-1.5 transition-colors uppercase tracking-wider">
            Save
          </button>
          <button 
            onClick={batchGenerate}
            disabled={!activeMatch || filteredTemplates.length === 0}
            className="text-[10px] font-bold text-app-text bg-white/10 hover:bg-white/20 disabled:opacity-30 px-4 py-1.5 rounded transition-all uppercase tracking-wider"
          >
            Batch Generate
          </button>
          <button 
            onClick={() => editorRef.current?.exportPNG()}
            className="text-[10px] font-bold text-black bg-white hover:bg-gray-200 px-4 py-1.5 rounded transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.1)] uppercase tracking-wider"
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
              className="p-2 text-app-muted hover:text-white hover:bg-white/5 rounded-md transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen size={18} />
            </button>
            <div className="w-6 h-[1px] bg-app-border"></div>
            <div className="flex flex-col gap-4">
              <button onClick={() => { setLeftExpanded(true); setActiveLeftTab('matches'); }} className="p-2 text-app-muted hover:text-white hover:bg-white/5 rounded-md transition-colors" title="Matches">
                <Calendar size={18} />
              </button>
              <button onClick={() => { setLeftExpanded(true); setActiveLeftTab('templates'); }} className="p-2 text-app-muted hover:text-white hover:bg-white/5 rounded-md transition-colors" title="Templates">
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
               setEditorTemplate={setEditorTemplate}
               activeTemplate={activeTemplate}
               activeMatch={activeMatch}
               setEditorMatch={setEditorMatch}
               setIsModalOpen={setIsModalOpen}
            />
         )}

        {/* MAIN PANEL: Workspace with Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
          {/* TAB BAR */}
          <div className="flex h-[36px] border-b border-app-border bg-[#050505] overflow-x-auto shrink-0 select-none">
             {sessions.map(session => (
               <div 
                 key={session.id}
                 onClick={() => useEditorStore.getState().setActiveSession(session.id)}
                 className={cn(
                   "flex items-center justify-between min-w-[140px] max-w-[200px] px-3 border-r border-app-border cursor-pointer transition-colors group",
                   activeSessionId === session.id 
                     ? "bg-app-bg text-white border-t-2 border-t-app-accent" 
                     : "text-app-muted hover:bg-[#111] border-t-2 border-t-transparent"
                 )}
               >
                 <span className="text-[11px] font-medium truncate flex-1 leading-none">{session.name}</span>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     useEditorStore.getState().closeSession(session.id);
                   }}
                   className={cn(
                     "ml-2 shrink-0 p-0.5 rounded-sm hover:bg-white/10 transition-colors",
                     activeSessionId === session.id ? "text-white" : "text-app-muted group-hover:text-white"
                   )}
                 >
                   <PanelLeftClose className="w-3 h-3 rotate-45" />
                 </button>
               </div>
             ))}
             <button 
               onClick={() => useEditorStore.getState().addSession()}
               className="h-full px-4 flex items-center justify-center text-app-muted hover:text-white hover:bg-white/5 transition-colors border-r border-app-border"
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
    </div>
  );
}
