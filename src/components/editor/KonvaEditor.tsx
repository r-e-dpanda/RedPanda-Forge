import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Stage, Layer, Image, Text, Rect, Line, Group } from "react-konva";
import useImage from "use-image";
import { TemplateElement } from "../../types/template";
import { ZoomIn, ZoomOut, PanelRightOpen } from "lucide-react";
import { useEditorStore } from "../../stores/editorStore";
import { resolveBoundData } from "../../lib/templateEngine";

const URLImage = ({ imageInfo, commonProps }: { imageInfo: any, commonProps: any }) => {
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

interface KonvaEditorProps {
  rightExpanded: boolean;
  setRightExpanded: (val: boolean) => void;
  setActiveRightTab: (val: 'data' | 'design') => void;
}

export interface EditorRef {
  exportPNG: () => void;
}

const KonvaEditor = forwardRef<EditorRef, KonvaEditorProps>(({ rightExpanded, setRightExpanded, setActiveRightTab }, ref) => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const sessions = useEditorStore(state => state.sessions);
  const activeSessionId = useEditorStore(state => state.activeSessionId);
  const activeSession = sessions.find(s => s.id === activeSessionId);
  
  const template = activeSession?.template || null;
  const match = activeSession?.match || null;
  const manualInputs = activeSession?.manualInputs || {};
  const elementOverrides = activeSession?.elementOverrides || {};
  const selectedElementId = activeSession?.selectedElementId || null;
  const hoveredElementId = activeSession?.hoveredElementId || null;

  const {
    setSelectedElementId,
    setElementOverride,
    commitHistory
  } = useEditorStore();

  useImperativeHandle(ref, () => ({
    exportPNG: () => {
      if (!stageRef.current || !template) return;
      
      // Save current selection to restore it later
      const prevSelected = selectedElementId;
      setSelectedElementId(null);
      
      // Extended timeout to ensure Konva layer redraw is complete
      setTimeout(() => {
        if (!stageRef.current) return;
        const fallbackId = match?.id || 'nomatch';
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `redpanda-${fallbackId}-${Date.now()}.png`;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Restore selection if there was one
        if (prevSelected) {
          setTimeout(() => setSelectedElementId(prevSelected), 50);
        }
      }, 150);
    }
  }));

  useEffect(() => {
    if (!containerRef.current || !template || !template.canvas) return;
    
    const containerWidth = containerRef.current.clientWidth || 800;
    const containerHeight = containerRef.current.clientHeight || 600;
    
    const canvasWidth = template.canvas.width || 1920;
    const canvasHeight = template.canvas.height || 1080;
    
    const scaleX = (containerWidth - 60) / canvasWidth;
    const scaleY = (containerHeight - 120) / canvasHeight;
    
    const newScale = Math.min(scaleX, scaleY);
    if (!isNaN(newScale) && isFinite(newScale) && newScale > 0) {
      setScale(newScale);
    } else {
      setScale(0.5); // Fallback
    }
  }, [template, rightExpanded]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedElementId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedElementId]);

  if (!template) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-app-muted bg-app-bg p-8 m-[1px]">
        <p>Select a template to open the editor.</p>
      </div>
    );
  }

  let flatElements: any[] = [];
  template.layers.forEach((layer: any) => {
    // Check layer visibility (template + override)
    const isLayerVisible = elementOverrides[layer.id]?.visible !== undefined 
      ? elementOverrides[layer.id].visible 
      : (layer.visible !== false);

    if (isLayerVisible) {
      const els = layer.elements || layer.children || [];
      els.forEach((el: any) => {
        // Check element visibility (template + override)
        const isElVisible = elementOverrides[el.id]?.visible !== undefined 
          ? elementOverrides[el.id].visible 
          : (el.visible !== false);

        if (isElVisible) {
          flatElements.push({
            ...el,
            x: el.position?.x ?? el.x ?? 0,
            y: el.position?.y ?? el.y ?? 0,
            width: el.size?.width ?? el.width ?? 100,
            height: el.size?.height ?? el.height ?? 100,
            fill: el.style?.fill ?? el.fill ?? '#ffffff',
            fontSize: el.style?.fontSize ?? el.fontSize ?? 20,
            fontFamily: el.style?.fontFamily ?? el.fontFamily ?? 'Inter'
          });
        }
      });
    }
  });

  const elementsWithData = flatElements.map(el => resolveBoundData(el, match, manualInputs, elementOverrides[el.id]));

  return (
    <div className="flex-1 flex flex-col relative bg-app-bg overflow-hidden">
      {!rightExpanded && (
         <button 
           onClick={() => setRightExpanded(true)}
           className="absolute top-4 right-4 z-20 p-2 bg-app-sidebar border border-app-border text-app-muted hover:text-app-text rounded-md shadow-lg transition-colors"
           title="Open Properties"
         >
           <PanelRightOpen size={18} />
         </button>
      )}
      
      <div ref={containerRef} className="flex-1 overflow-auto flex flex-col items-center justify-center bg-transparent relative p-8">
        <div style={{ 
          width: template.canvas.width * scale, 
          height: template.canvas.height * scale,
          backgroundColor: template.canvas.backgroundColor || '#111',
          boxShadow: '0 0 40px rgba(0,0,0,0.2)',
          border: '1px solid var(--app-border)',
          position: 'relative'
        }}>
          <Stage 
            ref={stageRef}
            width={template.canvas.width * scale} 
            height={template.canvas.height * scale}
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
                    setActiveRightTab('design');
                  },
                  onTap: (e: any) => {
                    e.cancelBubble = true;
                    setSelectedElementId(element.id);
                    setActiveRightTab('design');
                  },
                  onDragEnd: (e: any) => {
                    setElementOverride(element.id, { 
                      position: { x: Math.round(e.target.x()), y: Math.round(e.target.y()) } 
                    });
                    commitHistory();
                  }
                };

                if (element.type === "Image" || element.type === "image") {
                  return <URLImage key={element.id} imageInfo={element} commonProps={commonProps} />;
                }
                
                if (element.type === "Shape") {
                  const shadowEnabled = element.shadowEnabled && (element.shadowBlur > 0 || element.shadowOffsetX !== 0 || element.shadowOffsetY !== 0);
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
                      shadowColor={shadowEnabled ? element.shadowColor : undefined}
                      shadowBlur={element.shadowBlur}
                      shadowOffsetX={element.shadowOffsetX}
                      shadowOffsetY={element.shadowOffsetY}
                      shadowOpacity={element.shadowOpacity}
                      stroke={element.strokeWidth > 0 ? element.stroke : undefined}
                      strokeWidth={element.strokeWidth}
                      cornerRadius={element.cornerRadius}
                      {...commonProps}
                    />
                  );
                }

                if (element.type === "Polygon") {
                  return (
                    <Line
                      key={element.id}
                      x={element.x || 0}
                      y={element.y || 0}
                      points={element.points || []}
                      closed={true}
                      fill={element.fill}
                      rotation={element.rotation || 0}
                      opacity={element.opacity !== undefined ? element.opacity : 1}
                      shadowColor={element.shadowColor}
                      shadowBlur={element.shadowBlur}
                      shadowOffsetX={element.shadowOffsetX}
                      shadowOffsetY={element.shadowOffsetY}
                      {...commonProps}
                    />
                  );
                }
                
                if (element.type === "Text") {
                  const shadowEnabled = element.shadowEnabled && (element.shadowBlur > 0 || element.shadowOffsetX !== 0 || element.shadowOffsetY !== 0);
                  const textContent = element.textTransform === "uppercase" ? element.text?.toUpperCase() : 
                                     element.textTransform === "lowercase" ? element.text?.toLowerCase() :
                                     element.text;
                  
                  return (
                    <Group 
                      key={element.id} 
                      x={element.x} 
                      y={element.y} 
                      rotation={element.rotation} 
                      opacity={element.opacity !== undefined ? element.opacity : 1}
                      {...commonProps}
                    >
                      {element.bgEnabled && (
                        <Rect
                          x={-element.bgPadding}
                          y={-element.bgPadding}
                          width={(element.width || 0) + element.bgPadding * 2}
                          height={element.fontSize * (element.lineHeight || 1.2) + element.bgPadding * 2}
                          fill={element.bgColor}
                          cornerRadius={element.bgRadius}
                        />
                      )}
                      <Text
                        text={textContent}
                        fontSize={element.fontSize}
                        fontFamily={element.fontFamily}
                        fill={element.fill}
                        width={element.width}
                        align={element.align}
                        fontStyle={element.fontWeight === "bold" ? "bold" : (element.fontWeight === "italic" ? "italic" : "normal")}
                        letterSpacing={element.letterSpacing}
                        lineHeight={element.lineHeight}
                        stroke={element.strokeWidth > 0 ? element.stroke : undefined}
                        strokeWidth={element.strokeWidth}
                        shadowColor={shadowEnabled ? element.shadowColor : undefined}
                        shadowBlur={element.shadowBlur}
                        shadowOffsetX={element.shadowOffsetX}
                        shadowOffsetY={element.shadowOffsetY}
                        shadowOpacity={element.shadowOpacity}
                        x={0}
                        y={0}
                      />
                    </Group>
                  );
                }
                
                return null;
              })}

              {(() => {
                const targetId = selectedElementId || hoveredElementId;
                if (!targetId) return null;
                const targetEl = elementsWithData.find(l => l.id === targetId);
                if (!targetEl) return null;
                
                const isSelected = selectedElementId === targetId;
                const strokeColor = isSelected ? "#3b82f6" : "rgba(59, 130, 246, 0.5)"; // Pro Blue
                const strokeWidth = 1.5 / scale;
                const handleSize = 6 / scale;

                return (
                  <Group listening={false}>
                    <Rect
                      x={targetEl.x}
                      y={targetEl.y}
                      width={targetEl.width}
                      height={targetEl.height || 0}
                      rotation={targetEl.rotation || 0}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      dash={isSelected ? [] : [4 / scale, 4 / scale]}
                      fill="transparent"
                    />
                    {isSelected && (
                      <>
                        {/* Figma-like handles at corners */}
                        {[
                          { x: targetEl.x, y: targetEl.y },
                          { x: targetEl.x + targetEl.width, y: targetEl.y },
                          { x: targetEl.x, y: targetEl.y + (targetEl.height || 0) },
                          { x: targetEl.x + targetEl.width, y: targetEl.y + (targetEl.height || 0) }
                        ].map((pos, i) => (
                          <Rect
                            key={i}
                            x={pos.x - handleSize / 2}
                            y={pos.y - handleSize / 2}
                            width={handleSize}
                            height={handleSize}
                            fill="#FFFFFF"
                            stroke={strokeColor}
                            strokeWidth={1 / scale}
                            rotation={targetEl.rotation || 0}
                            offsetX={targetEl.rotation ? (pos.x - targetEl.x) : 0}
                            offsetY={targetEl.rotation ? (pos.y - targetEl.y) : 0}
                            // Simplified rotation handling for handles
                          />
                        ))}
                      </>
                    )}
                  </Group>
                );
              })()}
            </Layer>
          </Stage>
        </div>

        <div className="absolute bottom-[20px] bg-app-card backdrop-blur-md rounded-[100px] px-5 py-2 flex gap-4 border border-app-border text-[12px] text-app-muted items-center">
          <div className="flex items-center gap-1">
            <button className="hover:text-app-text" onClick={() => setScale(s => s * 0.9)}><ZoomOut size={14} /></button>
            Zoom: <span className="text-app-text w-10 text-center">{Math.round(scale * 100)}%</span>
            <button className="hover:text-app-text" onClick={() => setScale(s => s * 1.1)}><ZoomIn size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default KonvaEditor;
