import { create } from 'zustand';
import { Template, TemplateElement, Match } from '../types/template';

interface EditorState {
  template: Template | null;
  match: Match | null;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  expandedLayers: Record<string, boolean>;
  elementOverrides: Record<string, Partial<TemplateElement>>;
  manualInputs: Record<string, string>;
  
  history: Array<{
    overrides: Record<string, Partial<TemplateElement>>,
    inputs: Record<string, string>
  }>;
  historyIndex: number;
  
  // Actions
  setTemplate: (t: Template | null) => void;
  setMatch: (m: Match | null) => void;
  setSelectedElementId: (id: string | null) => void;
  setHoveredElementId: (id: string | null) => void;
  toggleLayerExpanded: (id: string) => void;
  setElementOverride: (id: string, overrides: Partial<TemplateElement>) => void;
  setManualInput: (dataKey: string, value: string) => void;
  
  // Undo/Redo
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  template: null,
  match: null,
  selectedElementId: null,
  hoveredElementId: null,
  expandedLayers: {},
  elementOverrides: {},
  manualInputs: {},
  
  history: [],
  historyIndex: -1,

  setTemplate: (template) => {
    // Reset state on template change
    const expanded: Record<string, boolean> = {};
    if (template) {
      template.layers.forEach(l => {
        expanded[l.id] = l.expanded !== false;
      });
    }
    
    set({
      template,
      elementOverrides: {},
      manualInputs: {},
      expandedLayers: expanded,
      selectedElementId: null,
      history: [],
      historyIndex: -1
    });
  },

  setMatch: (match) => set({ match }),
  
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setHoveredElementId: (id) => set({ hoveredElementId: id }),
  
  toggleLayerExpanded: (id) => set((state) => ({
    expandedLayers: { ...state.expandedLayers, [id]: !state.expandedLayers[id] }
  })),

  setElementOverride: (id, overrides) => {
    set((state) => {
      const newState = {
        elementOverrides: {
          ...state.elementOverrides,
          [id]: {
            ...(state.elementOverrides[id] || {}),
            ...overrides,
          }
        }
      };
      return newState;
    });
  },

  setManualInput: (dataKey, value) => {
    set((state) => ({
      manualInputs: { ...state.manualInputs, [dataKey]: value }
    }));
  },

  commitHistory: () => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({
        overrides: JSON.parse(JSON.stringify(state.elementOverrides)),
        inputs: JSON.parse(JSON.stringify(state.manualInputs))
      });
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex >= 0) {
        const newIndex = state.historyIndex - 1;
        if (newIndex >= 0) {
          const prevState = state.history[newIndex];
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
      return state;
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const nextState = state.history[newIndex];
        return {
          elementOverrides: JSON.parse(JSON.stringify(nextState.overrides)),
          manualInputs: JSON.parse(JSON.stringify(nextState.inputs)),
          historyIndex: newIndex,
          selectedElementId: null
        };
      }
      return state;
    });
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
}));
