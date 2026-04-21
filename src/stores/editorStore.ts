import { create } from 'zustand';
import { Template, TemplateElement, Match } from '../types/template';
import { v4 as uuidv4 } from 'uuid';
import { normalizeTemplate } from '../lib/shapeUtils';

export interface WorkflowSession {
  id: string;
  name: string;
  template: Template | null;
  match: Match | null;
  elementOverrides: Record<string, Partial<TemplateElement>>;
  manualInputs: Record<string, string>;
  expandedLayers: Record<string, boolean>;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  
  history: Array<{
    overrides: Record<string, Partial<TemplateElement>>,
    inputs: Record<string, string>
  }>;
  historyIndex: number;
}

interface EditorState {
  sessions: WorkflowSession[];
  activeSessionId: string | null;
  
  // Actions targeting ACTIVE SESSION
  addSession: (name?: string) => string;
  createBatchSessions: (match: Match, templates: Template[]) => void;
  closeSession: (id: string) => void;
  renameSession: (id: string, name: string) => void;
  setActiveSession: (id: string) => void;
  
  setTemplate: (t: Template | null) => void;
  setMatch: (m: Match | null) => void;
  setSelectedElementId: (id: string | null) => void;
  setHoveredElementId: (id: string | null) => void;
  toggleLayerExpanded: (id: string) => void;
  setElementOverride: (id: string, overrides: Partial<TemplateElement>) => void;
  setManualInput: (dataKey: string, value: string) => void;
  
