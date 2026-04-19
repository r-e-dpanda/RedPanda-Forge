import React from "react";
import { cn } from "../../lib/utils";
import { PanelRightClose, Layers, FileJson, AlertTriangle, Eye, EyeOff, FolderOpen, Folder, ChevronRight, ChevronLeft, Type, Square, Image as LucideImage } from "lucide-react";
import { useEditorStore } from "../../stores/editorStore";
import { resolveBoundData, isAutoResolved } from "../../lib/templateEngine";

interface RightPanelProps {
  rightExpanded: boolean;
  setRightExpanded: (val: boolean) => void;
  activeRightTab: 'match' | 'editor';
  setActiveRightTab: (val: 'match' | 'editor') => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ rightExpanded, setRightExpanded, activeRightTab, setActiveRightTab }) => {
  const {
    template,
    match,
    manualInputs,
    elementOverrides,
    selectedElementId,
    hoveredElementId,
    setHoveredElementId,
    setSelectedElementId,
    setElementOverride,
    setManualInput,
    expandedLayers,
    toggleLayerExpanded,
    commitHistory
  } = useEditorStore();

  if (!rightExpanded) return null;

  let flatElements: any[] = [];
  if (template) {
    template.layers.forEach(layer => {
      if (layer.visible !== false) {
        layer.elements.forEach(el => {
          if (el.visible !== false) flatElements.push(el);
        });
      }
    });
  }

  const elementsWithBinding = flatElements.filter(el => el.dataKey);

  const handleOverride = (id: string, overrides: any) => {
    setElementOverride(id, overrides);
    commitHistory();
  };

  return (
    <aside className="w-[320px] bg-app-sidebar border-l border-app-border flex flex-col pt-[48px] shrink-0 border-r border-[#151618] h-full shadow-[-10px_0_20px_rgba(0,0,0,0.5)] z-20 transition-all">
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
          <div className="p-5 overflow-y-auto w-full h-full pb-10 flex flex-col gap-6">
            
            {match && (
              <>
                <div className="flex items-center gap-3 bg-white/5 rounded-[6px] border border-white/10 p-3">
                  <span className="bg-app-accent text-app-bg px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                    {match.sport}
                  </span>
                  <span className="text-[12px] font-[600] text-zinc-300">{match.league}</span>
                </div>

                {match.homeTeam && match.awayTeam && (
                  <div>
                    <h3 className="text-[10px] uppercase tracking-[1px] text-app-muted font-[700] mb-3">Matchup</h3>
                    <div className="flex flex-col gap-3 p-3 bg-app-bg rounded-[6px] border border-app-border items-start justify-center">
                      <div className="flex items-center gap-3 space-y-1">
                          <img src={match.homeTeam.logo} className="w-6 h-6 object-contain" alt="" />
                          <span className="text-[14px] font-bold text-white">{match.homeTeam.name}</span>
                      </div>
                      <div className="text-[11px] text-app-muted font-[900] pl-[10px]">VS</div>
                      <div className="flex items-center gap-3 space-y-1">
                          <img src={match.awayTeam.logo} className="w-6 h-6 object-contain" alt="" />
                          <span className="text-[14px] font-bold text-white">{match.awayTeam.name}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {match.player1 && match.player2 && (
                  <div>
                    <h3 className="text-[10px] uppercase tracking-[1px] text-app-muted font-[700] mb-3">Matchup</h3>
                    <div className="flex flex-col gap-3 p-3 bg-app-bg rounded-[6px] border border-app-border items-start justify-center">
                      <div className="flex items-center gap-3 space-y-1">
                          <img src={match.player1.flag} className="w-4 h-3 object-cover" alt="" />
                          <span className="text-[14px] font-bold text-white">{match.player1.name}</span>
                      </div>
                      <div className="flex items-center gap-3 space-y-1">
                          <img src={match.player2.flag} className="w-4 h-3 object-cover" alt="" />
                          <span className="text-[14px] font-bold text-white">{match.player2.name}</span>
                      </div>
                    </div>
                  </div>
                )}

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

            <div>
              <h3 className="text-[10px] uppercase tracking-[1px] text-app-muted font-[700] mb-3">Data Bindings</h3>
              <div className="flex flex-col gap-2">
                {elementsWithBinding.map(element => {
                   const resolved = resolveBoundData(element, match, manualInputs, elementOverrides[element.id]);
                   let displayVal = resolved.text || resolved.src || "";
                   const isAuto = isAutoResolved(element.dataKey!, match);
                   
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
                          onChange={(e) => {
                            setManualInput(element.dataKey!, e.target.value);
                            commitHistory();
                          }}
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

        {/* Editor Tab starts here */}
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

                  <div className="space-y-4">
                    {/* Position */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">X</label>
                        <input 
                          type="number" 
                          disabled={!editable.includes('x')}
                          value={overrides.x !== undefined ? overrides.x : el.x} 
                          onChange={e => handleOverride(el.id, { x: Number(e.target.value) })}
                          className="w-full bg-black/50 border border-app-border rounded-[4px] p-2 text-white text-[12px] outline-none focus:border-app-accent disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">Y</label>
                        <input 
                          type="number" 
                          disabled={!editable.includes('y')}
                          value={overrides.y !== undefined ? overrides.y : el.y} 
                          onChange={e => handleOverride(el.id, { y: Number(e.target.value) })}
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
                          onChange={e => handleOverride(el.id, { width: Number(e.target.value) })}
                          className="w-full bg-black/50 border border-app-border rounded-[4px] p-2 text-white text-[12px] outline-none focus:border-app-accent disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">Height</label>
                        <input 
                          type="number" 
                          disabled={!editable.includes('height')}
                          value={overrides.height !== undefined ? overrides.height : el.height || 0} 
                          onChange={e => handleOverride(el.id, { height: Number(e.target.value) })}
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
                            onChange={e => handleOverride(el.id, { fontSize: Number(e.target.value) })}
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
                            onChange={e => handleOverride(el.id, { opacity: Number(e.target.value) })}
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
                          onChange={e => handleOverride(el.id, { fontFamily: e.target.value })}
                          className="w-full bg-black/50 border border-app-border rounded-[4px] p-2 text-white text-[12px] appearance-none outline-none focus:border-app-accent disabled:opacity-50"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Bebas Neue">Bebas Neue</option>
                          <option value="Arial">Arial</option>
                          <option value="Anton">Anton</option>
                        </select>
                      </div>
                    )}

                    {isText && (
                      <div className="space-y-2 mt-4">
                        <label className="text-[10px] uppercase tracking-[1px] text-app-muted font-[600]">Fill Color</label>
                        <div className="flex flex-wrap gap-2">
                           {['#FFFFFF', '#000000', '#FACC15', '#3B82F6', '#EF4444', '#10B981'].map(color => (
                             <button
                               key={color}
                               disabled={!editable.includes('fill')}
                               onClick={() => handleOverride(el.id, { fill: color })}
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
      </div>
    </aside>
  );
};

export default RightPanel;
