import React from "react";
import { cn } from "../../lib/utils";
import { PanelRightClose, Layers, Eye, EyeOff, FolderOpen, Folder, ChevronRight, ChevronLeft, Type, Square, Image as LucideImage, Upload, RotateCcw, AlertTriangle, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useTranslation } from "../../lib/i18n";
import { useEditorStore } from "../../stores/editorStore";
import { resolveBoundData, isAutoResolved } from "../../lib/templateEngine";
import { useSettingsStore } from "../../stores/settingsStore";
import { getUISizes } from "../../constants/ui";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface RightPanelProps {
  rightExpanded: boolean;
  setRightExpanded: (val: boolean) => void;
  activeRightTab: 'data' | 'design';
  setActiveRightTab: (val: 'data' | 'design') => void;
}

// ─── Shared sub-components ───────────────────────────────────────────────────

/** Section with a subtle heading — no uppercase, medium weight only */
const PropertySection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={cn("space-y-4 pb-6 border-b border-app-border/40 last:border-0", className)}>
    <h4 className="text-ui-sm font-medium text-app-text leading-none tracking-normal">{title}</h4>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

/** Field label — muted, regular weight, never uppercase */
const FieldLabel: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
  <div className="flex justify-between items-center mb-1.5">
    <label className="text-ui-micro text-app-muted font-normal leading-none">{children}</label>
    {action}
  </div>
);

/** Inline reset link — accent color, small, understated */
const ResetLink: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = "Reset" }) => (
  <button onClick={onClick} className="text-ui-micro text-app-accent hover:underline font-normal">
    {label}
  </button>
);

