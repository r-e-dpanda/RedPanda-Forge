import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Stage, Layer, Image, Text, Rect, Group } from "react-konva";
import useImage from "use-image";
import { Template, TemplateElement, TemplateLayer, Match } from "../../lib/types";
import { ZoomIn, ZoomOut, PanelRightClose, PanelRightOpen, SlidersHorizontal, Layers, Type, Image as LucideImage, Square, Eye, EyeOff, Folder, FolderOpen, ChevronRight, ChevronLeft, Droplet, Move, MoveHorizontal, MoveVertical } from "lucide-react";
import { cn } from "../../lib/utils";

interface EditorWorkspaceProps {
  template: Template | null;
  match: Match | null;
}

export interface EditorRef {
  exportPNG: () => void;
}

// Custom Image Component handling CORS and URL Loading
const URLImage = ({ imageInfo, commonProps }: { imageInfo: TemplateElement, commonProps: any }) => {
  const [img] = useImage(imageInfo.src || "", "anonymous");
  return (
    <Image
      x={imageInfo.x}
      y={imageInfo.y}
      width={imageInfo.width}
      height={imageInfo.height}
      rotation={imageInfo.rotation}
      opacity={imageInfo.opacity}
      image={img}
      {...commonProps}
    />
  );
};

const EditorWorkspace = forwardRef<EditorRef, EditorWorkspaceProps>(({ template, match }, ref) => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [rightExpanded, setRightExpanded] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'match' | 'editor'>('match'); // Changed from 'layers' to 'editor'
  
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [manualInputs, setManualInputs] = useState<Record<string, string>>({});
  const [elementOverrides, setElementOverrides] = useState<Record<string, Partial<TemplateElement>>>({});

  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (template) {
      const initial: Record<string, boolean> = {};
      template.layers.forEach(l => {
        initial[l.id] = l.expanded !== false;
      });
      setExpandedLayers(initial);
      setSelectedElementId(null); // Reset selection on template change
    }
  }, [template]);

  const toggleLayerExpanded = (id: string) => {
    setExpandedLayers(prev => ({...prev, [id]: !prev[id]}));
  };

  useImperativeHandle(ref, () => ({
    exportPNG: () => {
      if (!stageRef.current || !template) return; // Allow export without match
      setSelectedElementId(null); // Unselect before export to hide transformer
      
      setTimeout(() => {
        const fallbackId = match?.id || 'nomatch';
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `thumbnail_${fallbackId}_${template.id}.png`;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 50); // slight delay to let state render
    }
  }));

  useEffect(() => {
    if (!containerRef.current || !template) return;
    
    // Fit to container logic
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    const scaleX = (containerWidth - 60) / template.width;
    const scaleY = (containerHeight - 120) / template.height;
    
    setScale(Math.min(scaleX, scaleY));
  }, [template, rightExpanded]);

  if (!template) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-app-muted bg-app-bg p-8 m-[1px]">
        <p>Select a template to open the editor.</p>
      </div>
    );
  }

  // --- Data Binding Engine ---
  const isAutoResolved = (dataKey: string) => {
    if (!match) return false;
    const autoKeys = [
      "match.league", "competition.name", "match.date", "date", 
      "time", "round", "venue.name", "homeTeam.name", "awayTeam.name", 
      "homeTeam.shortName", "awayTeam.shortName", "player1.name", 
      "player2.name", "homeTeam.logo", "awayTeam.logo", "player1.flag", "player2.flag"
    ];
    return autoKeys.includes(dataKey);
  }

  const handleOverrideChange = (id: string, overrides: Partial<TemplateElement>) => {
    setElementOverrides(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        ...overrides
      }
    }));
  };

  const resolveBoundData = (element: TemplateElement): TemplateElement => {
    let resolvedElement = { ...element };
    
    // 1. Data Binding logic
    if (element.dataKey) {
      const isAuto = isAutoResolved(element.dataKey);

      if (element.type === "Text" || element.type === "text") {
        if (!isAuto) {
           resolvedElement.text = manualInputs[element.dataKey] !== undefined ? manualInputs[element.dataKey] : `{{${element.dataKey}}}`;
        } else {
            if (element.dataKey === "match.league" || element.dataKey === "competition.name") resolvedElement.text = match!.league;
            if (element.dataKey === "match.date" || element.dataKey === "date") resolvedElement.text = new Date(match!.date).toLocaleDateString("en-GB", { day: 'numeric', month: '2-digit', year: 'numeric' });
            if (element.dataKey === "time") resolvedElement.text = "19:45"; // mock time
            if (element.dataKey === "round") resolvedElement.text = "Final"; // mock round
            if (element.dataKey === "venue.name") resolvedElement.text = match!.venue || "Stadium";
            if (element.dataKey === "homeTeam.name") resolvedElement.text = match!.homeTeam?.name || "";
            if (element.dataKey === "awayTeam.name") resolvedElement.text = match!.awayTeam?.name || "";
            if (element.dataKey === "homeTeam.shortName") resolvedElement.text = match!.homeTeam?.shortName || match!.homeTeam?.name?.substring(0,3).toUpperCase() || "";
            if (element.dataKey === "awayTeam.shortName") resolvedElement.text = match!.awayTeam?.shortName || match!.awayTeam?.name?.substring(0,3).toUpperCase() || "";
            if (element.dataKey === "player1.name") resolvedElement.text = match!.player1?.name || "";
            if (element.dataKey === "player2.name") resolvedElement.text = match!.player2?.name || "";
        }
      } else if (element.type === "Image" || element.type === "image" || element.type === "BackgroundImage") {
        if (!isAuto) {
             resolvedElement.src = manualInputs[element.dataKey] !== undefined ? manualInputs[element.dataKey] : "";
        } else {
            if (element.dataKey === "homeTeam.logo") resolvedElement.src = match!.homeTeam?.logo;
            if (element.dataKey === "awayTeam.logo") resolvedElement.src = match!.awayTeam?.logo;
            if (element.dataKey === "player1.flag") resolvedElement.src = match!.player1?.flag;
            if (element.dataKey === "player2.flag") resolvedElement.src = match!.player2?.flag;
        }
      }
    }
    
    // 2. Editor Override logic (applied last)
    if (elementOverrides[element.id]) {
      resolvedElement = {
        ...resolvedElement,
        ...elementOverrides[element.id]
      };
    }

    return resolvedElement;
  };

  let flatElements: TemplateElement[] = [];
  template.layers.forEach(layer => {
    if (layer.visible !== false) {
      layer.elements.forEach(el => {
        if (el.visible !== false) flatElements.push(el);
      });
    }
  });

  const elementsWithData = flatElements.map(resolveBoundData);
  const elementsWithBinding = flatElements.filter(el => el.dataKey);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Canvas Area Main Column */}
      <div className="flex-1 flex flex-col relative bg-app-bg overflow-hidden">
        
        {/* Floating expand toggle if panel is closed */}
        {!rightExpanded && (
           <button 
             onClick={() => setRightExpanded(true)}
             className="absolute top-4 right-4 z-20 p-2 bg-app-sidebar border border-app-border text-app-muted hover:text-white rounded-md shadow-lg transition-colors"
             title="Open Properties"
           >
             <PanelRightOpen size={18} />
           </button>
        )}
        
        {/* Canvas Container */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto flex flex-col items-center justify-center bg-[#070707] relative p-8"
        >
          <div style={{ 
            width: template.width * scale, 
            height: template.height * scale,
            backgroundColor: '#111',
            boxShadow: '0 0 40px rgba(0,0,0,0.5)',
            border: '1px solid #333',
            position: 'relative'
          }}>
            <Stage 
              ref={stageRef}
              width={template.width * scale} 
              height={template.height * scale}
              scaleX={scale}
              scaleY={scale}
              className="overflow-hidden"
              onMouseDown={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) {
                  setSelectedElementId(null);
                }
              }}
              onTouchStart={(e) => {
                const clickedOnEmpty = e.target === e.target.getStage();
                if (clickedOnEmpty) {
                  setSelectedElementId(null);
                }
              }}
            >
              <Layer>
                {elementsWithData.map((element) => {

                  const commonProps = {
                    draggable: element.draggable,
                    onClick: (e: any) => {
                      e.cancelBubble = true;
                      setSelectedElementId(element.id);
                      setActiveRightTab('editor');
                    },
                    onTap: (e: any) => {
                      e.cancelBubble = true;
                      setSelectedElementId(element.id);
                      setActiveRightTab('editor');
                    },
                    onDragEnd: (e: any) => {
                      handleOverrideChange(element.id, { x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
                    }
                  };

                  if (element.type === "BackgroundImage" || element.type === "Image" || element.type === "image") {
                    return <URLImage key={element.id} imageInfo={element} commonProps={commonProps} />;
                  }
                  
                  if (element.type === "Shape" || element.type === "rect") {
                    return (
                      <Rect
                        key={element.id}
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        fill={element.fill}
                        rotation={element.rotation}
                        opacity={element.opacity !== undefined ? element.opacity : 1}
                        shadowColor={element.shadowColor}
                        shadowBlur={element.shadowBlur}
                        shadowOffsetX={element.shadowOffsetX}
                        shadowOffsetY={element.shadowOffsetY}
                        {...commonProps}
                      />
                    );
                  }
                  
                  if (element.type === "Text" || element.type === "text") {
                    return (
                      <Text
                        key={element.id}
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        text={element.textTransform === "uppercase" ? element.text?.toUpperCase() : element.text}
                        fontSize={element.fontSize}
                        fontFamily={element.fontFamily}
                        fill={element.fill}
                        align={element.align}
                        fontStyle={element.fontStyle || (element.fontWeight === "bold" ? "bold" : "normal")}
                        rotation={element.rotation}
                        opacity={element.opacity !== undefined ? element.opacity : 1}
                        letterSpacing={element.letterSpacing}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                        shadowColor={element.shadowColor}
                        shadowBlur={element.shadowBlur}
                        shadowOffsetX={element.shadowOffsetX}
                        shadowOffsetY={element.shadowOffsetY}
                        {...commonProps}
                      />
                    );
                  }
                  
                  return null;
                })}

                {/* Highlight Hovered Layer OR Selected Layer */}
                {(() => {
                  const targetId = selectedElementId || hoveredElementId;
                  if (!targetId) return null;
                  const targetEl = elementsWithData.find(l => l.id === targetId);
                  if (!targetEl) return null;
                  return (
                    <Rect
                      x={targetEl.x}
                      y={targetEl.y}
                      width={targetEl.width}
                      height={targetEl.height || 0}
                      rotation={targetEl.rotation}
                      stroke={selectedElementId === targetId ? "#facc15" : "#22d3ee"} // Yellow if selected, cyan if hovered
                      strokeWidth={selectedElementId === targetId ? 4 / scale : 4 / scale}
                      dash={selectedElementId === targetId ? [] : [10 / scale, 5 / scale]}
                      fill={selectedElementId === targetId ? "transparent" : "rgba(34, 211, 238, 0.1)"}
                      listening={false}
                    />
                  );
                })()}
              </Layer>
            </Stage>
          </div>

          {/* Floating Toolbar mimicking the HTML */}
          <div className="absolute bottom-[20px] bg-black/80 backdrop-blur-md rounded-[100px] px-5 py-2 flex gap-4 border border-white/10 text-[12px] text-app-muted items-center">
            <div className="flex items-center gap-1">
              <button className="hover:text-white" onClick={() => setScale(s => s * 0.9)}><ZoomOut size={14} /></button>
              Zoom: <span className="text-white w-10 text-center">{Math.round(scale * 100)}%</span>
              <button className="hover:text-white" onClick={() => setScale(s => s * 1.1)}><ZoomIn size={14} /></button>
            </div>
            <div className="w-[1px] h-[16px] bg-app-border"></div>
            <div>Guide Lines: <span className="text-app-accent font-bold">ON</span></div>
            <div className="w-[1px] h-[16px] bg-app-border"></div>
            <div className="cursor-pointer hover:text-white">Snap to Grid</div>
          </div>
        </div>
      </div>

      {/* Properties Sidebar */}
      {rightExpanded && (
        <aside className="w-[320px] flex flex-col bg-app-sidebar border-l border-app-border shrink-0 z-10 relative transition-all">
          <div className="flex border-b border-app-border bg-app-sidebar h-[56px] shrink-0">
            <button 
              onClick={() => setActiveRightTab('match')}
              className={cn(
                "flex-1 text-[12px] font-[700] transition-colors border-b-[2px]",
                activeRightTab === 'match' ? "border-app-accent text-white" : "border-transparent text-app-muted hover:text-white hover:bg-white/5"
              )}
            >
              Match & Data
            </button>
            <button 
              onClick={() => setActiveRightTab('editor')}
              className={cn(
                "flex-1 text-[12px] font-[700] transition-colors border-b-[2px]",
                activeRightTab === 'editor' ? "border-app-accent text-white" : "border-transparent text-app-muted hover:text-white hover:bg-white/5"
              )}
            >
              Editor
            </button>
            <button 
              onClick={() => setRightExpanded(false)}
              className="w-[48px] flex items-center justify-center border-b-[2px] border-transparent text-app-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              <PanelRightClose size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto w-[320px]">
            {activeRightTab === 'match' && (
              <div className="p-5 space-y-6">
                
                {match && (
                  <>
                    {/* Competition */}
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[1px] text-app-muted font-[700] mb-2">Competition</h3>
                      <div className="flex gap-2 text-[11px] font-bold">
                        <span className="px-2.5 py-1 rounded-[4px] border border-cyan-500/30 text-cyan-400 bg-cyan-500/10 capitalize">
                          {match.sport}
                        </span>
                        <span className="px-2.5 py-1 rounded-[4px] border border-app-border text-[#ccc] bg-white/5">
                          {match.league}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[1px] text-app-muted font-[700] mb-2">Status</h3>
                      <div className="flex gap-2 text-[11px] font-bold">
                        {match.liveBadge ? (
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-app-accent/30 text-app-accent bg-app-accent/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-app-accent animate-pulse"></div>
                            LIVE {match.score ? "— 67'" : ""}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-[4px] border border-app-border text-[#ccc] bg-white/5">
                            UPCOMING
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Teams */}
                    {match.sport === 'football' || match.sport === 'basketball' ? (
                      <div>
                        <h3 className="text-[10px] uppercase tracking-[1px] text-app-muted font-[700] mb-3">Teams</h3>
                        <div className="flex flex-col gap-3">
                          {/* Home */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: match.homeTeam?.color || '#6CABDD' }}></div>
                              <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-white">{match.homeTeam?.name}</span>
                                <span className="text-[10px] text-app-muted">Home</span>
                              </div>
                            </div>
                            <div className="text-[18px] font-[800] text-white">
                               {match.score ? match.score.split('-')[0].trim() : '-'}
                            </div>
                          </div>
                          
                          {/* Away */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: match.awayTeam?.color || '#DA291C' }}></div>
                              <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-white">{match.awayTeam?.name}</span>
                                <span className="text-[10px] text-app-muted">Away</span>
                              </div>
                            </div>
                            <div className="text-[18px] font-[800] text-white">
                              {match.score ? match.score.split('-')[1].trim() : '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-[10px] uppercase tracking-[1px] text-app-muted font-[700] mb-3">Players</h3>
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3 space-y-1">
                              <img src={match.player1?.flag} className="w-4 h-3 object-cover" alt="" />
                              <span className="text-[14px] font-bold text-white">{match.player1?.name}</span>
                          </div>
                          <div className="flex items-center gap-3 space-y-1">
                              <img src={match.player2?.flag} className="w-4 h-3 object-cover" alt="" />
                              <span className="text-[14px] font-bold text-white">{match.player2?.name}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[1px] text-app-muted font-[700] mb-3">Details</h3>
                      <div className="flex flex-col gap-1.5 text-[12px]">
                        {match.venue && (
                          <div className="flex justify-between border-b border-app-border/50 pb-1.5">
                            <span className="text-app-muted">Venue</span>
                            <span className="text-white font-[600] text-right">{match.venue}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-b border-app-border/50 pb-1.5">
                          <span className="text-app-muted">Date</span>
                          <span className="text-white font-[600] text-right">{new Date(match.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex justify-between border-b border-app-border/50 pb-1.5">
                          <span className="text-app-muted">Kickoff</span>
                          <span className="text-white font-[600] text-right">{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} GMT</span>
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

                {/* Data Bindings (Resolved) */}
                <div>
                  <h3 className="text-[10px] uppercase tracking-[1px] text-app-muted font-[700] mb-3">Data Bindings</h3>
                  <div className="flex flex-col gap-2">
                    {elementsWithBinding.map(element => {
                       const resolved = resolveBoundData(element);
                       let displayVal = resolved.text || resolved.src || "";
                       const isAuto = isAutoResolved(element.dataKey!);
                       
                       return (
                        <div 
                           key={`bind-${element.id}`} 
                           className="flex flex-col gap-1.5 text-[11px] p-2.5 rounded-[6px] border border-app-border bg-[#111] hover:border-app-accent/50 transition-colors"
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
                              onChange={(e) => setManualInputs({...manualInputs, [element.dataKey!]: e.target.value})}
                              className="w-full bg-app-bg border border-app-border rounded p-1.5 text-white outline-none focus:border-app-accent text-[11px] mt-1"
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

            {activeRightTab === 'editor' && template && (
              <div className="p-5 overflow-y-auto w-full h-full pb-10">
                {selectedElementId ? (() => {
                  const el = flatElements.find(e => e.id === selectedElementId);
                  if (!el) return null;
                  const overrides = elementOverrides[el.id] || {};
                  const isText = el.type === 'Text' || el.type === 'text';
                  const editable = el.editableProperties || [];
                  
                  return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                      <button 
                        onClick={() => setSelectedElementId(null)}
                        className="flex items-center gap-1.5 text-app-muted hover:text-white text-[11px] font-bold uppercase tracking-[1px] mb-5 transition-colors"
                      >
                        <ChevronLeft size={14}/> Back to Layers
                      </button>

                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[14px] text-white font-[700] truncate">{el.label || el.name || 'Properties'}</h3>
                        <span className="bg-white/10 text-zinc-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                          {isText ? 'Text Layer' : 'Image Layer'}
                        </span>
                      </div>

                      {/* Properties Form */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">X</label>
                            <input 
                              type="number" 
                              disabled={!editable.includes('x')}
                              value={overrides.x !== undefined ? overrides.x : el.x} 
                              onChange={e => handleOverrideChange(el.id, { x: Number(e.target.value) })}
                              className="w-full bg-black/50 border border-app-border rounded-[4px] p-2 text-white text-[12px] outline-none focus:border-app-accent disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">Y</label>
                            <input 
                              type="number" 
                              disabled={!editable.includes('y')}
                              value={overrides.y !== undefined ? overrides.y : el.y} 
                              onChange={e => handleOverrideChange(el.id, { y: Number(e.target.value) })}
                              className="w-full bg-black/50 border border-app-border rounded-[4px] p-2 text-white text-[12px] outline-none focus:border-app-accent disabled:opacity-50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">Width</label>
                            <input 
                              type="number" 
                              disabled={!editable.includes('width')}
                              value={overrides.width !== undefined ? overrides.width : el.width} 
                              onChange={e => handleOverrideChange(el.id, { width: Number(e.target.value) })}
                              className="w-full bg-black/50 border border-app-border rounded-[4px] p-2 text-white text-[12px] outline-none focus:border-app-accent disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">Height</label>
                            <input 
                              type="number" 
                              disabled={!editable.includes('height')}
                              value={overrides.height !== undefined ? overrides.height : el.height || 0} 
                              onChange={e => handleOverrideChange(el.id, { height: Number(e.target.value) })}
                              className="w-full bg-black/50 border border-app-border rounded-[4px] p-2 text-white text-[12px] outline-none focus:border-app-accent disabled:opacity-50"
                            />
                          </div>
                        </div>

                        {isText && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">Font Size</label>
                              <input 
                                type="number" 
                                disabled={!editable.includes('fontSize')}
                                value={overrides.fontSize !== undefined ? overrides.fontSize : el.fontSize || 12} 
                                onChange={e => handleOverrideChange(el.id, { fontSize: Number(e.target.value) })}
                                className="w-full bg-black/50 border border-app-border rounded-[4px] p-2 text-white text-[12px] outline-none focus:border-app-accent disabled:opacity-50"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">Opacity</label>
                              <input 
                                type="number" 
                                disabled={!editable.includes('opacity')}
                                step="0.1" min="0" max="1"
                                value={overrides.opacity !== undefined ? overrides.opacity : el.opacity !== undefined ? el.opacity : 1} 
                                onChange={e => handleOverrideChange(el.id, { opacity: Number(e.target.value) })}
                                className="w-full bg-black/50 border border-app-border rounded-[4px] p-2 text-white text-[12px] outline-none focus:border-app-accent disabled:opacity-50"
                              />
                            </div>
                          </div>
                        )}

                        {isText && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">Font</label>
                            <select 
                              disabled={!editable.includes('fontFamily')}
                              value={overrides.fontFamily !== undefined ? overrides.fontFamily : el.fontFamily || 'Inter'}
                              onChange={e => handleOverrideChange(el.id, { fontFamily: e.target.value })}
                              className="w-full bg-black/50 border border-app-border rounded-[4px] p-2 text-white text-[12px] appearance-none outline-none focus:border-app-accent disabled:opacity-50"
                            >
                              <option value="Inter">Inter</option>
                              <option value="Bebas Neue">Bebas Neue</option>
                              <option value="Arial">Arial</option>
                              <option value="Anton">Anton</option>
                            </select>
                          </div>
                        )}

                        {el.dataKey && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">Binding</label>
                            <div className="w-full bg-cyan-900/20 border border-cyan-800/50 rounded-[4px] p-2 text-cyan-400 font-mono text-[12px] cursor-not-allowed">
                                &#123;&#123;{el.dataKey}&#125;&#125;
                            </div>
                          </div>
                        )}

                        {/* Fill Color - Simple Swatch */}
                        {isText && (
                          <div className="space-y-2 mt-4">
                            <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">Fill Color</label>
                            <div className="flex flex-wrap gap-2">
                               {['#FFFFFF', '#000000', '#FACC15', '#3B82F6', '#EF4444', '#10B981'].map(color => (
                                 <button
                                   key={color}
                                   disabled={!editable.includes('fill')}
                                   onClick={() => handleOverrideChange(el.id, { fill: color })}
                                   className={cn(
                                     "w-7 h-7 rounded-[4px] border-2 disabled:opacity-50 transition-transform hover:scale-110",
                                     (overrides.fill || el.fill) === color ? "border-white" : "border-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.1)] outline-none"
                                   )}
                                   style={{ backgroundColor: color }}
                                 />
                               ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })() : (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-200">
                    <h3 className="text-[11px] uppercase tracking-[1px] text-app-muted font-[700] mb-4 flex items-center gap-2">
                      <Layers size={14}/> Layer Groups
                    </h3>
                    <div className="space-y-1">
                      {template.layers.map(layer => {
                        const isExpanded = expandedLayers[layer.id];

                        return (
                          <div key={layer.id} className="flex flex-col">
                            {/* Parent Layer Row */}
                            <div 
                              className="flex items-center gap-2 text-[11px] p-2 bg-[#1b1c1f] rounded-[6px] border border-app-border mb-1 hover:border-app-accent/50 cursor-pointer overflow-hidden transition-colors"
                              onClick={() => toggleLayerExpanded(layer.id)}
                            >
                               <button className="text-zinc-400 hover:text-white shrink-0">
                                   <div className={cn("transition-transform", isExpanded ? "rotate-90" : "")}>
                                       <ChevronRight size={14}/>
                                   </div>
                               </button>
                               <div className="text-zinc-500 hover:text-white transition-colors shrink-0">
                                   {layer.visible !== false ? <Eye size={14}/> : <EyeOff size={14} className="opacity-50" />}
                               </div>
                               <div className="text-yellow-500 shrink-0">
                                   {isExpanded ? <FolderOpen size={14}/> : <Folder size={14}/>}
                               </div>
                               <span className="font-bold text-zinc-300 truncate flex-1">{layer.name}</span>
                            </div>

                            {/* Elements inside the layer */}
                            {isExpanded && layer.elements.map(el => {
                                const isText = el.type === 'Text' || el.type === 'text';
                                const isShape = el.type === 'Shape' || el.type === 'rect' || el.type === 'GradientOverlay';
                                const isImage = !isText && !isShape;
                                const isSelected = selectedElementId === el.id;

                                return (
                                    <div 
                                        key={el.id} 
                                        className={cn(
                                            "flex items-center gap-2 text-[11px] py-1.5 pr-2 pl-9 rounded-[4px] border border-transparent transition-all cursor-pointer relative",
                                            isSelected ? "bg-white/10 text-white" :
                                            hoveredElementId === el.id 
                                            ? "bg-white/5 text-zinc-200" 
                                            : "text-zinc-400 hover:bg-white/5"
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

                                        <div className="text-zinc-500 hover:text-white transition-colors shrink-0 z-10 bg-transparent pl-1 relative">
                                            {el.visible !== false ? <Eye size={12}/> : <EyeOff size={12} className="opacity-50" />}
                                        </div>
                                        <div className="shrink-0 text-app-muted flex items-center justify-center w-4 h-4 rounded">
                                            {isText && <Type size={12}/>}
                                            {isImage && <LucideImage size={12}/>}
                                            {isShape && <Square size={12}/>}
                                        </div>
                                        <span className={cn("truncate flex-1 font-medium", isSelected ? "font-bold" : "")}>{el.label || el.name || el.id}</span>
                                        {el.dataKey && (
                                            <span 
                                                className="bg-app-accent/20 text-app-accent px-1 py-0.5 ml-1 rounded leading-none text-[8px] uppercase font-bold shrink-0" 
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

            {activeRightTab === 'editor' && !template && (
              <div className="p-5 text-center text-app-muted text-xs italic mt-10">
                Please select a template...
              </div>
            )}
          </div>
        </aside>
      )}

    </div>
  );
});

export default EditorWorkspace;
