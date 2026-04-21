import React, { useState, useRef } from "react";
import { useEditorStore } from "./stores/editorStore";
import { LeftSidebar } from "./components/LeftSidebar";
import EditorWorkspace from "./components/Editor/EditorWorkspace";
import { SettingsModal } from "./components/settings/SettingsModal";
import PasteTemplateModal from "./components/PasteTemplateModal";
import { MOCK_TEMPLATES } from "./lib/mockData";
import { Sport, Ratio } from "./types/template";
import { 
  Settings, 
  Layout, 
  ChevronDown,
  AlertTriangle
} from "lucide-react";
import { useSettingsStore } from "./stores/settingsStore";
import { applyTheme } from "./lib/themeUtils";
import { cn } from "./lib/utils";
import { useTranslation } from "./lib/i18n";

export default function App() {
  const { t } = useTranslation();
  const [activeLeftTab, setActiveLeftTab] = useState<'matches' | 'templates'>('matches');
  const [selectedSport, setSelectedSport] = useState<Sport>('football');
  const [selectedRatio, setSelectedRatio] = useState<Ratio | "All">('All');
  const [selectedLeague, setSelectedLeague] = useState("All");
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  const [showConfirmRestart, setShowConfirmRestart] = useState<{ template: any } | null>(null);

  const { 
    sessions, 
    activeSessionId, 
    setActiveSession, 
    addSession, 
    closeSession,
    setTemplate,
    setMatch
  } = useEditorStore();

  const { settings, toggleModal } = useSettingsStore();

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const editorRef = useRef<any>(null);

  const handleSportChange = (sport: Sport) => {
    setSelectedSport(sport);
    
    // Logic from AGENTS.md: Changing the sport dropdown must NOT close the current tab.
    // 1. Search for an existing tab for the chosen sport (where match or template matches).
    const existingSession = sessions.find(s => 
      (s.template && s.template.sport === sport) || 
      (s.match && s.match.sport === sport)
    );
    
    if (existingSession) {
      setActiveSession(existingSession.id);
      return;
    }

    // 2. Search for an existing Empty Tab ("Untouched" session: no match, no template, no history)
    const emptySession = sessions.find(s => 
      !s.template && 
      !s.match && 
      s.historyIndex === -1 && 
      Object.keys(s.elementOverrides).length === 0
    );
    
    if (emptySession) {
      setActiveSession(emptySession.id);
      return;
    }

    // 3. Create a new "Untitled Graphic" session
    const newId = addSession();
    setActiveSession(newId);
  };

  const handleSetTemplate = (template: any) => {
    // 1. Get latest state
    const state = useEditorStore.getState();
    const current = state.sessions.find(s => s.id === state.activeSessionId);

    if (!current) {
      setTemplate(template);
      return;
    }

    // 2. Comprehensive dirty check
    const isModified = Object.keys(current.elementOverrides).length > 0 || 
                      Object.keys(current.manualInputs).length > 0 ||
                      current.historyIndex >= 0;

    if (isModified) { 
      setShowConfirmRestart({ template });
    } else {
      setTemplate(template);
    }
  };

  const confirmSwitch = () => {
    if (showConfirmRestart) {
      setTemplate(showConfirmRestart.template);
      setShowConfirmRestart(null);
    }
  };

  const openInNewTab = () => {
    if (showConfirmRestart) {
      addSession();
      setTemplate(showConfirmRestart.template);
      setShowConfirmRestart(null);
    }
  };

  const handleSetMatch = (match: any) => {
    // Switching matches doesn't necessarily wipe overrides in the current logic, 
    // but usually user wants a clean slate or at least to be aware.
    // However, setMatch in store ONLY updates match. 
    // If the user wants to switch context completely, they usually switch templates too.
    setMatch(match);
  };

  // Sync sport dropdown when active session changes
  React.useEffect(() => {
    if (activeSession?.template?.sport) {
      setSelectedSport(activeSession.template.sport);
    } else if (activeSession?.match?.sport) {
      setSelectedSport(activeSession.match.sport);
    }
  }, [activeSessionId, activeSession?.template?.id, activeSession?.match?.id]);

  // Apply theme when settings change
  React.useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  return (
    <div className="h-screen w-screen bg-[#050505] overflow-hidden flex flex-col font-sans select-none">
      {/* Top Header / App Bar - Row 1 */}
      <header className="h-[44px] border-b border-app-border shrink-0 px-4 flex items-center justify-between bg-app-sidebar relative z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 pr-4 border-r border-app-border">
            <div className="w-6 h-6 bg-app-accent rounded flex items-center justify-center shadow-[0_0_15px_rgba(var(--app-accent-rgb),0.2)]">
              <span className="text-black font-[900] text-[12px] italic">RP</span>
            </div>
            <h1 className="text-[12px] font-[900] text-app-text tracking-tight flex items-center gap-1 leading-none uppercase">
              REDPANDA <span className="text-app-accent font-bold">FORGE</span>
            </h1>
          </div>

          <div className="flex items-center bg-app-bg px-2 rounded h-7 border border-app-border">
            <Layout size={12} className="text-app-muted mr-2" />
            <select 
              value={selectedSport}
              onChange={(e) => handleSportChange(e.target.value as Sport)}
              className="bg-transparent text-[10px] font-bold text-app-text outline-none cursor-pointer uppercase tracking-wider pr-1"
            >
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="tennis">Tennis</option>
              <option value="esports">Esports</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => toggleModal(true)}
            className="w-8 h-8 flex items-center justify-center text-app-muted hover:text-app-text hover:bg-app-card rounded-md transition-colors"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar 
          selectedSport={selectedSport}
          selectedRatio={selectedRatio}
          selectedLeague={selectedLeague}
          activeLeftTab={activeLeftTab}
          setActiveLeftTab={setActiveLeftTab}
          setSelectedRatio={setSelectedRatio}
          templates={MOCK_TEMPLATES}
          setEditorTemplate={handleSetTemplate}
          activeTemplate={activeSession?.template}
          activeMatch={activeSession?.match}
          setEditorMatch={handleSetMatch}
          setIsModalOpen={setIsImportOpen}
        />
        
        <EditorWorkspace ref={editorRef} />
      </div>

      <SettingsModal />
      <PasteTemplateModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)}
        onSave={(tpl) => handleSetTemplate(tpl)}
        existingTemplates={MOCK_TEMPLATES}
      />

      {/* Modern Confirmation Dialog for Template Switch */}
      {showConfirmRestart && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-app-sidebar border border-app-border w-full max-w-[400px] p-6 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-app-accent mb-4">
              <AlertTriangle size={24} />
              <h2 className="text-lg font-bold text-app-text tracking-tight uppercase">{t.modals.templateSwitch.header}</h2>
            </div>
            
            <p className="text-app-muted text-sm leading-relaxed mb-6">
              You have manual adjustments in this session. Switching templates will <span className="text-app-text font-bold">DISCARD</span> all your edits.
            </p>

            <div className="flex flex-col gap-2">
              <button 
                onClick={openInNewTab}
                className="w-full bg-app-accent hover:bg-app-accent/90 text-app-bg font-bold py-3 rounded-lg transition-colors text-sm uppercase tracking-wider"
              >
                {t.modals.templateSwitch.openNewTab}
              </button>
              <button 
                onClick={confirmSwitch}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition-colors text-sm uppercase tracking-wider"
              >
                {t.modals.templateSwitch.discardReplace}
              </button>
              <button 
                onClick={() => setShowConfirmRestart(null)}
                className="w-full bg-app-card hover:bg-app-bg text-app-text border border-app-border font-bold py-3 rounded-lg transition-colors text-sm uppercase tracking-wider"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
