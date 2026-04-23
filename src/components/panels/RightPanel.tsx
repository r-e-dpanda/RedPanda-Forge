import React from "react";
import { cn } from "../../lib/utils";
import { PanelRightClose } from "lucide-react";
import { useTranslation } from "../../lib/i18n";
import { useEditorStore } from "../../stores/editorStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { getUISizes } from "../../constants/ui";
import { Button } from "@/components/ui/button";

import { DataTab } from "./DataTab";
import { DesignTab } from "./DesignTab";

interface RightPanelProps {
  rightExpanded: boolean;
  setRightExpanded: (val: boolean) => void;
  activeRightTab: 'data' | 'design';
  setActiveRightTab: (val: 'data' | 'design') => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  rightExpanded,
  setRightExpanded,
  activeRightTab,
  setActiveRightTab
}) => {
  const { t } = useTranslation();
  const { settings } = useSettingsStore();
  const { uiScale } = settings;
  const ui = getUISizes(uiScale);
  
  const { 
    sessions, 
    activeSessionId,
    setHoveredElementId,
    setSelectedElementId,
    setElementOverride,
    setManualInput,
    toggleLayerExpanded,
    commitHistory
  } = useEditorStore();

  const activeSession = sessions.find(s => s.id === activeSessionId);
  if (!rightExpanded) return null;

  const template = activeSession?.template || null;
  const match = activeSession?.match || null;
  const manualInputs = activeSession?.manualInputs || {};
  const elementOverrides = activeSession?.elementOverrides || {};
  const selectedElementId = activeSession?.selectedElementId || null;
  const hoveredElementId = activeSession?.hoveredElementId || null;
  const expandedLayers = activeSession?.expandedLayers || {};

  // Formatter input state (moved here to share if needed, but mainly for DesignTab)
  const [pendingFormatter, setPendingFormatter] = React.useState<{ type: string; label: string; find?: string } | null>(null);
  const [formatterInput, setFormatterInput] = React.useState("");

  const handleOverride = (id: string, overrides: any) => {
    setElementOverride(id, overrides);
    commitHistory();
  };

  // Flatten and normalize elements for easier logic in tabs
  let flatElements: any[] = [];
  if (template) {
    template.layers.forEach((layer: any) => {
      const els = layer.elements || layer.children || [];
      els.forEach((el: any) => {
        flatElements.push({
          ...el,
          x: el.position?.x ?? el.x ?? 0,
          y: el.position?.y ?? el.y ?? 0,
          width: el.size?.width ?? el.width ?? 100,
          height: el.size?.height ?? el.height ?? 100,
          rotation: el.rotation ?? 0,
          fill: el.style?.fill ?? el.fill ?? '#ffffff',
          fontSize: el.style?.fontSize ?? el.fontSize ?? 20,
          fontFamily: el.style?.fontFamily ?? el.fontFamily ?? 'Inter',
          fontWeight: el.style?.fontWeight ?? el.fontWeight ?? 'normal',
          lineHeight: el.style?.lineHeight ?? el.lineHeight ?? 1,
          letterSpacing: el.style?.letterSpacing ?? el.letterSpacing ?? 0,
          cornerRadius: el.style?.cornerRadius ?? el.cornerRadius ?? 0,
          opacity: el.opacity ?? 1,
          align: el.style?.align ?? el.align ?? 'left',
          stroke: el.style?.stroke ?? el.stroke ?? '#000000',
          strokeWidth: el.style?.strokeWidth ?? el.strokeWidth ?? 0,
          shadowEnabled: (el.style?.shadowEnabled ?? el.shadow !== undefined) || false,
          shadowColor: el.style?.shadowColor ?? el.shadow?.color ?? '#000000',
          shadowBlur: el.style?.shadowBlur ?? el.shadow?.blur ?? 5,
          shadowOffsetX: el.style?.shadowOffsetX ?? el.shadow?.offsetX ?? 0,
          shadowOffsetY: el.style?.shadowOffsetY ?? el.shadow?.offsetY ?? 0,
          shadowOpacity: el.style?.shadowOpacity ?? el.shadow?.opacity ?? 0.5,
          bgEnabled: el.style?.bgEnabled ?? false,
          bgColor: el.style?.bgColor ?? '#000000',
          bgPadding: el.style?.bgPadding ?? 10,
          bgRadius: el.style?.bgRadius ?? 0
        });
      });
    });
  }

  const elementsWithBinding = flatElements.filter(el => {
    if (el.dataKey) return true;
    const text = (el as any).text;
    if (typeof text === 'string' && text.includes('{{')) return true;
    const fill = (el as any).style?.fill;
    if (typeof fill === 'string' && fill.includes('{{')) return true;
    const src = (el as any).src;
    if (typeof src === 'string' && src.includes('{{')) return true;
    return false;
  }).map(el => {
    let dataKey = el.dataKey;
    if (!dataKey) {
      const text = (el as any).text;
      if (typeof text === 'string' && text.includes('{{')) {
        const match = text.match(/{{([^}]+)}}/);
        if (match) dataKey = match[1].split('|')[0].trim();
      }
      if (!dataKey) {
        const fill = (el as any).style?.fill;
        if (typeof fill === 'string' && fill.includes('{{')) {
          const match = fill.match(/{{([^}]+)}}/);
          if (match) dataKey = match[1].split('|')[0].trim();
        }
      }
      if (!dataKey) {
        const src = (el as any).src;
        if (typeof src === 'string' && src.includes('{{')) {
          const match = src.match(/{{([^}]+)}}/);
          if (match) dataKey = match[1].split('|')[0].trim();
        }
      }
    }
    return { ...el, dataKey };
  });

  return (
    <aside className="w-[21.25rem] bg-app-sidebar border-l border-app-border flex flex-col shrink-0 h-full z-10 transition-all font-sans relative">

      {/* ── Panel tab bar ─────────────────────────────────────────────── */}
      <div className="flex bg-app-sidebar h-[2.75rem] shrink-0 border-b border-app-border">
        <button
          onClick={() => setActiveRightTab('data')}
          className={cn(
            "flex-1 text-ui-base font-medium transition-colors border-b-2 h-full",
            activeRightTab === 'data'
              ? "border-app-accent text-app-text"
              : "border-transparent text-app-muted hover:text-app-text hover:bg-app-card"
          )}
        >
          {t.panels.tabs.match}
        </button>
        <button
          onClick={() => setActiveRightTab('design')}
          className={cn(
            "flex-1 text-ui-base font-medium transition-colors border-b-2 h-full",
            activeRightTab === 'design'
              ? "border-app-accent text-app-text"
              : "border-transparent text-app-muted hover:text-app-text hover:bg-app-card"
          )}
        >
          {t.panels.tabs.design}
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setRightExpanded(false)}
          className="h-full w-[44px] rounded-none hover:bg-app-card text-app-muted border-l border-app-border"
        >
          <PanelRightClose size={ui.icon.sm} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto w-[340px]">
        {activeRightTab === 'data' && (
          <DataTab 
            match={match}
            template={template}
            activeSession={activeSession}
            elementsWithBinding={elementsWithBinding}
            manualInputs={manualInputs}
            setManualInput={setManualInput}
            setHoveredElementId={setHoveredElementId}
            commitHistory={commitHistory}
            elementOverrides={elementOverrides}
          />
        )}

        {activeRightTab === 'design' && (
          <DesignTab 
            template={template}
            activeSession={activeSession}
            selectedElementId={selectedElementId}
            hoveredElementId={hoveredElementId}
            flatElements={flatElements}
            elementOverrides={elementOverrides}
            expandedLayers={expandedLayers}
            match={match}
            manualInputs={manualInputs}
            setSelectedElementId={setSelectedElementId}
            setHoveredElementId={setHoveredElementId}
            handleOverride={handleOverride}
            toggleLayerExpanded={toggleLayerExpanded}
            t={t}
            ui={ui}
            pendingFormatter={pendingFormatter}
            setPendingFormatter={setPendingFormatter}
            formatterInput={formatterInput}
            setFormatterInput={setFormatterInput}
          />
        )}
      </div>
    </aside>
  );
};

export default RightPanel;
