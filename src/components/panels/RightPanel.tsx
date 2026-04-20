import React from "react";
import { cn } from "../../lib/utils";
import { PanelRightClose, Layers, FileJson, AlertTriangle, Eye, EyeOff, FolderOpen, Folder, ChevronRight, ChevronLeft, Type, Square, Image as LucideImage, Upload } from "lucide-react";
import { useEditorStore } from "../../stores/editorStore";
import { resolveBoundData, isAutoResolved } from "../../lib/templateEngine";

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
  <div className={cn("space-y-4 pb-6 border-b border-app-border/40 last:border-0", className)}>
    <h4 className="text-[12px] font-bold text-app-text mb-3 leading-none">{title}</h4>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const RightPanel: React.FC<RightPanelProps> = ({ rightExpanded, setRightExpanded, activeRightTab, setActiveRightTab }) => {
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
    return false;
  });

  const handleOverride = (id: string, overrides: any) => {
    setElementOverride(id, overrides);
    commitHistory();
  };

  return (
    <aside className="w-[320px] bg-app-sidebar border-l border-app-border flex flex-col pt-[48px] shrink-0 h-full shadow-[-10px_0_20px_rgba(0,0,0,0.5)] z-20">
      <div className="flex bg-app-sidebar h-[48px] shrink-0 border-b border-app-border">
        <Tabs value={activeRightTab} onValueChange={(val: any) => setActiveRightTab(val)} className="flex-1">
          <TabsList variant="line" className="w-full h-full p-0 gap-0">
            <TabsTrigger value="data" className="flex-1 h-full rounded-none data-active:after:bg-app-accent data-active:text-app-text text-[11px] font-bold">
              Data
            </TabsTrigger>
            <TabsTrigger value="design" className="flex-1 h-full rounded-none data-active:after:bg-app-accent data-active:text-app-text text-[11px] font-bold">
              Design
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button 
          variant="ghost" 
          size="icon-sm"
          onClick={() => setRightExpanded(false)}
          className="h-full w-[48px] rounded-none hover:bg-app-card text-app-muted"
        >
          <PanelRightClose size={16} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto w-[320px]">
        {activeRightTab === 'data' && (
          <div className="p-5 overflow-y-auto w-full h-full pb-10 flex flex-col gap-6">
            
            {match && (
              <>
                <div className="flex items-center gap-3 bg-white/5 rounded-[6px] border border-white/10 p-3">
                  <span className="bg-app-accent text-app-bg px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">
                    {match.sport}
                  </span>
                  <span className="text-[12px] font-[600] text-zinc-300">{match.league}</span>
                </div>

                {match.homeTeam && match.awayTeam && (
                  <div>
                    <h3 className="text-[12px] text-app-text font-bold mb-3">Matchup</h3>
                    <div className="flex flex-col gap-3 p-3 bg-app-bg rounded-[6px] border border-app-border items-start justify-center">
                      <div className="flex items-center gap-3 space-y-1">
                          <img src={match.homeTeam.logo} className="w-6 h-6 object-contain" alt="" />
                          <span className="text-[14px] font-bold text-app-text">{match.homeTeam.name}</span>
                      </div>
                      <div className="text-[11px] text-app-muted font-[900] pl-[10px]">VS</div>
                      <div className="flex items-center gap-3 space-y-1">
                          <img src={match.awayTeam.logo} className="w-6 h-6 object-contain" alt="" />
                          <span className="text-[14px] font-bold text-app-text">{match.awayTeam.name}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {match.player1 && match.player2 && (
                  <div>
                    <h3 className="text-[12px] text-app-text font-bold mb-3">Matchup</h3>
                    <div className="flex flex-col gap-3 p-3 bg-app-bg rounded-[6px] border border-app-border items-start justify-center">
                      <div className="flex items-center gap-3 space-y-1">
                          <img src={match.player1.flag} className="w-4 h-3 object-cover" alt="" />
                          <span className="text-[14px] font-bold text-app-text">{match.player1.name}</span>
                      </div>
                      <div className="flex items-center gap-3 space-y-1">
                          <img src={match.player2.flag} className="w-4 h-3 object-cover" alt="" />
                          <span className="text-[14px] font-bold text-app-text">{match.player2.name}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-[12px] text-app-text font-bold mb-3">Details</h3>
                  <div className="flex flex-col gap-1.5 text-[12px]">
                    {match.venue && (
                      <div className="flex justify-between border-b border-app-border/50 pb-1.5">
                        <span className="text-app-muted">Venue</span>
                        <span className="text-app-text font-[600] text-right">{match.venue}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-app-border/50 pb-1.5">
                      <span className="text-app-muted">Date</span>
                      <span className="text-app-text font-[600] text-right">{new Date(match.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between border-b border-app-border/50 pb-1.5">
                      <span className="text-app-muted">Kickoff</span>
                      <span className="text-app-text font-[600] text-right">{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} GMT</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!match && (
              <div className="text-center text-app-muted text-[11px] italic mb-2 border border-app-border border-dashed p-4 rounded-md">
                No match source selected. Canvas will show placeholder variables.
              </div>
            )}

            <div>
              <h3 className="text-[12px] text-app-text font-bold mb-3">Data Sources</h3>
              <div className="flex flex-col gap-2">
                {elementsWithBinding.map(element => {
                   const resolved = resolveBoundData(element, match, manualInputs, elementOverrides[element.id]);
                   let displayVal = element.type.toLowerCase() === 'text' ? resolved.text : (resolved.src ? '[Image Bound]' : 'N/A');
                   const isAuto = isAutoResolved(element.dataKey!, match);
                   
                   return (
                    <div 
                       key={`bind-${element.id}`} 
                       className="flex flex-col gap-1.5 text-[11px] p-2.5 rounded-[6px] border border-app-border bg-app-card hover:border-app-accent/50 transition-colors"
                       onMouseEnter={() => setHoveredElementId(element.id)}
                       onMouseLeave={() => setHoveredElementId(null)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[#a0a5b0] font-mono whitespace-nowrap overflow-hidden text-ellipsis mr-2">&#123;&#123;{element.dataKey}&#125;&#125;</span>
                        {isAuto && (
                          <span className="text-cyan-400 font-[600] text-right truncate max-w-[120px]" title={displayVal}>
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
                          className="w-full bg-app-bg border border-app-border rounded p-1.5 text-app-text outline-none focus:border-app-accent text-[11px] mt-1"
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
              // If editableProperties is undefined, assume EVERYTHING is editable (very important feature)
              const isEditable = (prop: string) => !el.editableProperties || el.editableProperties.includes(prop);
              
              const activeFormatters = overrides.formatters !== undefined ? overrides.formatters : ((el as any).formatters || []);
              const resolved = resolveBoundData(el, match, manualInputs, overrides);

              return (
                <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                  <button 
                    onClick={() => setSelectedElementId(null)}
                    className="flex items-center gap-1.5 text-app-muted hover:text-app-text text-[11px] font-bold tracking-[1px] mb-5 transition-colors"
                  >
                    <ChevronLeft size={14}/> Back to Layers
                  </button>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[14px] text-app-text font-[700] truncate">{el.label || el.name || 'Properties'}</h3>
                    <span className="bg-[#111] text-zinc-300 px-2 py-0.5 rounded border border-app-border text-[10px] font-bold tracking-wider">
                      {isText ? 'Text Layer' : 'Image Layer'}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {/* 1. CONTENT SECTION */}
                    <PropertySection title="Content">
                      {/* Source */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-app-muted/80">Source</label>
                        <div className="flex items-center bg-app-bg border border-app-border rounded-[4px] focus-within:border-app-accent overflow-hidden h-8">
                          <span className="bg-app-sidebar text-app-muted h-full px-2 text-[11px] font-mono flex items-center border-r border-app-border">{"{{"}</span>
                          <input 
                            type="text" 
                            disabled={!isEditable('dataKey')}
                            value={(() => {
                              if (overrides.dataKey !== undefined) return overrides.dataKey;
                              if ((el as any).dataKey) return (el as any).dataKey;
                              
                              // Check if text itself has a binding
                              const baseText = (el as any).text;
                              if (typeof baseText === 'string' && baseText.includes('{{')) {
                                return baseText.replace('{{', '').replace('}}', '').trim();
                              }
                              return "";
                            })()}
                            onChange={e => handleOverride(el.id, { dataKey: e.target.value })}
                            placeholder={isText ? "e.g. homeTeam.name" : "e.g. homeTeam.logo"}
                            className="w-full bg-transparent h-full px-2 text-app-text text-[12px] outline-none font-mono disabled:opacity-50"
                          />
                          <span className="bg-app-sidebar text-app-muted h-full px-2 text-[11px] font-mono flex items-center border-l border-app-border">{"}}"}</span>
                        </div>
                      </div>

                      {/* Transform (Formatter) */}
                      <div className="space-y-1.5 bg-app-card border border-app-border rounded-md p-3 pb-4 relative">
                        <label className="text-[10px] font-medium text-app-muted/80 flex justify-between">
                          Transform
                          {activeFormatters.length > 0 && (
                            <button 
                              onClick={() => handleOverride(el.id, { formatters: [] })}
                              className="text-[9px] text-app-accent hover:underline lowercase"
                            >
                              Clear
                            </button>
                          )}
                        </label>
                        
                        <div className="flex flex-col gap-2 mt-2">
                          {activeFormatters.map((fmt: string, idx: number) => (
                            <div key={idx} className="flex bg-app-bg border border-app-border rounded-[4px] text-[11px] items-center px-2 py-1">
                               <span className="text-cyan-400 font-mono text-[10px] select-none mr-2">|</span>
                               <span className="truncate flex-1 font-mono text-[9px]">{fmt}</span>
                               <button onClick={() => {
                                   const arr = [...activeFormatters];
                                   arr.splice(idx, 1);
                                   handleOverride(el.id, { formatters: arr });
                               }} className="text-red-400 hover:text-red-300 ml-2">×</button>
                            </div>
                          ))}
                        </div>
                        
                        <select 
                          className="w-full bg-app-bg border border-app-border rounded-[4px] p-1.5 text-app-text text-[11px] outline-none focus:border-app-accent mt-2 cursor-pointer"
                          onChange={(e) => {
                            if (!e.target.value) return;
                            handleOverride(el.id, { formatters: [...activeFormatters, e.target.value] });
                            e.target.value = "";
                          }}
                        >
                          <option value="">+ Add Pipeline...</option>
                          <option value="uppercase">Uppercase</option>
                          <option value="lowercase">Lowercase</option>
                          <option value="titlecase">Titlecase</option>
                          <option value="number">Number (1,234)</option>
                          <option value="shorten:10">Shorten (10 chars)</option>
                        </select>
                      </div>

                      {/* Value (Rendered/Override) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] font-medium text-app-muted/80">Value</label>
                          {(overrides.text !== undefined || overrides.src !== undefined) && (
                            <button 
                              onClick={() => handleOverride(el.id, isText ? { text: undefined } : { src: undefined })} 
                              className="text-[9px] text-app-accent hover:underline"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        {isText ? (
                          <Input 
                            disabled={!isEditable('text')}
                            value={overrides.text ?? ""} 
                            onChange={e => handleOverride(el.id, { text: e.target.value || undefined })}
                            placeholder={(() => {
                              const isBound = !!el.dataKey || (typeof el.text === 'string' && el.text.includes('{{'));
                              if (!isBound) return "Rendered value...";
                              const hasFormatters = (el.formatters || []).length > 0;
                              return hasFormatters ? `Parsed as ${resolved.text}` : (resolved.text || "");
                            })()}
                            className="h-8 text-[12px] bg-app-bg border-app-border"
                          />
                        ) : (
                          <div className="flex gap-1">
                            <Input 
                              disabled={!isEditable('src')}
                              value={overrides.src ?? ""} 
                              onChange={e => handleOverride(el.id, { src: e.target.value || undefined })}
                              placeholder={(() => {
                                const isBound = !!el.dataKey || (typeof (el as any).src === 'string' && (el as any).src.includes('{{'));
                                if (!isBound) return "Image URL...";
                                return `Bind to ${resolved.src}`;
                              })()}
                              className="h-8 text-[11px] bg-app-bg border-app-border"
                            />
                            <label className="shrink-0 h-8 w-8 bg-app-card border border-app-border flex items-center justify-center rounded-lg cursor-pointer hover:bg-muted hover:text-foreground transition-all">
                              <Upload size={14} className="text-app-muted" />
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

                    {/* 2. LAYOUT SECTION */}
                    <PropertySection title="Layout">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-app-muted/80 font-mono">X</label>
                          <Input 
                            type="number" 
                            disabled={!isEditable('x')}
                            value={overrides.x !== undefined ? overrides.x : el.x} 
                            onChange={e => handleOverride(el.id, { x: Number(e.target.value) })}
                            className="h-8 text-[12px] bg-app-bg"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-app-muted/80 font-mono">Y</label>
                          <Input 
                            type="number" 
                            disabled={!isEditable('y')}
                            value={overrides.y !== undefined ? overrides.y : el.y} 
                            onChange={e => handleOverride(el.id, { y: Number(e.target.value) })}
                            className="h-8 text-[12px] bg-app-bg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-app-muted/80">Width</label>
                          <Input 
                            type="number" 
                            disabled={!isEditable('width')}
                            value={overrides.width !== undefined ? overrides.width : el.width} 
                            onChange={e => handleOverride(el.id, { width: Number(e.target.value) })}
                            className="h-8 text-[12px] bg-app-bg"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-app-muted/80">Height</label>
                          <Input 
                            type="number" 
                            disabled={!isEditable('height')}
                            value={overrides.height !== undefined ? overrides.height : el.height} 
                            onChange={e => handleOverride(el.id, { height: Number(e.target.value) })}
                            className="h-8 text-[12px] bg-app-bg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-app-muted/80">Align</label>
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
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-app-muted/80">Rotation</label>
                          <div className="relative">
                            <Input 
                              type="number" 
                              disabled={!isEditable('rotation')}
                              value={overrides.rotation !== undefined ? overrides.rotation : el.rotation} 
                              onChange={e => handleOverride(el.id, { rotation: Number(e.target.value) })}
                              className="h-8 text-[12px] bg-app-bg pr-5"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-app-muted">°</span>
                          </div>
                        </div>
                      </div>
                    </PropertySection>

                    {/* 3. TYPOGRAPHY SECTION */}
                    {isText && (
                      <PropertySection title="Typography">
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-medium text-app-muted/80">Font Family</label>
                            <Select 
                              value={overrides.fontFamily !== undefined ? overrides.fontFamily : el.fontFamily}
                              onValueChange={val => handleOverride(el.id, { fontFamily: val })}
                            >
                              <SelectTrigger className="h-8 text-[12px] bg-app-bg border-app-border">
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

                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-medium text-app-muted/80">Weight</label>
                                <Select 
                                  value={String(overrides.fontWeight !== undefined ? overrides.fontWeight : el.fontWeight)}
                                  onValueChange={val => handleOverride(el.id, { fontWeight: val })}
                                >
                                  <SelectTrigger className="h-8 text-[11px] bg-app-bg border-app-border">
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
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-medium text-app-muted/80">Size</label>
                                <Input 
                                  type="number" 
                                  value={overrides.fontSize !== undefined ? overrides.fontSize : el.fontSize} 
                                  onChange={e => handleOverride(el.id, { fontSize: Number(e.target.value) })}
                                  className="h-8 text-[12px] bg-app-bg"
                                />
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-medium text-app-muted/80">Line height</label>
                                <Input 
                                  type="number" 
                                  step={0.1}
                                  value={overrides.lineHeight !== undefined ? overrides.lineHeight : el.lineHeight} 
                                  onChange={e => handleOverride(el.id, { lineHeight: Number(e.target.value) })}
                                  className="h-8 text-[12px] bg-app-bg"
                                />
                             </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-medium text-app-muted/80">Spacing</label>
                                <Input 
                                  type="number" 
                                  value={overrides.letterSpacing !== undefined ? overrides.letterSpacing : el.letterSpacing} 
                                  onChange={e => handleOverride(el.id, { letterSpacing: Number(e.target.value) })}
                                  className="h-8 text-[12px] bg-app-bg"
                                />
                             </div>
                          </div>
                        </div>
                      </PropertySection>
                    )}

                    {/* 4. FILL SECTION */}
                    <PropertySection title="Fill">
                       <div className="space-y-4">
                          <div className="grid grid-cols-[1fr,auto] gap-2 items-center">
                             <div className="space-y-1.5">
                                <div className="flex justify-between items-center h-4">
                                  <label className="text-[10px] font-medium text-app-muted/80">Color</label>
                                  {overrides.fill !== undefined && (
                                    <button 
                                      onClick={() => handleOverride(el.id, { fill: undefined })} 
                                      className="text-[9px] text-app-accent hover:underline"
                                    >
                                      Reset
                                    </button>
                                  )}
                                </div>
                                <div className="flex gap-2 items-center">
                                  <input 
                                    type="color" 
                                    value={resolved.fill?.startsWith('#') ? resolved.fill.substring(0, 7) : '#ffffff'}
                                    onChange={e => handleOverride(el.id, { fill: e.target.value })}
                                    className="w-8 h-8 rounded border-none outline-none cursor-pointer bg-transparent shadow-[0_0_0_1px_var(--app-border)] p-0 shrink-0"
                                  />
                                  <Input 
                                    placeholder={(() => {
                                      const baseFill = (el as any).style?.fill;
                                      const currentFill = overrides.fill !== undefined ? overrides.fill : baseFill;
                                      
                                      const isBaseBound = typeof baseFill === 'string' && baseFill.includes('{{');
                                      const isCurrentBound = typeof currentFill === 'string' && currentFill.includes('{{');
                                      
                                      if (isCurrentBound || isBaseBound) {
                                        return `Bind to ${resolved.fill}`;
                                      }
                                      return "#FFFFFF";
                                    })()}
                                    value={(() => {
                                      const val = overrides.fill !== undefined ? overrides.fill : (el as any).style?.fill;
                                      return (typeof val === 'string' && !val.includes('{{')) ? val : "";
                                    })()}
                                    onChange={e => handleOverride(el.id, { fill: e.target.value || undefined })}
                                    className="flex-1 bg-app-bg border-app-border h-8 text-[12px] font-mono focus:border-app-accent outline-none"
                                  />
                               </div>
                            </div>
                            <div className="space-y-1.5">
                               <label className="text-[10px] font-medium text-app-muted/80">Opacity</label>
                               <div className="w-20 relative">
                                 <Input 
                                   type="number"
                                   min={0} max={100}
                                   value={Math.round((overrides.opacity !== undefined ? overrides.opacity : el.opacity) * 100)}
                                   onChange={e => handleOverride(el.id, { opacity: Number(e.target.value) / 100 })}
                                   className="h-8 text-[11px] pr-6"
                                 />
                                 <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">%</span>
                               </div>
                            </div>
                         </div>

                          {/* Source */}
                         <div className="space-y-1.5 mt-2">
                            <div className="flex justify-between items-center h-4">
                               <label className="text-[10px] font-medium text-app-muted/80">Source</label>
                            </div>
                            <div className="flex bg-app-bg border border-app-border rounded-[4px] focus-within:border-app-accent overflow-hidden h-8">
                               <span className="bg-app-sidebar text-app-muted px-2 py-1.5 text-[11px] font-mono border-r border-app-border flex items-center">{"{{"}</span>
                                 <input 
                                   type="text"
                                   value={(() => {
                                     // 1. If user is actively overriding WITH a binding, show it.
                                     if (typeof overrides.fill === 'string' && overrides.fill.includes('{{')) {
                                       return overrides.fill.replace('{{', '').replace('}}', '').trim();
                                     }
                                     // 2. Otherwise show template's binding if it exists
                                     const baseVal = (el as any).style?.fill;
                                     if (typeof baseVal === 'string' && baseVal.includes('{{')) {
                                       return baseVal.replace('{{', '').replace('}}', '').trim();
                                     }
                                     return "";
                                   })()}
                                   onChange={e => handleOverride(el.id, { fill: e.target.value ? `{{${e.target.value}}}` : undefined })}
                                 className="w-full bg-transparent p-1.5 text-app-text text-[12px] outline-none font-mono"
                               />
                               <span className="bg-app-sidebar text-app-muted px-2 py-1.5 text-[11px] font-mono border-l border-app-border flex items-center">{"}}"}</span>
                            </div>
                         </div>
                       </div>
                    </PropertySection>

                    {/* 5. OUTLINE SECTION */}
                    <PropertySection title="Outline">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <label className="text-[10px] font-medium text-app-muted/80">Enable</label>
                             <Switch 
                               checked={resolved.strokeEnabled !== undefined ? resolved.strokeEnabled : (resolved.strokeWidth || 0) > 0}
                               onCheckedChange={checked => {
                                 const updates: any = { strokeEnabled: checked };
                                 // If turning on and width is 0, give it a default so it's visible, 
                                 // BUT if user manually sets 0 later, it stays on.
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
                                  <label className="text-[10px] font-medium text-app-muted/80">Width (px)</label>
                                  <Input 
                                    type="number"
                                    min={0}
                                    value={resolved.strokeWidth || 0}
                                    onChange={e => handleOverride(el.id, { strokeWidth: Number(e.target.value) })}
                                    className="bg-app-bg h-8 text-[12px] font-mono"
                                  />
                               </div>
                            </div>
                          )}
                       </div>
                    </PropertySection>

                    {/* 6. SHADOW SECTION */}
                    <PropertySection title="Shadow">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <label className="text-[10px] font-medium text-app-muted/80">Enable</label>
                             <Switch 
                               checked={resolved.shadowEnabled || false}
                               onCheckedChange={checked => handleOverride(el.id, { shadowEnabled: checked })}
                             />
                          </div>

                          {(resolved.shadowEnabled || false) && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                               <div className="flex gap-2 items-center">
                                  <input 
                                    type="color" 
                                    value={resolved.shadowColor || '#000000'}
                                    onChange={e => handleOverride(el.id, { shadowColor: e.target.value })}
                                    className="w-8 h-8 rounded border-none outline-none cursor-pointer bg-transparent shadow-[0_0_0_1px_var(--app-border)] p-0 shrink-0"
                                  />
                                  <div className="flex-1 flex gap-2">
                                     <Input 
                                       value={resolved.shadowColor || '#000000'}
                                       onChange={e => handleOverride(el.id, { shadowColor: e.target.value })}
                                       className="flex-1 bg-app-bg h-8 text-[12px] font-mono"
                                     />
                                     <Input 
                                       type="number"
                                       placeholder="Blur"
                                       value={resolved.shadowBlur || 0}
                                       onChange={e => handleOverride(el.id, { shadowBlur: Number(e.target.value) })}
                                       className="w-12 h-8 text-[11px] bg-app-bg"
                                     />
                                  </div>
                               </div>
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                     <label className="text-[10px] font-medium text-app-muted/80">Offset X</label>
                                     <Input 
                                       type="number"
                                       value={resolved.shadowOffsetX || 0}
                                       onChange={e => handleOverride(el.id, { shadowOffsetX: Number(e.target.value) })}
                                       className="h-8 text-[12px] bg-app-bg"
                                     />
                                  </div>
                                  <div className="space-y-1.5">
                                     <label className="text-[10px] font-medium text-app-muted/80">Offset Y</label>
                                     <Input 
                                       type="number"
                                       value={resolved.shadowOffsetY || 0}
                                       onChange={e => handleOverride(el.id, { shadowOffsetY: Number(e.target.value) })}
                                       className="h-8 text-[12px] bg-app-bg"
                                     />
                                  </div>
                               </div>
                            </div>
                          )}
                       </div>
                    </PropertySection>

                    {/* 7. BACKGROUND SECTION */}
                    {isText && (
                      <PropertySection title="Background">
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                               <label className="text-[10px] font-medium text-app-muted/80">Enable</label>
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
                                       <label className="text-[10px] font-medium text-app-muted/80">Padding</label>
                                       <Input 
                                         type="number"
                                         value={overrides.bgPadding !== undefined ? overrides.bgPadding : el.bgPadding}
                                         onChange={e => handleOverride(el.id, { bgPadding: Number(e.target.value) })}
                                         className="h-8 text-[12px] bg-app-bg"
                                       />
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className="text-[10px] font-medium text-app-muted/80">Radius</label>
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
                <h3 className="text-[12px] tracking-[1px] text-app-muted font-[700] mb-4 flex items-center gap-2">
                  <Layers size={14}/> Layer Groups
                </h3>
                <div className="space-y-1">
                   {template.layers.map((layer: any) => {
                    const isExpanded = expandedLayers[layer.id];
                    const isLayerVisible = elementOverrides[layer.id]?.visible !== undefined 
                      ? elementOverrides[layer.id].visible 
                      : (layer.visible !== false);

                    return (
                      <div key={layer.id} className="flex flex-col">
                        <div 
                          className="flex items-center gap-2 text-[11px] p-2 bg-app-card rounded-[6px] border border-app-border mb-1 hover:border-app-accent/50 cursor-pointer overflow-hidden transition-colors"
                          onClick={() => toggleLayerExpanded(layer.id)}
                        >
                           <button className="text-app-muted hover:text-app-text shrink-0">
                               <div className={cn("transition-transform", isExpanded ? "rotate-90" : "")}>
                                   <ChevronRight size={14}/>
                               </div>
                           </button>
                           <button 
                             className="text-app-muted hover:text-app-text transition-colors shrink-0 z-10"
                             onClick={(e) => {
                               e.stopPropagation();
                               handleOverride(layer.id, { visible: !isLayerVisible });
                             }}
                           >
                               {isLayerVisible ? <Eye size={14}/> : <EyeOff size={14} className="opacity-50" />}
                           </button>
                           <div className="text-yellow-500 shrink-0">
                               {isExpanded ? <FolderOpen size={14}/> : <Folder size={14}/>}
                           </div>
                           <span className="font-bold text-app-text truncate flex-1">{layer.name}</span>
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
                                        "flex items-center gap-2 text-[11px] py-1.5 pr-2 pl-9 rounded-[4px] border border-transparent transition-all cursor-pointer relative",
                                        isSelected ? "bg-app-card text-app-text border-app-border" :
                                        hoveredElementId === el.id 
                                        ? "bg-app-card/50 text-app-text" 
                                        : "text-app-muted hover:bg-app-card/50"
                                    )}
                                    style={{
                                        backgroundImage: "linear-gradient(#333, #333)",
                                        backgroundPosition: "20px center",
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
                                    <div className="w-[12px] h-[1px] bg-[#333] absolute left-[20px]"></div>

                                    <button 
                                      className="text-app-muted hover:text-app-text transition-colors shrink-0 z-10 bg-transparent pl-1 relative"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOverride(el.id, { visible: !isVisible });
                                      }}
                                    >
                                        {isVisible ? <Eye size={12}/> : <EyeOff size={12} className="opacity-50" />}
                                    </button>
                                    <div className="shrink-0 text-app-muted flex items-center justify-center w-4 h-4 rounded">
                                        {isText && <Type size={12}/>}
                                        {isImage && <LucideImage size={12}/>}
                                        {isShape && <Square size={12}/>}
                                    </div>
                                    <span className={cn("truncate flex-1 font-medium", isSelected ? "font-bold" : "")}>{el.label || el.name || el.id}</span>
                                    {el.dataKey && (
                                        <span 
                                            className="bg-app-accent/20 text-app-accent px-1 py-0.5 ml-1 rounded leading-none text-[8px] font-bold shrink-0" 
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