  // Undo/Redo (Applies to mapped active session)
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const createDefaultSession = (name?: string): WorkflowSession => ({
  id: uuidv4(),
  name: name || "Untitled graphic",
  template: null,
  match: null,
  elementOverrides: {},
  manualInputs: {},
  expandedLayers: {},
  selectedElementId: null,
  hoveredElementId: null,
  history: [],
  historyIndex: -1
});

export const useEditorStore = create<EditorState>((set, get) => {
  
  const updateActiveSession = (updater: (session: WorkflowSession) => Partial<WorkflowSession>) => {
    set((state) => {
      const activeId = state.activeSessionId;
      if (!activeId) return state;
      
      const newSessions = state.sessions.map(s => {
        if (s.id === activeId) {
          return { ...s, ...updater(s) };
        }
        return s;
      });
      return { sessions: newSessions };
    });
  };

  const getActiveSession = () => {
    const state = get();
    return state.sessions.find(s => s.id === state.activeSessionId) || null;
  };

  // Initial Boot
  const initId = uuidv4();

  return {
    sessions: [
      {
        ...createDefaultSession(),
        id: initId
      }
    ],
    activeSessionId: initId,

    addSession: (name) => {
      const state = get();
      let finalName = name || "Untitled graphic";
      
      if (!name) {
        const existingUntitled = state.sessions
          .map(s => s.name)
          .filter(n => n === "Untitled graphic" || n.startsWith("Untitled graphic - "));
        
        if (existingUntitled.length > 0) {
          let highest = 0;
          let hasBase = false;
          existingUntitled.forEach(n => {
            if (n === "Untitled graphic") {
              hasBase = true;
            } else {
              const match = n.match(/Untitled graphic - (\d+)/);
              if (match) {
                const num = parseInt(match[1]);
                if (num > highest) highest = num;
              }
            }
          });
          
          if (hasBase && highest === 0) {
            finalName = "Untitled graphic - 1";
          } else if (highest > 0) {
            finalName = `Untitled graphic - ${highest + 1}`;
          } else if (!hasBase) {
            finalName = "Untitled graphic";
          }
        }
      }

      const newSession = createDefaultSession(finalName);
      set((state) => ({
        sessions: [...state.sessions, newSession],
        activeSessionId: newSession.id
      }));
      return newSession.id;
    },

    createBatchSessions: (match, templates) => {
      set((state) => {
        const newSessions = templates.map(t => {
          const template = normalizeTemplate(t);
          return {
            ...createDefaultSession(),
            id: uuidv4(),
            name: `${template.name} - ${match.homeTeam?.shortName || match.player1?.name} vs ${match.awayTeam?.shortName || match.player2?.name}`,
            template,
            match
          };
        });
        
        // Remove empty default tabs if there's only one and it has no template/match
        const existingSessions = state.sessions.length === 1 && !state.sessions[0].template && !state.sessions[0].match 
          ? [] 
          : state.sessions;

        return {
          sessions: [...existingSessions, ...newSessions],
          activeSessionId: newSessions[0].id // Jump to the first created one
        };
      });
    },

    closeSession: (id) => {
      set((state) => {
        const idx = state.sessions.findIndex(s => s.id === id);
        if (idx === -1) return state;
        
        const newSessions = state.sessions.filter(s => s.id !== id);
        
        // If last tab closed, auto-create a new one
        if (newSessions.length === 0) {
          const fresh = createDefaultSession("Untitled graphic");
          return { sessions: [fresh], activeSessionId: fresh.id };
        }
        
        let newActiveId = state.activeSessionId;
        if (state.activeSessionId === id) {
          newActiveId = newSessions[Math.min(idx, newSessions.length - 1)].id;
        }
        
        return { sessions: newSessions, activeSessionId: newActiveId };
      });
    },

    renameSession: (id, name) => set((state) => ({
      sessions: state.sessions.map(s => s.id === id ? { ...s, name } : s)
    })),

    setActiveSession: (id) => set({ activeSessionId: id }),

    setTemplate: (templateInput) => {
      const template = templateInput ? normalizeTemplate(templateInput) : null;
      updateActiveSession((sess) => {
        const expanded: Record<string, boolean> = {};
        if (template) {
          template.layers.forEach(l => {
            expanded[l.id] = l.expanded !== false;
          });
        }
        
        // Logic from USER: Tab should stay "Untitled graphic" when template is set for the first time
        // or keep current name if user manually renamed it.
        const currentName = sess.name;
        const isDefault = currentName === "Untitled Graphic" || currentName === "Untitled graphic";
        
        return {
          template,
          elementOverrides: {},
          manualInputs: {},
          expandedLayers: expanded,
          selectedElementId: null,
          history: [],
          historyIndex: -1,
          name: isDefault ? "Untitled graphic" : currentName
        };
      });
    },

    setMatch: (match) => updateActiveSession(() => ({ match })),
    setSelectedElementId: (id) => updateActiveSession(() => ({ selectedElementId: id })),
    setHoveredElementId: (id) => updateActiveSession(() => ({ hoveredElementId: id })),
    
    toggleLayerExpanded: (id) => updateActiveSession((sess) => ({
      expandedLayers: { ...sess.expandedLayers, [id]: !sess.expandedLayers[id] }
    })),

    setElementOverride: (id, overrides) => updateActiveSession((sess) => ({
      elementOverrides: {
        ...sess.elementOverrides,
        [id]: {
          ...(sess.elementOverrides[id] || {}),
          ...overrides,
        }
      }
    })),

    setManualInput: (dataKey, value) => updateActiveSession((sess) => ({
      manualInputs: { ...sess.manualInputs, [dataKey]: value }
    })),

    commitHistory: () => updateActiveSession((sess) => {
      const newHistory = sess.history.slice(0, sess.historyIndex + 1);
      newHistory.push({
        overrides: JSON.parse(JSON.stringify(sess.elementOverrides)),
        inputs: JSON.parse(JSON.stringify(sess.manualInputs))
      });
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    }),

    undo: () => updateActiveSession((sess) => {
      if (sess.historyIndex >= 0) {
        const newIndex = sess.historyIndex - 1;
        if (newIndex >= 0) {
          const prevState = sess.history[newIndex];
          return {
            elementOverrides: JSON.parse(JSON.stringify(prevState.overrides)),
            manualInputs: JSON.parse(JSON.stringify(prevState.inputs)),
            historyIndex: newIndex,
            selectedElementId: null
          };
        } else {
          return {
            elementOverrides: {},
            manualInputs: {},
            historyIndex: -1,
            selectedElementId: null
          };
        }
      }
      return {};
    }),

    redo: () => updateActiveSession((sess) => {
      if (sess.historyIndex < sess.history.length - 1) {
        const newIndex = sess.historyIndex + 1;
        const nextState = sess.history[newIndex];
        return {
          elementOverrides: JSON.parse(JSON.stringify(nextState.overrides)),
          manualInputs: JSON.parse(JSON.stringify(nextState.inputs)),
          historyIndex: newIndex,
          selectedElementId: null
        };
      }
      return {};
    }),

    canUndo: () => {
      const sess = getActiveSession();
      return sess ? sess.historyIndex >= 0 : false;
    },
    canRedo: () => {
      const sess = getActiveSession();
      return sess ? sess.historyIndex < sess.history.length - 1 : false;
    },
  };
});