/** Unified Color Picker with Hex and Alpha support */
const UnifiedColorPicker: React.FC<{ 
  label: string; 
  value: string | undefined; 
  onChange: (val: string | undefined) => void;
  action?: React.ReactNode;
  placeholder?: string;
}> = ({ label, value, onChange, action, placeholder = "FFFFFF" }) => {
  const valStr = typeof value === 'string' ? value : "";
  const hexPart = valStr.startsWith('#') ? valStr.substring(0, 7).toUpperCase() : (valStr || "#FFFFFF").toUpperCase();
  const alphaPercent = valStr.length === 9 && valStr.startsWith('#')
    ? Math.round((parseInt(valStr.substring(7, 9), 16) / 255) * 100)
    : 100;

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim().toUpperCase();
    if (!raw) { onChange(undefined); return; }
    let hex = raw.startsWith('#') ? raw : `#${raw}`;
    if (hex.length > 7) hex = hex.substring(0, 7);
    
    const curAlpha = valStr.length === 9 ? valStr.substring(7, 9) : 'FF';
    onChange(curAlpha === 'FF' ? hex : `${hex}${curAlpha}`);
  };

  const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = parseInt(e.target.value);
    if (isNaN(v)) v = 100;
    v = Math.max(0, Math.min(100, v));
    const aHex = Math.round((v / 100) * 255).toString(16).padStart(2, '0').toUpperCase();
    const base = valStr.startsWith('#') ? valStr.substring(0, 7) : (valStr || "#FFFFFF");
    onChange(aHex === 'FF' ? base : `${base}${aHex}`);
  };

  return (
    <div>
      <FieldLabel action={action}>{label}</FieldLabel>
      <div className="flex bg-app-bg border border-app-border rounded-md overflow-hidden h-8 group focus-within:border-app-accent/50 transition-colors">
        <div className="relative w-8 shrink-0 flex items-center justify-center border-r border-app-border cursor-pointer bg-app-sidebar/30">
          <div
            className="w-4 h-4 rounded-sm shadow-sm border border-black/10"
            style={{ backgroundColor: hexPart.length === 7 ? hexPart : '#FFFFFF' }}
          />
          <input
            type="color"
            value={hexPart.length === 7 ? hexPart : '#FFFFFF'}
            onChange={e => {
              const curAlpha = valStr.length === 9 ? valStr.substring(7, 9) : 'FF';
              onChange(e.target.value.toUpperCase() + (curAlpha === 'FF' ? '' : curAlpha));
            }}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
        </div>
        <input
          value={hexPart.replace('#', '')}
          onChange={handleHexChange}
          placeholder={placeholder.replace('#', '')}
          className="flex-1 bg-transparent px-2.5 text-ui-xs font-mono outline-none text-app-text min-w-0 placeholder:text-app-muted/30"
        />
        <div className="w-[60px] flex items-center border-l border-app-border px-1.5 gap-0.5 bg-app-sidebar/10">
          <input
            type="text"
            value={alphaPercent}
            onChange={handleAlphaChange}
            className="w-full bg-transparent text-ui-xs text-right font-mono outline-none text-app-text"
          />
          <span className="text-[10px] text-app-muted font-mono mt-0.5 shrink-0 select-none">%</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const RightPanel: React.FC<RightPanelProps> = ({ rightExpanded, setRightExpanded, activeRightTab, setActiveRightTab }) => {
  const { t } = useTranslation();
  const { settings } = useSettingsStore();
  const ui = getUISizes(settings.uiScale);
  const sessions = useEditorStore(state => state.sessions);
  const activeSessionId = useEditorStore(state => state.activeSessionId);
  const activeSession = sessions.find(s => s.id === activeSessionId);

  const template = activeSession?.template || null;
  const match = activeSession?.match || null;
  const manualInputs = activeSession?.manualInputs || {};
  const elementOverrides = activeSession?.elementOverrides || {};
  const selectedElementId = activeSession?.selectedElementId || null;
  const hoveredElementId = activeSession?.hoveredElementId || null;
  const expandedLayers = activeSession?.expandedLayers || {};

  // Formatter input state
  const [pendingFormatter, setPendingFormatter] = React.useState<{ type: string; label: string; find?: string } | null>(null);
  const [formatterInput, setFormatterInput] = React.useState("");

  const {
    setHoveredElementId,
    setSelectedElementId,
    setElementOverride,
    setManualInput,
    toggleLayerExpanded,
    commitHistory
  } = useEditorStore();

  if (!rightExpanded) return null;

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

  const handleOverride = (id: string, overrides: any) => {
    setElementOverride(id, overrides);
    commitHistory();
  };

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

        {/* ════════════════════════════════════════════════════════════════
            DATA TAB
        ════════════════════════════════════════════════════════════════ */}
        {activeRightTab === 'data' && (
          <div className="p-4 overflow-y-auto w-full h-full pb-10 flex flex-col gap-5">

            {match && (
              <>
                {/* Sport + league badge */}
                <div className="flex items-center gap-2.5 bg-app-card rounded-lg border border-app-border p-3 shadow-sm">
                  <span className="bg-app-accent/15 text-app-accent px-2 py-0.5 rounded text-ui-xs font-medium capitalize">
                    {match.sport}
                  </span>
                  <span className="text-ui-sm font-medium text-app-text truncate">{match.league}</span>
                </div>

                {/* Football matchup */}
                {match.homeTeam && match.awayTeam && (
                  <div className="space-y-2">
                    <h3 className="text-ui-xs text-app-muted font-normal">{t.panels.fields.matchup}</h3>
                    <div className="flex flex-col gap-3 p-3.5 bg-app-bg rounded-lg border border-app-border">
                      <div className="flex items-center gap-3">
                        <img src={match.homeTeam.logo} className="w-6 h-6 object-contain opacity-90" alt="" />
                        <span className="text-ui-sm font-medium text-app-text">{match.homeTeam.name}</span>
                      </div>
                      <div className="text-ui-xs text-app-muted font-normal pl-9">vs</div>
                      <div className="flex items-center gap-3">
                        <img src={match.awayTeam.logo} className="w-6 h-6 object-contain opacity-90" alt="" />
                        <span className="text-ui-sm font-medium text-app-text">{match.awayTeam.name}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tennis matchup */}
                {match.player1 && match.player2 && (
                  <div className="space-y-2">
                    <h3 className="text-ui-xs text-app-muted font-normal">{t.panels.fields.matchup}</h3>
                    <div className="flex flex-col gap-3 p-3.5 bg-app-bg rounded-lg border border-app-border">
                      <div className="flex items-center gap-3">
                        <img src={match.player1.flag} className="w-6 h-4 object-cover rounded-sm" alt="" />
                        <span className="text-ui-sm font-medium text-app-text">{match.player1.name}</span>
                      </div>
                      <div className="text-ui-xs text-app-muted font-normal pl-9">vs</div>
                      <div className="flex items-center gap-3">
                        <img src={match.player2.flag} className="w-6 h-4 object-cover rounded-sm" alt="" />
                        <span className="text-ui-sm font-medium text-app-text">{match.player2.name}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Match details */}
                <div>
                  <h3 className="text-ui-xs text-app-muted font-normal mb-2.5 pb-2 border-b border-app-border/30">{t.panels.fields.details}</h3>
                  <div className="flex flex-col gap-0">
                    {match.venue && (
                      <div className="flex justify-between items-center py-2 border-b border-app-border/20">
                        <span className="text-ui-xs text-app-muted">{t.panels.fields.venue}</span>
                        <span className="text-ui-xs text-app-text font-medium">{match.venue}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-b border-app-border/20">
                      <span className="text-ui-xs text-app-muted">{t.panels.fields.date}</span>
                      <span className="text-ui-xs text-app-text font-medium">{new Date(match.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-ui-xs text-app-muted">{t.panels.fields.kickoff}</span>
                      <span className="text-ui-xs text-app-text font-medium">{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} GMT</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!match && (
              <div className="text-center text-app-muted text-ui-sm italic border border-app-border border-dashed p-5 rounded-lg bg-app-card/30">
                No match selected. Canvas will show placeholder variables.
              </div>
            )}

            {/* Data bindings list */}
            <div>
              <h3 className="text-ui-xs text-app-muted font-normal mb-3">{t.panels.fields.dataSources}</h3>
              <div className="flex flex-col gap-2">
                {elementsWithBinding.map(element => {
                  const resolverContext = {
                    packId: activeSession?.packId || "_default_pack",
                    templateId: template?.id || "fallback"
                  };
                  const resolved = resolveBoundData(element, match, manualInputs, elementOverrides[element.id], resolverContext);
                  let displayVal = 'N/A';

                  let rawBoundValue: any;
                  if (element.dataKey && match) {
                    const cleanKey = element.dataKey.replace(/^match\./, '');
                    if (cleanKey.endsWith('.colors.primary')) {
                      rawBoundValue = cleanKey.split('.').reduce((acc: any, part: string) => acc && acc[part], match) ||
                        cleanKey.replace('.colors.primary', '.color').split('.').reduce((acc: any, part: string) => acc && acc[part], match);
                    } else {
                      rawBoundValue = cleanKey.split('.').reduce((acc: any, part: string) => acc && acc[part], match);
                    }
                    if (rawBoundValue !== undefined && rawBoundValue !== null) {
                      displayVal = String(rawBoundValue);
                    }
                  }

                  if (displayVal === 'N/A') {
                    if (element.type.toLowerCase() === 'text') {
                      displayVal = resolved.text;
                    } else if (element.type.toLowerCase() === 'image' || element.type.toLowerCase() === 'backgroundimage') {
                      displayVal = resolved.src ? '[Image]' : 'N/A';
                    } else if (resolved.fill && typeof resolved.fill === 'string' && resolved.fill.startsWith('#')) {
                      displayVal = resolved.fill;
                    } else if (resolved.stroke && typeof resolved.stroke === 'string' && resolved.stroke.startsWith('#')) {
                      displayVal = resolved.stroke;
                    }
                  }

                  const isAuto = isAutoResolved(element.dataKey!, match);

                  return (
                    <div
                      key={`bind-${element.id}`}
                      className="flex flex-col gap-2 text-ui-sm p-3 rounded-lg border border-app-border bg-app-card hover:border-app-accent/40 transition-all shadow-sm"
                      onMouseEnter={() => setHoveredElementId(element.id)}
                      onMouseLeave={() => setHoveredElementId(null)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-app-muted font-mono text-ui-xs whitespace-nowrap overflow-hidden text-ellipsis mr-2">
                          {`{{${element.dataKey}}}`}
                        </span>
                        {isAuto && (
                          <span className="text-app-accent text-ui-xs font-medium text-right truncate max-w-[120px]" title={displayVal}>
                            {displayVal || "N/A"}
                          </span>
                        )}
                      </div>
                      {!isAuto && (
                        <input
                          type="text"
                          placeholder={`Enter ${element.dataKey}...`}
                          value={manualInputs[element.dataKey!] || ""}
                          onChange={(e) => {
                            setManualInput(element.dataKey!, e.target.value);
                            commitHistory();
                          }}
                          className="w-full bg-app-bg border border-app-border rounded-md p-2 text-app-text outline-none focus:border-app-accent text-ui-sm mt-0.5 h-8"
                        />
                      )}
                    </div>
                  );
                })}
                {elementsWithBinding.length === 0 && (
                  <div className="text-ui-xs text-app-muted italic text-center p-3">No bound variables in template</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            DESIGN TAB
        ════════════════════════════════════════════════════════════════ */}
        {activeRightTab === 'design' && template && (
          <div className="p-4 overflow-y-auto w-full h-full pb-10">
            {selectedElementId ? (() => {
              const el = flatElements.find(e => e.id === selectedElementId);
              if (!el) return null;
              const overrides = (elementOverrides[el.id] || {}) as any;
              const isText = el.type === 'Text' || el.type === 'text' || el.type === 'RichText';
              const isImage = el.type === 'Image' || el.type === 'image' || el.type === 'BackgroundImage';
              const isShape = el.type === 'Shape' || el.type === 'Polygon' || el.type === 'Line' || el.type === 'rect' || el.type === 'quad' || el.type === 'circle' || el.type === 'ellipse' || el.type === 'GradientOverlay' || el.type === 'Group';

              // If it's none of the above, we treat it as an image/unknown by default but we want to show properties
              const isUnknown = !isText && !isImage && !isShape;

              const shapeSubtype = (() => {
                if (!isShape) return null;
                const w = overrides.width !== undefined ? overrides.width : (el.width || 0);
                const h = overrides.height !== undefined ? overrides.height : (el.height || 0);
                const tw = overrides.topWidth !== undefined ? overrides.topWidth : (el.topWidth !== undefined ? el.topWidth : w);
                const skX = overrides.skewX !== undefined ? overrides.skewX : (el.skewX || 0);

                if (el.shapeType === 'ellipse') {
                  const rx = overrides.radiusX !== undefined ? overrides.radiusX : (el.radiusX || w / 2);
                  const ry = overrides.radiusY !== undefined ? overrides.radiusY : (el.radiusY || h / 2);
                  return Math.abs(rx - ry) < 0.01 ? "Circle" : "Ellipse";
                }
                if (el.type === 'Line') return "Line";
                if (el.type === 'Polygon') return "Polygon";
                if (el.shapeType === 'quad') {
                  const isRect = Math.abs(skX) < 0.001 && Math.abs(tw - w) < 0.001;
                  if (isRect) return Math.abs(w - h) < 0.001 ? "Square" : "Rectangle";
                  const isParallelogram = Math.abs(tw - w) < 0.001 && Math.abs(skX) > 0.001;
                  if (isParallelogram) return Math.abs(w - h) < 0.001 ? "Rhombus" : "Parallelogram";
                  if (Math.abs(tw - w) > 0.001 && Math.abs(skX) < 0.001) return "Trapezoid";
                  return "Quad";
                }
                return "Shape";
              })();

              const isEditable = (prop: string) => !el.editableProperties || el.editableProperties.includes(prop);
              const activeFormatters = overrides.formatters !== undefined ? overrides.formatters : ((el as any).formatters || []);
              const resolverContext = {
                packId: activeSession?.packId || "_default_pack",
                templateId: template?.id || "fallback"
              };
              const resolved = resolveBoundData(el, match, manualInputs, overrides, resolverContext);

              return (
                <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                  {/* Back link */}
                  <button
                    onClick={() => setSelectedElementId(null)}
                    className="flex items-center gap-1.5 text-app-muted hover:text-app-text text-ui-sm mb-5 transition-colors group"
                  >
                    <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    {t.panels.fields.backToLayers}
                  </button>

                  {/* Element header */}
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-ui-base font-medium text-app-text truncate">{el.label || el.name || 'Properties'}</h3>
                    <span className="bg-app-sidebar text-app-muted px-2 py-0.5 rounded border border-app-border text-ui-xs font-normal">
                      {isText ? 'Text' : isImage ? 'Image' : shapeSubtype || 'Layer'}
                    </span>
                  </div>

                  <div className="space-y-5">

                    {/* ── 1. CONTENT ─────────────────────────────────────── */}
                    {(isText || isImage) && (
                      <PropertySection title={t.panels.sections.content}>

                        {/* Binding path */}
                        <div>
                          <FieldLabel
                            action={
                              ((isText || isImage) && (overrides.bindingPath !== undefined || overrides.dataKey !== undefined)) && (
                                <ResetLink onClick={() => handleOverride(el.id, { bindingPath: undefined, dataKey: undefined })} />
                              )
                            }
                          >
                            {isText ? t.panels.fields.valueBindingPath : t.panels.fields.sourceBindingPath}
                          </FieldLabel>
                          <div className={cn(
                            "flex items-center bg-app-bg border rounded-md focus-within:border-app-accent overflow-hidden h-8 transition-all",
                            (isText ? resolved.errors?.text : resolved.errors?.src) ? "border-red-500/50 ring-1 ring-red-500/20" : "border-app-border"
                          )}>
                            <input
                              type="text"
                              disabled={isText ? (!isEditable('text') && !isEditable('dataKey')) : (!isEditable('src') && !isEditable('dataKey'))}
                              value={(() => {
                                if (overrides.bindingPath !== undefined) return overrides.bindingPath;
                                if (overrides.dataKey !== undefined) return `{{${overrides.dataKey}}}`;
                                if ((el as any).dataKey) return `{{${(el as any).dataKey}}}`;
                                return isText ? ((el as any).text || "") : ((el as any).src || "");
                              })()}
                              onChange={e => handleOverride(el.id, { bindingPath: e.target.value, dataKey: undefined })}
                              placeholder={isText ? "e.g. {{match.league}}" : "e.g. @global/teams/{{match.homeTeam.id}}/logo.svg"}
                              className="w-full bg-transparent h-full px-2.5 text-app-text text-ui-xs outline-none font-mono disabled:opacity-50"
                            />
                            {(isText ? resolved.errors?.text : resolved.errors?.src) && (
                              <div className="px-2 text-red-500 shrink-0" title="Key not found in data source">
                                <AlertTriangle size={14} />
                              </div>
                            )}
                          </div>
                          {/* Binding key pills */}
                          {(() => {
                            const pathValue = overrides.bindingPath !== undefined ? overrides.bindingPath :
                              (overrides.dataKey !== undefined ? `{{${overrides.dataKey}}}` :
                                ((el as any).dataKey ? `{{${(el as any).dataKey}}}` : (isText ? (el as any).text : (el as any).src)));
                            const matches = typeof pathValue === 'string' ? pathValue.match(/{{([^}]+)}}/g) : null;
                            if (!matches) return null;
                            const bindings = matches.map((m: string) => m.replace('{{', '').replace('}}', '').trim());
                            if (bindings.length === 0) return null;
                            return (
                              <div className="flex gap-1.5 items-center mt-2 flex-wrap">
                                <span className="text-ui-xs text-app-muted">Keys:</span>
                                {bindings.map((b: string, i: number) => (
                                  <span key={i} className="text-ui-xs bg-app-sidebar border border-app-border text-app-text px-2 py-0.5 rounded font-mono">
                                    {b.split('|')[0].trim()}
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Transform (formatters) */}
                        {isText && (
                          <div className="bg-app-card border border-app-border rounded-lg p-3 space-y-2.5">
                            <FieldLabel
                              action={
                                activeFormatters.length > 0 && (
                                  <ResetLink onClick={() => handleOverride(el.id, { formatters: [] })} label={t.panels.fields.clear} />
                                )
                              }
                            >
                              {t.panels.fields.transform}
                            </FieldLabel>
                            <div className="flex flex-col gap-1.5">
                              {activeFormatters.map((fmt: string, idx: number) => (
                                <div key={idx} className="flex bg-app-bg border border-app-border rounded-md text-ui-xs items-center px-2 py-1.5 group">
                                  <span className="text-app-accent font-mono mr-2 select-none">|</span>
                                  <span className="truncate flex-1 font-mono text-app-text">{fmt}</span>
                                  <button onClick={() => {
                                    const arr = [...activeFormatters];
                                    arr.splice(idx, 1);
                                    handleOverride(el.id, { formatters: arr });
                                  }} className="text-app-muted hover:text-red-400 ml-2 leading-none">×</button>
                                </div>
                              ))}
                            </div>
                            <select
                              className={cn(
                                "w-full bg-app-bg border border-app-border rounded-md px-2.5 text-app-text text-ui-xs outline-none focus:border-app-accent cursor-pointer h-8 transition-colors",
                                pendingFormatter && "opacity-40 pointer-events-none"
                              )}
                              value=""
                              onChange={(e) => {
                                const val = e.target.value;
                                if (!val) return;
                                
                                if (val === 'prefix:' || val === 'suffix:') {
                                  setPendingFormatter({ type: val, label: val === 'prefix:' ? 'Prefix' : 'Suffix' });
                                  setFormatterInput("");
                                } else if (val === 'shorten:') {
                                  setPendingFormatter({ type: val, label: 'Max Length' });
                                  setFormatterInput("10");
                                } else {
                                  handleOverride(el.id, { formatters: [...activeFormatters, val] });
                                }
                                e.target.value = "";
                              }}
                            >
                              <option value="">{t.panels.fields.addPipeline}</option>
                              
                              <optgroup label="Casing">
                                <option value="uppercase">Uppercase</option>
                                <option value="lowercase">Lowercase</option>
                                <option value="titlecase">Titlecase</option>
                              </optgroup>

                              {((el as any).dataType === 'date' || (el as any).dataType === 'date-time' || (el as any).dataType === 'time' || el.name?.toLowerCase().includes('date') || el.name?.toLowerCase().includes('time')) && (
                                <optgroup label="Date & Time">
                                  <option value="date:dd/MM/yyyy">Date: 31/12/2024</option>
                                  <option value="date:dd MMM yyyy">Date: 31 Dec 2024</option>
                                  <option value="date:EEEE, dd MMM">Date: Sunday, 31 Dec</option>
                                  <option value="time:HH:mm">Time: 14:30 (24h)</option>
                                  <option value="time:h:mm a">Time: 2:30 PM (12h)</option>
                                  <option value="date:dd/MM HH:mm">Both: 31/12 14:30</option>
                                  <option value="date:dd MMM, h:mm a">Both: 31 Dec, 2:30 PM</option>
                                </optgroup>
                              )}

                              <optgroup label="General">
                                <option value="number">Number (1,234)</option>
                                <option value="shorten:">Shorten...</option>
                                <option value="prefix:">Add Prefix...</option>
                                <option value="suffix:">Add Suffix...</option>
                              </optgroup>
                            </select>

                            {pendingFormatter && (
                              <div className="bg-app-sidebar/50 border border-app-accent/30 rounded-md p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                                <div className="flex items-center justify-between">
                                  <span className="text-ui-micro text-app-accent font-medium">{pendingFormatter.label}</span>
                                  <button 
                                    onClick={() => setPendingFormatter(null)}
                                    className="text-app-muted hover:text-app-text text-ui-micro transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                                <div className="flex gap-1.5">
                                  <input
                                    autoFocus
                                    className="flex-1 bg-app-bg border border-app-border rounded px-2 h-7 text-ui-xs text-app-text outline-none focus:border-app-accent transition-colors"
                                    value={formatterInput}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleOverride(el.id, { formatters: [...activeFormatters, pendingFormatter.type + formatterInput] });
                                        setPendingFormatter(null);
                                      }
                                    }}
                                    onChange={(e) => setFormatterInput(e.target.value)}
                                    placeholder="Type value..."
                                  />
                                  <button
                                    onClick={() => {
                                      handleOverride(el.id, { formatters: [...activeFormatters, pendingFormatter.type + formatterInput] });
                                      setPendingFormatter(null);
                                    }}
                                    className="bg-app-accent text-white px-2 rounded text-ui-micro font-medium hover:bg-app-accent-hover transition-colors"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Value / override */}
                        <div>
                          <FieldLabel
                            action={
                              (overrides.text !== undefined || overrides.src !== undefined) && (
                                <ResetLink onClick={() => handleOverride(el.id, isText ? { text: undefined } : { src: undefined })} />
                              )
                            }
                          >
                            {isText ? t.panels.fields.value : t.panels.fields.source}
                          </FieldLabel>
                          {isText ? (
                            <div className={cn(
                              "flex items-center bg-app-bg border rounded-md focus-within:border-app-accent overflow-hidden h-8 transition-all",
                              resolved.errors?.text ? "border-red-500/50 ring-1 ring-red-500/20" : "border-app-border"
                            )}>
                              <Input
                                disabled={!isEditable('text')}
                                value={overrides.text ?? ""}
                                onChange={e => handleOverride(el.id, { text: e.target.value || undefined })}
                                placeholder={resolved.text || "Rendered value..."}
                                className="flex-1 bg-transparent border-0 h-full text-ui-xs px-2.5 shadow-none"
                              />
                            </div>
                          ) : (
                            <div className="flex gap-1.5 transition-all">
                              <Input
                                disabled={!isEditable('src')}
                                value={overrides.src ?? ""}
                                onChange={e => handleOverride(el.id, { src: e.target.value || undefined })}
                                placeholder={resolved.src || "Image URL..."}
                                className={cn(
                                  "h-8 text-ui-xs bg-app-bg px-2.5 flex-1",
                                  resolved.errors?.src ? "border-red-500/50 ring-1 ring-red-500/20" : "border-app-border"
                                )}
                              />
                              <label className="shrink-0 h-8 w-8 bg-app-card border border-app-border flex items-center justify-center rounded-md cursor-pointer hover:bg-app-bg transition-all">
                                <Upload size={13} className="text-app-muted" />
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => handleOverride(el.id, { src: event.target?.result as string });
                                    reader.readAsDataURL(file);
                                  }
                                }} />
                              </label>
                            </div>
                          )}
                        </div>
                      </PropertySection>
                    )}

                    {/* ── 2. LAYOUT ──────────────────────────────────────── */}
                    <PropertySection title={t.panels.sections.layout}>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel>X</FieldLabel>
                          <Input
                            type="number"
                            disabled={!isEditable('x')}
                            value={overrides.x !== undefined ? overrides.x : el.x}
                            onChange={e => handleOverride(el.id, { x: Number(e.target.value) })}
                            className="h-8 text-ui-xs bg-app-bg px-2.5"
                          />
                        </div>
                        <div>
                          <FieldLabel>Y</FieldLabel>
                          <Input
                            type="number"
                            disabled={!isEditable('y')}
                            value={overrides.y !== undefined ? overrides.y : el.y}
                            onChange={e => handleOverride(el.id, { y: Number(e.target.value) })}
                            className="h-8 text-ui-xs bg-app-bg px-2.5"
                          />
                        </div>
                        <div>
                          <FieldLabel>{t.panels.fields.width}</FieldLabel>
                          <Input
                            type="number"
                            disabled={!isEditable('width')}
                            value={overrides.width !== undefined ? overrides.width : el.width}
                            onChange={e => handleOverride(el.id, { width: Number(e.target.value) })}
                            className="h-8 text-ui-xs bg-app-bg px-2.5"
                          />
                        </div>
                        <div>
                          <FieldLabel>{t.panels.fields.height}</FieldLabel>
                          <Input
                            type="number"
                            disabled={!isEditable('height')}
                            value={overrides.height !== undefined ? overrides.height : el.height}
                            onChange={e => handleOverride(el.id, { height: Number(e.target.value) })}
                            className="h-8 text-ui-xs bg-app-bg px-2.5"
                          />
                        </div>
                      </div>

                      {el.type === 'Shape' && shapeSubtype !== 'Circle' && shapeSubtype !== 'Ellipse' && (
                        <div>
                          <FieldLabel>{t.panels.fields.topWidth}</FieldLabel>
                          <Input
                            type="number"
                            disabled={!isEditable('topWidth')}
                            value={overrides.topWidth !== undefined ? overrides.topWidth : (el.topWidth !== undefined ? el.topWidth : (el.width || 0))}
                            onChange={e => {
                              const val = Number(e.target.value);
                              const w = overrides.width !== undefined ? overrides.width : (el.width || 0);
                              handleOverride(el.id, { topWidth: Math.min(val, w) });
                            }}
                            className="h-8 text-ui-xs bg-app-bg px-2.5"
                          />
                        </div>
                      )}

                      <div>
                        <FieldLabel>{t.panels.fields.skewX}</FieldLabel>
                        <Input
                          type="number"
                          disabled={!isEditable('skewX')}
                          step={0.05}
                          value={overrides.skewX !== undefined ? overrides.skewX : (el.skewX || 0)}
                          onChange={e => handleOverride(el.id, { skewX: Number(e.target.value) })}
                          className="h-8 text-ui-xs bg-app-bg px-2.5"
                        />
                      </div>

                      <div className="border-t border-app-border/30 pt-3">
                        <FieldLabel>{t.panels.fields.mirroring}</FieldLabel>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOverride(el.id, { flipX: !(overrides.flipX !== undefined ? overrides.flipX : !!el.flipX) })}
                            className={cn(
                              "flex-1 h-8 rounded text-ui-xs transition-all flex items-center justify-center gap-1.5 shadow-sm border",
                              (overrides.flipX !== undefined ? overrides.flipX : !!el.flipX)
                                ? "bg-app-accent border-app-accent text-accent-foreground font-semibold shadow-md shadow-app-accent/10 hover:brightness-110"
                                : "bg-app-bg border-app-border text-app-muted font-normal hover:border-app-muted hover:text-app-text"
                            )}
                          >
                            ↔ {t.panels.fields.flipX}
                          </button>
                          <button
                            onClick={() => handleOverride(el.id, { flipY: !(overrides.flipY !== undefined ? overrides.flipY : !!el.flipY) })}
                            className={cn(
                              "flex-1 h-8 rounded text-ui-xs transition-all flex items-center justify-center gap-1.5 shadow-sm border",
                              (overrides.flipY !== undefined ? overrides.flipY : !!el.flipY)
                                ? "bg-app-accent border-app-accent text-accent-foreground font-semibold shadow-md shadow-app-accent/10 hover:brightness-110"
                                : "bg-app-bg border-app-border text-app-muted font-normal hover:border-app-muted hover:text-app-text"
                            )}
                          >
                            ↕ {t.panels.fields.flipY}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {isText && (
                          <div>
                            <FieldLabel>{t.panels.fields.align}</FieldLabel>
                            <div className="flex bg-app-bg border border-app-border rounded overflow-hidden h-8">
                              {(['left', 'center', 'right'] as const).map(align => {
                                const isActive = (overrides.align !== undefined ? overrides.align : el.align) === align;
                                return (
                                  <button
                                    key={align}
                                    onClick={() => handleOverride(el.id, { align })}
                                    className={cn(
                                      "flex-1 h-full flex items-center justify-center transition-all",
                                      isActive ? "bg-app-accent text-accent-foreground shadow-sm hover:brightness-110" : "text-app-muted hover:bg-app-card hover:text-app-text"
                                    )}
                                  >
                                    {align === 'left' && <AlignLeft size={14} />}
                                    {align === 'center' && <AlignCenter size={14} />}
                                    {align === 'right' && <AlignRight size={14} />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <div className={cn(!isText && "col-span-2")}>
                          <FieldLabel>{t.panels.fields.rotation}</FieldLabel>
                          <div className="relative">
                            <Input
                              type="number"
                              disabled={!isEditable('rotation')}
                              value={overrides.rotation !== undefined ? overrides.rotation : el.rotation}
                              onChange={e => handleOverride(el.id, { rotation: Number(e.target.value) })}
                              className="h-8 text-ui-xs bg-app-bg pr-5 px-2.5"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-ui-xs text-app-muted">°</span>
                          </div>
                        </div>
                      </div>
                    </PropertySection>

                    {/* ── 3. TYPOGRAPHY ──────────────────────────────────── */}
                    {isText && (
                      <PropertySection title={t.panels.sections.typography}>
                        <div>
                          <FieldLabel>{t.panels.fields.fontFamily}</FieldLabel>
                          <Select
                            value={overrides.fontFamily !== undefined ? overrides.fontFamily : el.fontFamily}
                            onValueChange={val => handleOverride(el.id, { fontFamily: val })}
                          >
                            <SelectTrigger className="h-8 text-ui-xs bg-app-bg border-app-border px-2.5">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Bebas Neue">Bebas Neue</SelectItem>
                              <SelectItem value="Anton">Anton</SelectItem>
                              <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                              <SelectItem value="Outfit">Outfit</SelectItem>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <FieldLabel>{t.panels.fields.weight}</FieldLabel>
                            <Select
                              value={(() => {
                                const val = overrides.fontWeight !== undefined ? overrides.fontWeight : (el.fontWeight || el.style?.fontWeight || '400');
                                if (val === 'normal') return '400';
                                if (val === 'bold') return '700';
                                return String(val);
                              })()}
                              onValueChange={val => handleOverride(el.id, { fontWeight: val })}
                            >
                              <SelectTrigger className="h-8 text-ui-xs bg-app-bg border-app-border px-2.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="min-w-[140px] z-[110]">
                                <SelectItem value="300">Light (300)</SelectItem>
                                <SelectItem value="400">Normal (400)</SelectItem>
                                <SelectItem value="500">Medium (500)</SelectItem>
                                <SelectItem value="700">Bold (700)</SelectItem>
                                <SelectItem value="900">Black (900)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <FieldLabel>{t.panels.fields.size}</FieldLabel>
                            <Input
                              type="number"
                              value={overrides.fontSize !== undefined ? overrides.fontSize : el.fontSize}
                              onChange={e => handleOverride(el.id, { fontSize: Number(e.target.value) })}
                              className="h-8 text-ui-xs bg-app-bg px-2.5"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <FieldLabel>{t.panels.fields.lineHeight}</FieldLabel>
                            <Input
                              type="number"
                              step={0.1}
                              value={overrides.lineHeight !== undefined ? overrides.lineHeight : el.lineHeight}
                              onChange={e => handleOverride(el.id, { lineHeight: Number(e.target.value) })}
                              className="h-8 text-ui-xs bg-app-bg px-2.5"
                            />
                          </div>
                          <div>
                            <FieldLabel>{t.panels.fields.letterSpacing}</FieldLabel>
                            <Input
                              type="number"
                              value={overrides.letterSpacing !== undefined ? overrides.letterSpacing : el.letterSpacing}
                              onChange={e => handleOverride(el.id, { letterSpacing: Number(e.target.value) })}
                              className="h-8 text-ui-xs bg-app-bg px-2.5"
                            />
                          </div>
                        </div>
                      </PropertySection>
                    )}

                    {/* ── 4. APPEARANCE ──────────────────────────────────── */}
                    <PropertySection title={t.panels.sections.appearance}>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <FieldLabel>{t.panels.fields.opacity}</FieldLabel>
                          <div className="relative">
                            <Input
                              type="number"
                              min={0} max={100}
                              value={Math.round((overrides.opacity !== undefined ? overrides.opacity : (el.opacity ?? 1)) * 100)}
                              onChange={e => handleOverride(el.id, { opacity: Number(e.target.value) / 100 })}
                              className="h-8 text-ui-xs pr-7 bg-app-bg px-2.5"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ui-xs text-app-muted">%</span>
                          </div>
                        </div>
                        <div>
                          <FieldLabel>{t.panels.fields.cornerRadius}</FieldLabel>
                          <Input
                            type="number"
                            disabled={!isEditable('cornerRadius')}
                            min={0}
                            value={overrides.cornerRadius !== undefined ? overrides.cornerRadius : (el.cornerRadius || (el as any).style?.cornerRadius || 0)}
                            onChange={e => handleOverride(el.id, { cornerRadius: Number(e.target.value) })}
                            className="h-8 text-ui-xs bg-app-bg px-2.5"
                          />
                        </div>
                      </div>
                    </PropertySection>

                    {/* ── 5. FILL ────────────────────────────────────────── */}
                    {(!isImage || isShape || isText) && (
                      <>
                        <PropertySection title={t.panels.sections.fill}>
                          <div className="space-y-3">
                            {/* Fill binding path */}
                            <div>
                              <FieldLabel
                                action={overrides.fillBindingPath !== undefined && (
                                  <ResetLink onClick={() => handleOverride(el.id, { fillBindingPath: undefined })} />
                                )}
                              >
                                {t.panels.fields.sourceBindingPath}
                              </FieldLabel>
                              <div className={cn(
                                "flex items-center bg-app-bg border rounded-md focus-within:border-app-accent overflow-hidden h-8",
                                resolved.errors?.fill ? "border-red-500/50 ring-1 ring-red-500/20" : "border-app-border"
                              )}>
                                <input
                                  type="text"
                                  value={overrides.fillBindingPath !== undefined ? overrides.fillBindingPath : ((el as any).style?.fill || "")}
                                  onChange={e => handleOverride(el.id, { fillBindingPath: e.target.value })}
                                  placeholder="e.g. {{match.homeTeam.colors.primary}}"
                                  className="w-full bg-transparent h-full px-2.5 text-app-text text-ui-xs outline-none font-mono"
                                />
                                {resolved.errors?.fill && (
                                  <div className="px-2 text-red-500" title="Key not found in data source">
                                    <AlertTriangle size={14} />
                                  </div>
                                )}
                              </div>
                              {(() => {
                                const fillStr = overrides.fillBindingPath !== undefined ? overrides.fillBindingPath : ((el as any).style?.fill || "");
                                const matches = typeof fillStr === 'string' ? fillStr.match(/{{([^}]+)}}/g) : null;
                                if (!matches) return null;
                                const bindings = matches.map(m => m.replace('{{', '').replace('}}', '').trim());
                                if (bindings.length === 0) return null;
                                return (
                                  <div className="flex gap-1.5 items-center mt-1.5 flex-wrap">
                                    <span className="text-ui-xs text-app-muted">Keys:</span>
                                    {bindings.map((b, i) => (
                                      <span key={i} className="text-ui-xs bg-app-sidebar border border-app-border text-app-text px-2 py-0.5 rounded font-mono">
                                        {b.split('|')[0].trim()}
                                      </span>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>

                            {/* Fill value (manual override) */}
                            <UnifiedColorPicker
                              label={t.panels.fields.color}
                              value={overrides.fill !== undefined ? overrides.fill : (resolved.fill || undefined)}
                              onChange={val => handleOverride(el.id, { fill: val })}
                              action={overrides.fill !== undefined && (
                                <ResetLink onClick={() => handleOverride(el.id, { fill: undefined })} />
                              )}
                              placeholder={resolved.fill || "FFFFFF"}
                            />
                          </div>
                        </PropertySection>

                        {/* ── 6. OUTLINE ─────────────────────────────────── */}
                        <PropertySection title={t.panels.sections.outline}>
                          <div className="flex items-center justify-between">
                            <FieldLabel>{t.panels.fields.enable}</FieldLabel>
                            <Switch
                              checked={resolved.strokeEnabled !== undefined ? resolved.strokeEnabled : (resolved.strokeWidth || 0) > 0}
                              onCheckedChange={checked => {
                                const updates: any = { strokeEnabled: checked };
                                if (checked && (resolved.strokeWidth || 0) === 0) updates.strokeWidth = 2;
                                handleOverride(el.id, updates);
                              }}
                            />
                          </div>
                          {(resolved.strokeEnabled !== undefined ? resolved.strokeEnabled : (resolved.strokeWidth || 0) > 0) && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                              <UnifiedColorPicker
                                label={t.panels.fields.color}
                                value={overrides.stroke !== undefined ? overrides.stroke : (resolved.stroke || undefined)}
                                onChange={val => handleOverride(el.id, { stroke: val })}
                                placeholder={resolved.stroke || "#000000"}
                              />
                              <div>
                                <FieldLabel>{t.panels.fields.width} (px)</FieldLabel>
                                <Input
                                  type="number"
                                  min={0} max={10}
                                  value={resolved.strokeWidth || 0}
                                  onChange={e => handleOverride(el.id, { strokeWidth: Math.min(10, Math.max(0, Number(e.target.value))) })}
                                  className="bg-app-bg h-8 text-ui-xs font-mono px-2.5"
                                />
                              </div>
                            </div>
                          )}
                        </PropertySection>
                      </>
                    )}

                    {/* ── 7. SHADOW ──────────────────────────────────────── */}
                    <PropertySection title={t.panels.sections.shadow}>
                      <div className="flex items-center justify-between">
                        <FieldLabel>{t.panels.fields.enable}</FieldLabel>
                        <Switch
                          checked={resolved.shadowEnabled || false}
                          onCheckedChange={checked => handleOverride(el.id, { shadowEnabled: checked })}
                        />
                      </div>
                      {(resolved.shadowEnabled || false) && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          <UnifiedColorPicker
                            label={t.panels.fields.color}
                            value={overrides.shadowColor !== undefined ? overrides.shadowColor : (resolved.shadowColor || undefined)}
                            onChange={val => handleOverride(el.id, { shadowColor: val })}
                            placeholder={resolved.shadowColor || "#000000"}
                          />
                          <div className="flex flex-col gap-3">
                            <div className="flex-1 flex items-center gap-2">
                              <span className="text-ui-xs text-app-muted w-10 shrink-0">{t.panels.fields.blur}</span>
                              <Input
                                type="number"
                                placeholder={t.panels.fields.blur}
                                value={resolved.shadowBlur || 0}
                                onChange={e => handleOverride(el.id, { shadowBlur: Number(e.target.value) })}
                                className="flex-1 h-8 text-ui-xs bg-app-bg px-2"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <FieldLabel>{t.panels.fields.offsetX}</FieldLabel>
                                <Input
                                  type="number"
                                  value={resolved.shadowOffsetX || 0}
                                  onChange={e => handleOverride(el.id, { shadowOffsetX: Number(e.target.value) })}
                                  className="h-8 text-ui-xs bg-app-bg px-2.5"
                                />
                              </div>
                              <div>
                                <FieldLabel>{t.panels.fields.offsetY}</FieldLabel>
                                <Input
                                  type="number"
                                  value={resolved.shadowOffsetY || 0}
                                  onChange={e => handleOverride(el.id, { shadowOffsetY: Number(e.target.value) })}
                                  className="h-8 text-ui-xs bg-app-bg px-2.5"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </PropertySection>

                    {/* ── 8. TEXT BACKGROUND ─────────────────────────────── */}
                    {isText && (
                      <PropertySection title={t.panels.sections.background}>
                        <div className="flex items-center justify-between">
                          <FieldLabel>{t.panels.fields.enable}</FieldLabel>
                          <Switch
                            checked={overrides.bgEnabled !== undefined ? overrides.bgEnabled : el.bgEnabled}
                            onCheckedChange={checked => handleOverride(el.id, { bgEnabled: checked })}
                          />
                        </div>
                        {(overrides.bgEnabled !== undefined ? overrides.bgEnabled : el.bgEnabled) && (
                          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <UnifiedColorPicker
                              label={t.panels.fields.color}
                              value={overrides.bgColor !== undefined ? overrides.bgColor : (el.bgColor || undefined)}
                              onChange={val => handleOverride(el.id, { bgColor: val })}
                              placeholder={el.bgColor || "#000000"}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <FieldLabel>{t.panels.fields.padding}</FieldLabel>
                                <Input
                                  type="number"
                                  value={overrides.bgPadding !== undefined ? overrides.bgPadding : el.bgPadding}
                                  onChange={e => handleOverride(el.id, { bgPadding: Number(e.target.value) })}
                                  className="h-8 text-ui-xs bg-app-bg px-2.5"
                                />
                              </div>
                              <div>
                                <FieldLabel>{t.panels.fields.radius}</FieldLabel>
                                <Input
                                  type="number"
                                  value={overrides.bgRadius !== undefined ? overrides.bgRadius : el.bgRadius}
                                  onChange={e => handleOverride(el.id, { bgRadius: Number(e.target.value) })}
                                  className="h-8 text-ui-xs bg-app-bg px-2.5"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </PropertySection>
                    )}
                  </div>
                </div>
              );
            })() : (
              /* ── Layer stack (no element selected) ─────────────────── */
              <div className="animate-in fade-in slide-in-from-left-4 duration-200">
                <div className="mb-6">
                  <PropertySection title="Canvas Settings">
                    <div className="flex items-center justify-between mt-2">
                       <FieldLabel>Enable Background</FieldLabel>
                       <Switch
                         checked={elementOverrides['__canvas']?.bgEnabled !== undefined ? elementOverrides['__canvas'].bgEnabled : true}
                         onCheckedChange={checked => handleOverride('__canvas', { bgEnabled: checked })}
                       />
                     </div>
                     {(elementOverrides['__canvas']?.bgEnabled !== false) && (
                       <div className="mt-3">
                         <UnifiedColorPicker
                           label="Background Color"
                           value={elementOverrides['__canvas']?.bgColor !== undefined ? elementOverrides['__canvas'].bgColor : (template?.canvas?.backgroundColor || '')}
                           onChange={val => handleOverride('__canvas', { bgColor: val })}
                           placeholder="#0a0a0a"
                         />
                       </div>
                     )}
                  </PropertySection>
                </div>

                <h3 className="text-ui-xs text-app-muted font-normal mb-3 flex items-center gap-1.5">
                  <Layers size={ui.icon.sm} /> {t.panels.fields.layerGroups}
                </h3>
                <div className="space-y-2">
                  {template.layers.map((layer: any) => {
                    const isExpanded = expandedLayers[layer.id];
                    const isLayerVisible = elementOverrides[layer.id]?.visible !== undefined
                      ? elementOverrides[layer.id].visible
                      : (layer.visible !== false);

                    return (
                      <div key={layer.id} className="flex flex-col">
                        <div
                          className="flex items-center gap-3 text-ui-sm p-3 bg-app-card rounded-xl border border-app-border mb-2 hover:border-app-accent/40 cursor-pointer overflow-hidden transition-all shadow-sm group/layer"
                          onClick={() => toggleLayerExpanded(layer.id)}
                        >
                          <button className="text-app-muted hover:text-app-text shrink-0">
                            <div className={cn("transition-transform", isExpanded ? "rotate-90" : "")}>
                              <ChevronRight size={ui.icon.sm} />
                            </div>
                          </button>
                          <button
                            className="text-app-muted hover:text-app-text transition-colors shrink-0 z-10"
                            onClick={(e) => { e.stopPropagation(); handleOverride(layer.id, { visible: !isLayerVisible }); }}
                          >
                            {isLayerVisible ? <Eye size={14} /> : <EyeOff size={14} className="opacity-50" />}
                          </button>
                          <div className="text-app-accent/70 shrink-0">
                            {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
                          </div>
                          <span className="font-medium text-app-text truncate flex-1">{layer.name}</span>
                        </div>

                        {isExpanded && (layer.elements || (layer as any).children || []).map((el: any) => {
                          const isText = el.type === 'Text' || el.type === 'text' || el.type === 'RichText';
                          const isShape = el.type === 'Shape' || el.type === 'Polygon' || el.type === 'Line' || el.type === 'rect' || el.type === 'quad' || el.type === 'circle' || el.type === 'ellipse' || el.type === 'GradientOverlay' || el.type === 'Group';
                          const isImage = el.type === 'Image' || el.type === 'image' || el.type === 'BackgroundImage' || (!isText && !isShape);
                          const isSelected = selectedElementId === el.id;
                          const isVisible = elementOverrides[el.id]?.visible !== undefined
                            ? elementOverrides[el.id].visible
                            : (el.visible !== false);

                          return (
                            <div
                              key={el.id}
                              className={cn(
                                "flex items-center gap-2.5 text-ui-xs py-2 pr-3 pl-10 rounded-lg border border-transparent transition-all cursor-pointer relative mb-0.5",
                                isSelected
                                  ? "bg-app-card text-app-text border-app-border shadow-sm ring-1 ring-app-accent/20"
                                  : hoveredElementId === el.id
                                    ? "bg-app-card/50 text-app-text"
                                    : "text-app-muted hover:bg-app-card/50"
                              )}
                              style={{
                                backgroundImage: "linear-gradient(var(--app-border), var(--app-border))",
                                backgroundPosition: "22px center",
                                backgroundSize: "1px 100%",
                                backgroundRepeat: "no-repeat"
                              }}
                              onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                              onMouseEnter={() => setHoveredElementId(el.id)}
                              onMouseLeave={() => setHoveredElementId(null)}
                            >
                              <div className="w-3 h-px bg-app-border absolute left-[22px]" />
                              <button
                                className="text-app-muted hover:text-app-text transition-colors shrink-0 z-10 bg-transparent pl-1 relative"
                                onClick={(e) => { e.stopPropagation(); handleOverride(el.id, { visible: !isVisible }); }}
                              >
                                {isVisible ? <Eye size={12} /> : <EyeOff size={12} className="opacity-50" />}
                              </button>
                              <div className="shrink-0 text-app-muted flex items-center justify-center w-4 h-4 rounded">
                                {isText && <Type size={12} />}
                                {isImage && <LucideImage size={12} />}
                                {isShape && <Square size={12} />}
                              </div>
                              <span className={cn("truncate flex-1", isSelected ? "text-app-text font-medium" : "font-normal")}>
                                {el.label || el.name || el.id}
                              </span>
                              {el.dataKey && (
                                <span
                                  className="bg-app-accent/15 text-app-accent px-1.5 py-0.5 ml-1 rounded text-ui-xs font-mono shrink-0"
                                  title={`Bound: ${el.dataKey}`}
                                >
                                  bound
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightPanel;
