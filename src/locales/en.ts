export const strings = {
  common: {
    cancel: "Cancel",
    save: "Save",
    reset: "Reset",
    close: "Close",
    export: "Export",
    import: "Import",
    open: "Open",
    delete: "Delete",
    edit: "Edit",
    untitled: "Untitled graphic",
    all: "All"
  },
  settings: {
    header: "App Settings",
    tabs: {
      general: "General Preference",
      paths: "Workspace Paths"
    },
    appearance: {
      title: "Appearance",
      description: "Select your preferred workspace theme for optimal focus.",
      themeLibrary: "Theme Library",
      typography: "Typography & Scale",
      typographyDesc: "Adjust interface size for screen density & preference.",
      uiScale: "UI Scale",
      currentBase: "Current base",
      language: "Language",
      languageDesc: "Select display language for workspace UI."
    },
    paths: {
      title: "Storage Locations",
      description: "Configure folders.",
      assetsRoot: "Assets",
      templatesRoot: "Templates"
    },
    saveConfig: "Save Settings",
    ready: "Ready to work."
  },
  sidebar: {
    tabs: {
      matches: "Matches",
      templates: "Templates"
    },
    filters: {
      ratio: "Ratio",
      template: "Template",
      allRatios: "All Ratios"
    },
    matches: {
      header: "Matches",
      selectTemplateFirst: "Select Template First",
      noMatchesFound: "No matches found."
    },
    templates: {
      importBtn: "Import JSON",
      noTemplates: "No templates",
      useTemplate: "Use"
    }
  },
  workspace: {
    tabs: {
      untitled: "Untitled graphic"
    },
    modals: {
      closeTab: {
        header: "Close Tab?",
        description: "This graphic has {changes} UNSAVED CHANGES {/changes}. Closing this tab will permanently discard all your adjustments.",
        confirm: "Discard & Close"
      }
    },
    actions: {
      export: "Export",
      undo: "Undo",
      redo: "Redo",
      newGraphic: "New Graphic"
    }
  },
  modals: {
    templateSwitch: {
      header: "Switch Template",
      description: "You have unsaved changes. Switching templates will {discard} DISCARD {/discard} all your edits.",
      openNewTab: "Open in New Tab",
      discardReplace: "Discard & Replace"
    }
  },
  panels: {
    tabs: {
      match: "Data",
      design: "Design",
      layers: "Layers"
    },
    sections: {
      content: "Content",
      layout: "Layout",
      fill: "Fill",
      appearance: "Appearance",
      outline: "Outline",
      shadow: "Shadow",
      typography: "Typography",
      background: "Background",
      layers: "Layers"
    },
    fields: {
      sourceBindingPath: "Source Binding",
      source: "Source",
      valueBindingPath: "Value Binding",
      value: "Value",
      transform: "Transform",
      clear: "Clear",
      addPipeline: "+ Pipeline",
      reset: "Reset",
      enable: "Enable",
      opacity: "Opacity",
      width: "Width",
      height: "Height",
      color: "Color",
      blur: "Blur",
      offsetX: "Offset X",
      offsetY: "Offset Y",
      fontFamily: "Font Family",
      weight: "Weight",
      size: "Size",
      lineHeight: "Line Height",
      letterSpacing: "Spacing",
      cornerRadius: "Corner Radius",
      padding: "Padding",
      radius: "Radius",
      skewX: "Skew X",
      topWidth: "Top Width",
      align: "Align",
      rotation: "Rotation",
      mirroring: "Mirroring",
      flipX: "Flip X",
      flipY: "Flip Y",
      venue: "Venue",
      date: "Date",
      kickoff: "Kickoff",
      matchup: "Matchup",
      details: "Details",
      dataSources: "Data Sources",
      layerGroups: "Layer Groups",
      backToLayers: "Back to Layers"
    }
  }
};

export type LocaleStrings = typeof strings;
