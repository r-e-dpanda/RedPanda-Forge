import React from "react";
import { cn } from "../../lib/utils";
import { PanelRightClose, Layers, FileJson, AlertTriangle, Eye, EyeOff, FolderOpen, Folder, ChevronRight, ChevronLeft, Type, Square, Image as LucideImage, Upload, RotateCcw } from "lucide-react";
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

const PropertySection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={cn("space-y-5 pb-8 border-b border-app-border/40 last:border-0", className)}>
    <h4 className="text-ui-base font-bold text-app-text mb-4 leading-none tracking-tight">{title}</h4>
    <div className="space-y-5">
      {children}
    </div>
  </div>
);

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
              // Effects
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
    <aside className="w-[340px] bg-app-sidebar border-l border-app-border flex flex-col shrink-0 h-full z-10 transition-all font-sans relative">
      <div className="flex bg-app-sidebar h-[54px] shrink-0 border-b border-app-border">
        <Tabs value={activeRightTab} onValueChange={(val: any) => setActiveRightTab(val)} className="flex-1">
          <TabsList variant="line" className="w-full h-full p-0 gap-0">
            <TabsTrigger value="data" className="flex-1 h-full rounded-none data-active:after:bg-app-accent data-active:text-app-text text-ui-base font-bold">
              {t.panels.tabs.match}
            </TabsTrigger>
            <TabsTrigger value="design" className="flex-1 h-full rounded-none data-active:after:bg-app-accent data-active:text-app-text text-ui-base font-bold">
              {t.panels.tabs.design}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button 
          variant="ghost" 
          size="icon-sm"
          onClick={() => setRightExpanded(false)}
          className="h-full w-[54px] rounded-none hover:bg-app-card text-app-muted"
        >
          <PanelRightClose size={ui.icon.base} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto w-[340px]">
        {activeRightTab === 'data' && (
          <div className="p-5 overflow-y-auto w-full h-full pb-10 flex flex-col gap-6">
            
            {match && (
              <>
                <div className="flex items-center gap-3 bg-app-card rounded-lg border border-app-border p-3.5 shadow-sm">
                  <span className="bg-app-accent text-app-bg px-2.5 py-1 rounded text-ui-xs font-bold">
                    {match.sport}
                  </span>
                  <span className="text-ui-base font-bold text-app-text tracking-tight">{match.league}</span>
                </div>

                {match.homeTeam && match.awayTeam && (
                  <div className="space-y-3">
                    <h3 className="text-ui-sm text-app-muted font-bold">{t.panels.fields.matchup}</h3>
                    <div className="flex flex-col gap-3.5 p-4 bg-app-bg rounded-lg border border-app-border items-start justify-center shadow-inner">
                      <div className="flex items-center gap-4">
                          <img src={match.homeTeam.logo} className="w-7 h-7 object-contain opacity-90" alt="" />
                          <span className="text-ui-base font-bold text-app-text tracking-tight">{match.homeTeam.name}</span>
                      </div>
                      <div className="text-[13px] text-app-muted font-[900] pl-[44px] tracking-widest relative">
                        <div className="absolute left-0 top-1/2 w-8 h-[1px] bg-app-border/50"></div>
                        VS
                      </div>
                      <div className="flex items-center gap-4">
                          <img src={match.awayTeam.logo} className="w-7 h-7 object-contain opacity-90" alt="" />
                          <span className="text-ui-base font-bold text-app-text tracking-tight">{match.awayTeam.name}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {match.player1 && match.player2 && (
                  <div className="space-y-3">
                    <h3 className="text-ui-sm text-app-muted font-bold mb-3">{t.panels.fields.matchup}</h3>
                    <div className="flex flex-col gap-3.5 p-4 bg-app-bg rounded-lg border border-app-border items-start justify-center shadow-inner">
                      <div className="flex items-center gap-4">
                          <img src={match.player1.flag} className="w-6 h-4 object-cover rounded-[2px]" alt="" />
                          <span className="text-ui-base font-bold text-app-text tracking-tight">{match.player1.name}</span>
                      </div>
                      <div className="text-[13px] text-app-muted font-[900] pl-[44px] tracking-widest relative">
                        <div className="absolute left-0 top-1/2 w-8 h-[1px] bg-app-border/50"></div>
                        VS
                      </div>
                      <div className="flex items-center gap-4">
                          <img src={match.player2.flag} className="w-6 h-4 object-cover rounded-[2px]" alt="" />
                          <span className="text-ui-base font-bold text-app-text tracking-tight">{match.player2.name}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-ui-sm text-app-muted font-bold mb-3 pb-2 border-b border-app-border/30">{t.panels.fields.details}</h3>
                  <div className="flex flex-col gap-2.5 text-[13.5px] mt-4">
                    {match.venue && (
                      <div className="flex justify-between items-center pb-2.5">
                        <span className="text-app-muted font-bold text-ui-xs">{t.panels.fields.venue}</span>
                        <span className="text-app-text font-bold text-right">{match.venue}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pb-2.5">
                      <span className="text-app-muted font-bold text-ui-xs">{t.panels.fields.date}</span>
                      <span className="text-app-text font-bold text-right">{new Date(match.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2.5">
                      <span className="text-app-muted font-bold text-ui-xs">{t.panels.fields.kickoff}</span>
                      <span className="text-app-text font-bold text-right">{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} GMT</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!match && (
              <div className="text-center text-app-muted text-[13px] italic mb-2 border border-app-border border-dashed p-6 rounded-lg bg-app-card/30">
                No match source selected. Canvas will show placeholder variables.
              </div>
            )}

            <div>
              <h3 className="text-ui-sm text-app-muted font-bold mb-4">{t.panels.fields.dataSources}</h3>
              <div className="flex flex-col gap-3">
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
                       rawBoundValue = cleanKey.split('.').reduce((acc:any, part:string) => acc && acc[part], match) || 
                                       cleanKey.replace('.colors.primary', '.color').split('.').reduce((acc:any, part:string) => acc && acc[part], match);
                     } else {
                       rawBoundValue = cleanKey.split('.').reduce((acc:any, part:string) => acc && acc[part], match);
                     }
                     if (rawBoundValue !== undefined && rawBoundValue !== null) {
                       displayVal = String(rawBoundValue);
                     }
                   }

                   if (displayVal === 'N/A') {
                     if (element.type.toLowerCase() === 'text') {
                       displayVal = resolved.text;
                     } else if (element.type.toLowerCase() === 'image' || element.type.toLowerCase() === 'backgroundimage') {
                       displayVal = resolved.src ? '[Image Bound]' : 'N/A';
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
                       className="flex flex-col gap-2.5 text-[13.5px] p-3.5 rounded-xl border border-app-border bg-app-card hover:border-app-accent/50 transition-all hover:bg-app-card/60 shadow-sm"
                       onMouseEnter={() => setHoveredElementId(element.id)}
                       onMouseLeave={() => setHoveredElementId(null)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[#a0a5b0] font-mono text-[12.5px] whitespace-nowrap overflow-hidden text-ellipsis mr-2 tracking-tighter">&#123;&#123;{element.dataKey}&#125;&#125;</span>
                        {isAuto && (
                          <span className="text-cyan-400 font-bold text-right truncate max-w-[120px]" title={displayVal}>
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
                          className="w-full bg-app-bg border border-app-border rounded-lg p-2.5 text-app-text outline-none focus:border-app-accent text-[13px] mt-1 shadow-inner h-9"
                        />
                      )}
                    </div>
                   )
                })}
                {elementsWithBinding.length === 0 && (
                  <div className="text-xs text-app-muted italic text-center p-2">No bound variables in template</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Editor Tab starts here */}
        {activeRightTab === 'design' && template && (
          <div className="p-5 overflow-y-auto w-full h-full pb-10">
            {selectedElementId ? (() => {
              const el = flatElements.find(e => e.id === selectedElementId);
              if (!el) return null;
              const overrides = (elementOverrides[el.id] || {}) as any;
              const isText = el.type === 'Text' || el.type === 'text';
              const isImage = el.type === 'Image' || el.type === 'image' || el.type === 'BackgroundImage';
              const isShape = el.type === 'Shape' || el.type === 'Polygon' || el.type === 'Line';

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
                  // Quadrilateral logic
                  const isRect = Math.abs(skX) < 0.001 && Math.abs(tw - w) < 0.001;
                  if (isRect) {
                    return Math.abs(w - h) < 0.001 ? "Square" : "Rectangle";
                  }
                  
                  const isParallelogram = Math.abs(tw - w) < 0.001 && Math.abs(skX) > 0.001;
                  if (isParallelogram) {
                    return Math.abs(w - h) < 0.001 ? "Rhombus" : "Parallelogram";
                  }

                  if (Math.abs(tw - w) > 0.001 && Math.abs(skX) < 0.001) {
                    return "Trapezoid";
                  }

                  return "Quad";
                }

                return "Shape";
              })();
              // If editableProperties is undefined, assume EVERYTHING is editable (very important feature)
              const isEditable = (prop: string) => !el.editableProperties || el.editableProperties.includes(prop);
              
              const activeFormatters = overrides.formatters !== undefined ? overrides.formatters : ((el as any).formatters || []);
              const resolverContext = {
                packId: activeSession?.packId || "_default_pack",
                templateId: template?.id || "fallback"
              };
              const resolved = resolveBoundData(el, match, manualInputs, overrides, resolverContext);

              return (
                <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                  <button 
                    onClick={() => setSelectedElementId(null)}
                    className="flex items-center gap-1.5 text-app-muted hover:text-app-text text-[13.5px] font-bold tracking-[1px] mb-6 transition-colors group"
                  >
                    <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform"/> {t.panels.fields.backToLayers}
                  </button>

                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[15px] text-app-text font-[700] truncate tracking-tight">{el.label || el.name || 'Properties'}</h3>
                    <span className="bg-app-sidebar text-app-muted px-2.5 py-1 rounded border border-app-border text-[12px] font-bold uppercase tracking-tight">
                      {isText ? 'Text Layer' : isImage ? 'Image Layer' : shapeSubtype ? `Shape: ${shapeSubtype}` : 'Layer'}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* 1. CONTENT SECTION */}
                    {(isText || isImage) && (
                    <PropertySection title={t.panels.sections.content}>
                      {/* Binding Path (was Source) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                           <label className="text-[12px] font-bold text-app-muted uppercase tracking-wider">
                             {isText ? "Value - Binding Path" : "Source - Binding Path"}
                           </label>
                        {/* Reset button if overridden */}
                        {(((isText || isImage) && overrides.bindingPath !== undefined) ||
                          ((isText || isImage) && overrides.dataKey !== undefined)) && (
                           <button 
                             onClick={() => {
                                handleOverride(el.id, { bindingPath: undefined, dataKey: undefined });
                             }}
                             className="text-[12px] text-app-accent hover:underline lowercase font-bold"
                           >
                             {t.panels.fields.reset}
                           </button>
                        )}
                     </div>

                     <>
                       <div className="flex items-center bg-app-bg border border-app-border rounded-lg focus-within:border-app-accent overflow-hidden h-9 shadow-inner transition-all">
                         <input 
                           type="text" 
                           disabled={isText ? (!isEditable('text') && !isEditable('dataKey')) : (!isEditable('src') && !isEditable('dataKey'))}
                           value={(() => {
                             if (overrides.bindingPath !== undefined) return overrides.bindingPath;
                             if (overrides.dataKey !== undefined) return `{{${overrides.dataKey}}}`;
                             if ((el as any).dataKey) return `{{${(el as any).dataKey}}}`;
                             return isText ? ((el as any).text || "") : ((el as any).src || "");
                           })()}
                           onChange={e => {
                             handleOverride(el.id, { bindingPath: e.target.value, dataKey: undefined });
                           }}
                           placeholder={isText ? "e.g. Giải {{match.league}}" : "e.g. @global/teams/{{match.homeTeam.id}}/logo.svg"}
                           className="w-full bg-transparent h-full px-3 text-app-text text-[13px] outline-none font-mono disabled:opacity-50"
                         />
                       </div>
                       {/* Read-only bindings indicator for Binding Path */}
                       {(() => {
                         const pathValue = overrides.bindingPath !== undefined ? overrides.bindingPath : 
                                          (overrides.dataKey !== undefined ? `{{${overrides.dataKey}}}` : 
                                          ((el as any).dataKey ? `{{${(el as any).dataKey}}}` : (isText ? (el as any).text : (el as any).src)));
                         const matches = typeof pathValue === 'string' ? pathValue.match(/{{([^}]+)}}/g) : null;
                         if (!matches) return null;
                         const bindings = matches.map((m: string) => m.replace('{{', '').replace('}}', '').trim());
                         if (bindings.length === 0) return null;
                         return (
                           <div className="flex gap-2 items-center mt-3 flex-wrap">
                             <span className="text-[11.5px] text-app-muted font-bold tracking-tight">Binding Keys:</span>
                             {bindings.map((b: string, i: number) => (
                                <span key={i} className="text-[11.5px] bg-app-sidebar border border-app-border text-app-text px-2 py-0.5 rounded-md font-mono font-bold shadow-sm">
                                  {b.split('|')[0].trim()}
                                </span>
                             ))}
                           </div>
                         );
                       })()}
                     </>
                      </div>

                      {/* Transform (Formatter) */}
                      {isText && (
                      <div className="space-y-1.5 bg-app-card border border-app-border rounded-lg p-4 pb-5 relative shadow-sm">
                        <label className="text-[12px] font-bold text-app-muted uppercase tracking-wider flex justify-between">
                          {t.panels.fields.transform}
                          {activeFormatters.length > 0 && (
                            <button 
                              onClick={() => handleOverride(el.id, { formatters: [] })}
                              className="text-[12px] text-app-accent hover:underline lowercase font-bold"
                            >
                              {t.panels.fields.clear}
                            </button>
                          )}
                        </label>
                        
                        <div className="flex flex-col gap-2.5 mt-3">
                          {activeFormatters.map((fmt: string, idx: number) => (
                            <div key={idx} className="flex bg-app-bg border border-app-border rounded-md text-[13.5px] items-center px-2.5 py-2 group shadow-inner">
                               <span className="text-cyan-400 font-mono text-[14px] select-none mr-2.5">|</span>
                               <span className="truncate flex-1 font-mono text-[12px] font-bold text-app-text">{fmt}</span>
                               <button onClick={() => {
                                   const arr = [...activeFormatters];
                                   arr.splice(idx, 1);
                                   handleOverride(el.id, { formatters: arr });
                               }} className="text-red-400 hover:text-red-300 ml-2.5 text-[16px] leading-none">×</button>
                            </div>
                          ))}
                        </div>
                        
                        <select 
                          className="w-full bg-app-bg border border-app-border rounded-lg p-2.5 text-app-text text-[13px] outline-none focus:border-app-accent mt-3 cursor-pointer h-9 shadow-inner"
                          onChange={(e) => {
                            if (!e.target.value) return;
                            handleOverride(el.id, { formatters: [...activeFormatters, e.target.value] });
                            e.target.value = "";
                          }}
                        >
                          <option value="">{t.panels.fields.addPipeline}</option>
                          <option value="uppercase">Uppercase</option>
                          <option value="lowercase">Lowercase</option>
                          <option value="titlecase">Titlecase</option>
                          <option value="number">Number (1,234)</option>
                          <option value="shorten:10">Shorten (10 chars)</option>
                        </select>
                      </div>
                      )}

                      {/* Value (Rendered/Override) */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <label className="text-[12px] font-bold text-app-muted uppercase tracking-wider">{isText ? t.panels.fields.value : "Source"}</label>
                          {(overrides.text !== undefined || overrides.src !== undefined) && (
                            <button 
                              onClick={() => handleOverride(el.id, isText ? { text: undefined } : { src: undefined })} 
                              className="text-[12px] text-app-accent hover:underline lowercase font-bold"
                            >
                              {t.panels.fields.reset}
                            </button>
                          )}
                        </div>
                        {isText ? (
                          <Input 
                            disabled={!isEditable('text')}
                            value={overrides.text ?? ""} 
                            onChange={e => handleOverride(el.id, { text: e.target.value || undefined })}
                            placeholder={(() => {
                              return resolved.text || "Rendered value...";
                            })()}
                            className="h-9 text-[13px] bg-app-bg border-app-border px-3"
                          />
                        ) : (
                          <div className="flex gap-2">
                            <Input 
                              disabled={!isEditable('src')}
                              value={overrides.src ?? ""} 
                              onChange={e => handleOverride(el.id, { src: e.target.value || undefined })}
                              placeholder={(() => {
                                const isBound = overrides.bindingPath !== undefined || overrides.dataKey !== undefined || !!el.dataKey || (typeof (el as any).src === 'string' && (el as any).src.includes('{{'));
                                if (!isBound) return "Image URL...";
                                return resolved.src || "Image URL...";
                              })()}
                              className="h-9 text-[13px] bg-app-bg border-app-border px-3"
                            />
                            <label className="shrink-0 h-9 w-9 bg-app-card border border-app-border flex items-center justify-center rounded-lg cursor-pointer hover:bg-muted hover:text-foreground transition-all shadow-sm">
                              <Upload size={16} className="text-app-muted" />
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

                    {/* 2. LAYOUT SECTION */}
                    <PropertySection title={t.panels.sections.layout}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-app-muted uppercase tracking-wider font-mono">X</label>
            <Input 
              type="number" 
              disabled={!isEditable('x')}
              value={overrides.x !== undefined ? overrides.x : el.x} 
              onChange={e => handleOverride(el.id, { x: Number(e.target.value) })}
              className="h-9 text-[13px] bg-app-bg px-3"
            />
          </div>
          <div className="space-y-2">
            <label className="text-ui-sm font-bold text-app-muted">X</label>
            <Input 
              type="number" 
              disabled={!isEditable('x')}
              value={overrides.x !== undefined ? overrides.x : el.x} 
              onChange={e => handleOverride(el.id, { x: Number(e.target.value) })}
              className="h-9 text-ui-sm bg-app-bg px-3"
            />
          </div>
          <div className="space-y-2">
            <label className="text-ui-sm font-bold text-app-muted">Y</label>
            <Input 
              type="number" 
              disabled={!isEditable('y')}
              value={overrides.y !== undefined ? overrides.y : el.y} 
              onChange={e => handleOverride(el.id, { y: Number(e.target.value) })}
              className="h-9 text-ui-sm bg-app-bg px-3"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.width}</label>
            <Input 
              type="number" 
              disabled={!isEditable('width')}
              value={overrides.width !== undefined ? overrides.width : el.width} 
              onChange={e => handleOverride(el.id, { width: Number(e.target.value) })}
              className="h-9 text-ui-sm bg-app-bg px-3"
            />
          </div>
          <div className="space-y-2">
            <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.height}</label>
            <Input 
              type="number" 
              disabled={!isEditable('height')}
              value={overrides.height !== undefined ? overrides.height : el.height} 
              onChange={e => handleOverride(el.id, { height: Number(e.target.value) })}
              className="h-9 text-ui-sm bg-app-bg px-3"
            />
          </div>
        </div>

        {el.type === 'Shape' && shapeSubtype !== 'Circle' && shapeSubtype !== 'Ellipse' && (
          <div className="space-y-1.5">
            <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.topWidth}</label>
            <Input 
              type="number" 
              disabled={!isEditable('topWidth')}
              value={overrides.topWidth !== undefined ? overrides.topWidth : (el.topWidth !== undefined ? el.topWidth : (el.width || 0))} 
              onChange={e => {
                  const val = Number(e.target.value);
                  const w = overrides.width !== undefined ? overrides.width : (el.width || 0);
                  handleOverride(el.id, { topWidth: Math.min(val, w) });
                }}
              className="h-8 text-ui-sm bg-app-bg"
            />
          </div>
        )}

        <div className="grid grid-cols-1 mb-4">
          <div className="space-y-1.5">
            <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.skewX}</label>
            <Input 
              type="number" 
              disabled={!isEditable('skewX')}
              step={0.05}
              value={overrides.skewX !== undefined ? overrides.skewX : (el.skewX || 0)} 
              onChange={e => handleOverride(el.id, { skewX: Number(e.target.value) })}
              className="h-8 text-ui-sm bg-app-bg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-app-border/30 pt-4 mt-2">
          <div className="space-y-1.5 col-span-2">
            <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.mirroring}</label>
                          <div className="flex gap-2">
                             <button
                               onClick={() => {
                                 const current = overrides.flipX !== undefined ? overrides.flipX : !!el.flipX;
                                 handleOverride(el.id, { flipX: !current });
                               }}
                               className={cn(
                                 "flex-1 h-8 rounded-[4px] text-[11px] font-medium border transition-all flex items-center justify-center gap-2",
                                 (overrides.flipX !== undefined ? overrides.flipX : !!el.flipX) ? "bg-app-accent border-app-accent text-white" : "bg-app-bg border-app-border text-app-muted hover:border-app-accent/50"
                               )}
                             >
                               ↔ {t.panels.fields.flipX}
                             </button>
                             <button
                               onClick={() => {
                                 const current = overrides.flipY !== undefined ? overrides.flipY : !!el.flipY;
                                 handleOverride(el.id, { flipY: !current });
                               }}
                               className={cn(
                                 "flex-1 h-8 rounded-[4px] text-[11px] font-medium border transition-all flex items-center justify-center gap-2",
                                 (overrides.flipY !== undefined ? overrides.flipY : !!el.flipY) ? "bg-app-accent border-app-accent text-white" : "bg-app-bg border-app-border text-app-muted hover:border-app-accent/50"
                               )}
                             >
                               ↕ {t.panels.fields.flipY}
                             </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {isText && (
                          <div className="space-y-1.5">
                            <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.align}</label>
                            <div className="flex bg-app-bg border border-app-border rounded-[4px] overflow-hidden h-8">
                               {(['left', 'center', 'right'] as const).map(align => {
                                  const isActive = (overrides.align !== undefined ? overrides.align : el.align) === align;
                                  return (
                                    <button
                                      key={align}
                                      onClick={() => handleOverride(el.id, { align })}
                                      className={cn(
                                        "flex-1 text-[11px] font-[600] capitalize transition-colors",
                                        isActive ? "bg-app-accent text-white" : "text-app-muted hover:bg-app-card"
                                      )}
                                    >
                                      {align.substring(0, 1)}
                                    </button>
                                  )
                               })}
                            </div>
                          </div>
                        )}
                        <div className={cn("space-y-1.5", !isText && "col-span-2")}>
                          <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.rotation}</label>
                          <div className="relative">
                            <Input 
                              type="number" 
                              disabled={!isEditable('rotation')}
                              value={overrides.rotation !== undefined ? overrides.rotation : el.rotation} 
                              onChange={e => handleOverride(el.id, { rotation: Number(e.target.value) })}
                              className="h-8 text-ui-sm bg-app-bg pr-5"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-ui-xs text-app-muted">°</span>
                          </div>
                        </div>
                      </div>
                    </PropertySection>

                    {/* 3. TYPOGRAPHY SECTION */}
                    {isText && (
                      <PropertySection title={t.panels.sections.typography}>
                        <div className="space-y-4">
                          <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.fontFamily}</label>
                          <Select 
                            value={overrides.fontFamily !== undefined ? overrides.fontFamily : el.fontFamily}
                            onValueChange={val => handleOverride(el.id, { fontFamily: val })}
                          >
                            <SelectTrigger className="h-9 text-ui-sm bg-app-bg border-app-border px-3">
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

                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.weight}</label>
                                <Select 
                                  value={String(overrides.fontWeight !== undefined ? overrides.fontWeight : el.fontWeight)}
                                  onValueChange={val => handleOverride(el.id, { fontWeight: val })}
                                >
                                  <SelectTrigger className="h-9 text-ui-sm bg-app-bg border-app-border px-3">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="bold">Bold</SelectItem>
                                  <SelectItem value="300">Light</SelectItem>
                                  <SelectItem value="500">Medium</SelectItem>
                                  <SelectItem value="900">Black</SelectItem>
                                  </SelectContent>
                                </Select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.size}</label>
                                <Input 
                                  type="number" 
                                  value={overrides.fontSize !== undefined ? overrides.fontSize : el.fontSize} 
                                  onChange={e => handleOverride(el.id, { fontSize: Number(e.target.value) })}
                                  className="h-9 text-ui-sm bg-app-bg px-3"
                                />
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.lineHeight}</label>
                                <Input 
                                  type="number" 
                                  step={0.1}
                                  value={overrides.lineHeight !== undefined ? overrides.lineHeight : el.lineHeight} 
                                  onChange={e => handleOverride(el.id, { lineHeight: Number(e.target.value) })}
                                  className="h-9 text-ui-sm bg-app-bg px-3"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.letterSpacing}</label>
                                <Input 
                                  type="number" 
                                  value={overrides.letterSpacing !== undefined ? overrides.letterSpacing : el.letterSpacing} 
                                  onChange={e => handleOverride(el.id, { letterSpacing: Number(e.target.value) })}
                                  className="h-9 text-ui-sm bg-app-bg px-3"
                                />
                              </div>
                           </div>
                        </div>
                      </PropertySection>
                    )}

                    {/* 4. APPEARANCE SECTION */}
                    <PropertySection title={t.panels.sections.appearance}>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[12px] font-bold text-app-muted uppercase tracking-wider">{t.panels.fields.opacity}</label>
                             <div className="w-full relative">
                               <Input 
                                 type="number"
                                 min={0} max={100}
                                 value={Math.round((overrides.opacity !== undefined ? overrides.opacity : (el.opacity ?? 1)) * 100)}
                                 onChange={e => handleOverride(el.id, { opacity: Number(e.target.value) / 100 })}
                                 className="h-9 text-[13px] pr-8 bg-app-bg px-3 focus:border-app-accent"
                               />
                               <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-zinc-500 font-bold">%</span>
                             </div>
                          </div>
                          
                          <div className="space-y-2">
                              <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.cornerRadius}</label>
                              <Input 
                                type="number" 
                                disabled={!isEditable('cornerRadius')}
                                min={0}
                                value={overrides.cornerRadius !== undefined ? overrides.cornerRadius : (el.cornerRadius || (el as any).style?.cornerRadius || 0)} 
                                onChange={e => handleOverride(el.id, { cornerRadius: Number(e.target.value) })}
                                className="h-9 text-[13px] bg-app-bg px-3 focus:border-app-accent"
                              />
                          </div>
                       </div>
                    </PropertySection>

                    {/* 5. FILL SECTION */}
                    {!isImage && (
                      <>
                        <PropertySection title={t.panels.sections.fill}>
                           <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 items-center">
                             
                             {/* Fill Binding Path */}
                             <div className="space-y-1.5">
                                <div className="flex justify-between items-end">
                                   <label className="text-ui-sm font-bold text-app-muted">Color - Binding Path</label>
                                   {overrides.fillBindingPath !== undefined && (
                                      <button 
                                        onClick={() => handleOverride(el.id, { fillBindingPath: undefined })} 
                                        className="text-[11px] text-app-accent hover:underline lowercase"
                                      >
                                        {t.panels.fields.reset}
                                      </button>
                                   )}
                                </div>
                                <div className="flex items-center bg-app-bg border border-app-border rounded-[4px] focus-within:border-app-accent overflow-hidden h-8">
                                   <input 
                                     type="text" 
                                     value={overrides.fillBindingPath !== undefined ? overrides.fillBindingPath : ((el as any).style?.fill || "")}
                                     onChange={e => handleOverride(el.id, { fillBindingPath: e.target.value })}
                                     placeholder="e.g. {{match.homeTeam.colors.primary}}"
                                     className="w-full bg-transparent h-full px-2 text-app-text text-[12px] outline-none font-mono disabled:opacity-50"
                                   />
                                </div>
                                {/* Read-only bindings indicator for Fill */}
                                {(() => {
                                   const fillStr = overrides.fillBindingPath !== undefined ? overrides.fillBindingPath : ((el as any).style?.fill || "");
                                   const matches = typeof fillStr === 'string' ? fillStr.match(/{{([^}]+)}}/g) : null;
                                   if (!matches) return null;
                                   const bindings = matches.map(m => m.replace('{{', '').replace('}}', '').trim());
                                   if (bindings.length === 0) return null;
                                   return (
                                     <div className="flex gap-2 items-center mt-2 flex-wrap">
                                       <span className="text-[10px] text-app-muted font-medium">Binding Keys:</span>
                                       {bindings.map((b, i) => (
                                          <span key={i} className="text-[10px] bg-app-sidebar border border-app-border text-app-text px-1.5 py-0.5 rounded font-mono">
                                            {b.split('|')[0].trim()}
                                          </span>
                                       ))}
                                     </div>
                                   );
                                })()}
                             </div>

                             {/* Fill Value (Manual Override) */}
                             <div className="space-y-1.5">
                                <div className="flex justify-between items-center h-4">
                                  <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.color}</label>
                                  {overrides.fill !== undefined && (
                                    <button 
                                      onClick={() => handleOverride(el.id, { fill: undefined })} 
                                      className="text-[9px] text-app-accent hover:underline"
                                    >
                                      {t.panels.fields.reset}
                                    </button>
                                  )}
                                </div>
                                <div className="flex bg-app-bg border border-app-border rounded-[5px] overflow-hidden h-8">
                                  <div className="relative w-8 shrink-0 flex items-center justify-center border-r border-app-border bg-app-bg cursor-pointer hover:bg-app-bg-hover group">
                                    <div className="w-4 h-4 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-110" style={{ backgroundColor: resolved.fill?.startsWith('#') ? resolved.fill.substring(0, 7) : resolved.fill || '#ffffff' }} />
                                    <input 
                                      type="color" 
                                      value={resolved.fill?.startsWith('#') ? resolved.fill.substring(0, 7) : '#ffffff'}
                                      onChange={e => {
                                         const curFill = overrides.fill !== undefined ? overrides.fill : (resolved.fill || "");
                                         const curAlpha = typeof curFill === 'string' && curFill.length === 9 ? curFill.substring(7, 9) : 'FF';
                                         handleOverride(el.id, { fill: e.target.value + (curAlpha !== 'FF' ? curAlpha : '') });
                                      }}
                                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                    />
                                  </div>
                                  
                                  <input 
                                    placeholder={resolved.fill || "FFFFFF"}
                                    value={(() => {
                                      const val = overrides.fill !== undefined ? overrides.fill : undefined; // Only show hex if it's an override, don't show template string here
                                      if (typeof val === 'string') {
                                        return val.startsWith('#') ? val.substring(1, 7).toUpperCase() : val.toUpperCase();
                                      }
                                      return "";
                                    })()}
                                    onChange={e => {
                                       const hex = e.target.value.trim();
                                       if (!hex) { handleOverride(el.id, { fill: undefined }); return; }
                                       let validHex = hex;
                                       if (hex.startsWith('#')) validHex = hex.substring(1);
                                       const curFill = overrides.fill !== undefined ? overrides.fill : resolved.fill;
                                       const curAlpha = typeof curFill === 'string' && curFill.length === 9 ? curFill.substring(7, 9) : 'FF';
                                       handleOverride(el.id, { fill: `#${validHex}${curAlpha !== 'FF' ? curAlpha : ''}` });
                                    }}
                                    className="flex-1 bg-transparent px-2 text-[12px] font-mono outline-none text-app-text min-w-0"
                                  />
                                  <div className="w-[50px] flex items-center border-l border-app-border px-1">
                                     <input 
                                       type="text"
                                       value={(() => {
                                          const val = overrides.fill !== undefined ? overrides.fill : (resolved.fill || "");
                                          if (typeof val === 'string' && val.length === 9 && val.startsWith('#')) {
                                             return Math.round((parseInt(val.substring(7, 9), 16) / 255) * 100).toString();
                                          }
                                          return "100";
                                       })()}
                                       onChange={e => {
                                          let v = parseInt(e.target.value);
                                          if (isNaN(v)) return;
                                          v = Math.max(0, Math.min(100, v));
                                          const a = Math.round((v / 100) * 255).toString(16).padStart(2, '0').toUpperCase();
                                          const curFill = overrides.fill !== undefined ? overrides.fill : (resolved.fill || "");
                                          let base = '#FFFFFF';
                                          if (typeof curFill === 'string') {
                                              if (curFill.startsWith('#')) base = curFill.substring(0, 7);
                                              else base = curFill;
                                          }
                                          handleOverride(el.id, { fill: a === 'FF' ? base : `${base}${a}` });
                                       }}
                                       className="w-full bg-transparent text-[11px] text-right font-mono outline-none text-app-text"
                                     />
                                     <span className="text-[10px] text-app-muted ml-0.5">%</span>
                                  </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </PropertySection>
                    
                    {/* 6. OUTLINE SECTION */}
                    <PropertySection title={t.panels.sections.outline}>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.enable}</label>
                             <Switch 
                               checked={resolved.strokeEnabled !== undefined ? resolved.strokeEnabled : (resolved.strokeWidth || 0) > 0}
                               onCheckedChange={checked => {
                                 const updates: any = { strokeEnabled: checked };
                                 if (checked && (resolved.strokeWidth || 0) === 0) {
                                   updates.strokeWidth = 2;
                                 }
                                 handleOverride(el.id, updates);
                               }}
                             />
                          </div>

                          {(resolved.strokeEnabled !== undefined ? resolved.strokeEnabled : (resolved.strokeWidth || 0) > 0) && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                               <div className="flex gap-2 items-center">
                                  <input 
                                    type="color" 
                                    value={resolved.stroke || '#000000'}
                                    onChange={e => handleOverride(el.id, { stroke: e.target.value })}
                                    className="w-8 h-8 rounded border-none outline-none cursor-pointer bg-transparent shadow-[0_0_0_1px_var(--app-border)] p-0 shrink-0"
                                  />
                                  <Input 
                                    value={resolved.stroke || ''}
                                    onChange={e => handleOverride(el.id, { stroke: e.target.value })}
                                    className="flex-1 bg-app-bg h-8 text-[12px] font-mono"
                                  />
                               </div>
                               <div className="space-y-1.5">
                                  <label className="text-[13px] font-bold text-app-muted uppercase tracking-wider">{t.panels.fields.width} (px)</label>
                                  <Input 
                                    type="number"
                                    min={0}
                                    max={5}
                                    value={resolved.strokeWidth || 0}
                                    onChange={e => {
                                      const val = Math.min(5, Math.max(0, Number(e.target.value)));
                                      handleOverride(el.id, { strokeWidth: val });
                                    }}
                                    className="bg-app-bg h-8 text-[12px] font-mono"
                                  />
                               </div>
                            </div>
                          )}
                       </div>
                    </PropertySection>

                    {/* 6. SHADOW SECTION */}
                    <PropertySection title={t.panels.sections.shadow}>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.enable}</label>
                             <Switch 
                                checked={resolved.shadowEnabled || false}
                                onCheckedChange={checked => handleOverride(el.id, { shadowEnabled: checked })}
                             />
                          </div>

                          {(resolved.shadowEnabled || false) && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                               <div className="flex gap-2.5 items-center">
                                  <div className="relative w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-app-border bg-app-bg cursor-pointer hover:bg-app-bg-hover group transition-colors shadow-inner">
                                    <div className="w-5 h-5 rounded-[4px] shadow-[0_0_0_1px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-110" style={{ backgroundColor: resolved.shadowColor || '#000000' }} />
                                    <input 
                                      type="color" 
                                      value={resolved.shadowColor || '#000000'}
                                      onChange={e => handleOverride(el.id, { shadowColor: e.target.value })}
                                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                    />
                                  </div>
                                  <div className="flex-1 flex gap-2.5">
                                     <Input 
                                       value={resolved.shadowColor || '#000000'}
                                       onChange={e => handleOverride(el.id, { shadowColor: e.target.value })}
                                       className="flex-1 bg-app-bg h-9 text-[13px] font-mono px-3 shadow-inner"
                                     />
                                     <Input 
                                       type="number"
                                       placeholder={t.panels.fields.blur}
                                       value={resolved.shadowBlur || 0}
                                       onChange={e => handleOverride(el.id, { shadowBlur: Number(e.target.value) })}
                                       className="w-16 h-9 text-[13px] bg-app-bg px-2 shadow-inner"
                                     />
                                  </div>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                     <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.offsetX}</label>
                                     <Input 
                                       type="number"
                                       value={resolved.shadowOffsetX || 0}
                                       onChange={e => handleOverride(el.id, { shadowOffsetX: Number(e.target.value) })}
                                       className="h-9 text-[13px] bg-app-bg px-3 shadow-inner"
                                     />
                                  </div>
                                  <div className="space-y-2">
                                     <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.offsetY}</label>
                                     <Input 
                                       type="number"
                                       value={resolved.shadowOffsetY || 0}
                                       onChange={e => handleOverride(el.id, { shadowOffsetY: Number(e.target.value) })}
                                       className="h-9 text-[13px] bg-app-bg px-3 shadow-inner"
                                     />
                                  </div>
                               </div>
                            </div>
                          )}
                       </div>
                    </PropertySection>
                  </>
                )}

                    {/* 7. BACKGROUND SECTION */}
                    {isText && (
                      <PropertySection title={t.panels.sections.background}>
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.enable}</label>
                               <Switch 
                                 checked={overrides.bgEnabled !== undefined ? overrides.bgEnabled : el.bgEnabled}
                                 onCheckedChange={checked => handleOverride(el.id, { bgEnabled: checked })}
                               />
                            </div>

                            {(overrides.bgEnabled !== undefined ? overrides.bgEnabled : el.bgEnabled) && (
                              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                 <div className="flex gap-2 items-center">
                                    <input 
                                      type="color" 
                                      value={overrides.bgColor !== undefined ? overrides.bgColor : el.bgColor}
                                      onChange={e => handleOverride(el.id, { bgColor: e.target.value })}
                                      className="w-8 h-8 rounded border-none outline-none cursor-pointer bg-transparent shadow-[0_0_0_1px_var(--app-border)] p-0 shrink-0"
                                    />
                                    <Input 
                                      value={overrides.bgColor !== undefined ? overrides.bgColor : el.bgColor}
                                      onChange={e => handleOverride(el.id, { bgColor: e.target.value })}
                                      className="flex-1 bg-app-bg h-8 text-[12px] font-mono"
                                    />
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                       <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.padding}</label>
                                       <Input 
                                         type="number"
                                         value={overrides.bgPadding !== undefined ? overrides.bgPadding : el.bgPadding}
                                         onChange={e => handleOverride(el.id, { bgPadding: Number(e.target.value) })}
                                         className="h-8 text-[12px] bg-app-bg"
                                       />
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className="text-ui-sm font-bold text-app-muted">{t.panels.fields.radius}</label>
                                       <Input 
                                         type="number"
                                         value={overrides.bgRadius !== undefined ? overrides.bgRadius : el.bgRadius}
                                         onChange={e => handleOverride(el.id, { bgRadius: Number(e.target.value) })}
                                         className="h-8 text-[12px] bg-app-bg"
                                       />
                                    </div>
                                 </div>
                              </div>
                            )}
                         </div>
                      </PropertySection>
                    )}
                  </div>
                </div>
              )
            })() : (
              <div className="animate-in fade-in slide-in-from-left-4 duration-200">
                <h3 className="text-ui-sm text-app-muted font-bold mb-4 flex items-center gap-2">
                  <Layers size={ui.icon.md}/> {t.panels.fields.layerGroups}
                </h3>
                <div className="space-y-3">
                   {template.layers.map((layer: any) => {
                    const isExpanded = expandedLayers[layer.id];
                    const isLayerVisible = elementOverrides[layer.id]?.visible !== undefined 
                      ? elementOverrides[layer.id].visible 
                      : (layer.visible !== false);

                    return (
                      <div key={layer.id} className="flex flex-col">
                        <div 
                          className="flex items-center gap-4 text-[13.5px] p-4 bg-app-card rounded-2xl border border-app-border mb-3 hover:border-app-accent/50 cursor-pointer overflow-hidden transition-all shadow-md group/layer"
                          onClick={() => toggleLayerExpanded(layer.id)}
                        >
                           <button className="text-app-muted hover:text-app-text shrink-0">
                               <div className={cn("transition-transform", isExpanded ? "rotate-90" : "")}>
                                   <ChevronRight size={ui.icon.base}/>
                               </div>
                           </button>
                           <button 
                             className="text-app-muted hover:text-app-text transition-colors shrink-0 z-10"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleOverride(layer.id, { visible: !isLayerVisible });
                             }}
                           >
                               {isLayerVisible ? <Eye size={16}/> : <EyeOff size={16} className="opacity-50" />}
                           </button>
                           <div className="text-yellow-500 shrink-0">
                               {isExpanded ? <FolderOpen size={16}/> : <Folder size={16}/>}
                           </div>
                           <span className="font-bold text-app-text truncate flex-1 tracking-tight">{layer.name}</span>
                        </div>

                        {isExpanded && (layer.elements || (layer as any).children || []).map((el: any) => {
                            const isText = el.type === 'Text' || el.type === 'text';
                            const isShape = el.type === 'Shape' || el.type === 'rect' || el.type === 'GradientOverlay';
                            const isImage = !isText && !isShape;
                            const isSelected = selectedElementId === el.id;
                            const isVisible = elementOverrides[el.id]?.visible !== undefined 
                              ? elementOverrides[el.id].visible 
                              : (el.visible !== false);

                            return (
                                <div 
                                    key={el.id} 
                                    className={cn(
                                        "flex items-center gap-3 text-[13px] py-2.5 pr-3 pl-11 rounded-lg border border-transparent transition-all cursor-pointer relative mb-1",
                                        isSelected ? "bg-app-card text-app-text border-app-border shadow-md ring-1 ring-app-accent/20" :
                                        hoveredElementId === el.id 
                                        ? "bg-app-card/50 text-app-text" 
                                        : "text-app-muted hover:bg-app-card/50"
                                    )}
                                    style={{
                                        backgroundImage: "linear-gradient(#444, #444)",
                                        backgroundPosition: "24px center",
                                        backgroundSize: "1px 100%",
                                        backgroundRepeat: "no-repeat"
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedElementId(el.id);
                                    }}
                                    onMouseEnter={() => setHoveredElementId(el.id)}
                                    onMouseLeave={() => setHoveredElementId(null)}
                                >
                                    <div className="w-[14px] h-[1px] bg-app-border absolute left-[24px]"></div>

                                    <button 
                                      className="text-app-muted hover:text-app-text transition-colors shrink-0 z-10 bg-transparent pl-1 relative"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOverride(el.id, { visible: !isVisible });
                                      }}
                                    >
                                        {isVisible ? <Eye size={ui.icon.sm}/> : <EyeOff size={ui.icon.sm} className="opacity-50" />}
                                    </button>
                                    <div className="shrink-0 text-app-muted flex items-center justify-center w-5 h-5 rounded">
                                        {isText && <Type size={ui.icon.sm}/>}
                                        {isImage && <LucideImage size={ui.icon.sm}/>}
                                        {isShape && <Square size={ui.icon.sm}/>}
                                    </div>
                                    <span className={cn("truncate flex-1 font-[600] tracking-tight", isSelected ? "font-bold" : "")}>{el.label || el.name || el.id}</span>
                                    {el.dataKey && (
                                        <span 
                                            className="bg-app-accent/20 text-app-accent px-1.5 py-0.5 ml-1.5 rounded leading-none text-[11px] font-[900] shrink-0 uppercase tracking-tighter" 
                                            title={`Bound to: ${el.dataKey}`}
                                        >
                                            &#123;&#123;{el.dataKey}&#125;&#125;
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                      </div>
                    )
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
