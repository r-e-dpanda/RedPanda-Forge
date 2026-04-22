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
      header: "Available Matches",
      selectTemplateFirst: "Select Template First",
      noMatchesFound: "No matches found for the current filters."
    },
    templates: {
      importBtn: "Import JSON Template",
      noTemplates: "No templates in library",
      useTemplate: "Use Template"
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
        confirm: "Discard Changes & Close"
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
      header: "Unsaved Work Detected",
      description: "You have manual adjustments in this session. Switching templates will {discard} DISCARD {/discard} all your edits.",
      openNewTab: "Open in New Tab",
      discardReplace: "Discard & Replace current"
    }
  },
  panels: {
    tabs: {
      match: "Match",
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
      sourceBindingPath: "Source - Binding Path",
      source: "Source",
      valueBindingPath: "Value - Binding Path",
      value: "Value",
      transform: "Transform",
      clear: "Clear",
      addPipeline: "+ Add Pipeline...",
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
