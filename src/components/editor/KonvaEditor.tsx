import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { Stage, Layer, Image, Text, Rect, Line, Group, Shape, Ellipse, Circle } from "react-konva";
import useImage from "use-image";
import { TemplateElement } from "../../types/template";
import { ZoomIn, ZoomOut, PanelRightOpen } from "lucide-react";
import { useEditorStore } from "../../stores/editorStore";
import { resolveBoundData } from "../../lib/templateEngine";
import { exportHTMLZip, exportSVG } from "../../lib/exportUtils";

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
      skewX={imageInfo.skewX || 0}
      skewY={imageInfo.skewY || 0}
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
  exportHTML: () => Promise<void>;
  exportSVG: () => Promise<void>;
}

const KonvaEditor = forwardRef<EditorRef, KonvaEditorProps>(({ rightExpanded, setRightExpanded, setActiveRightTab }, ref) => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const lastTemplateIdRef = useRef<string | null>(null);

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

  let flatElements: any[] = [];
  if (template) {
    template.layers.forEach((layer: any) => {
      const isLayerVisible = elementOverrides[layer.id]?.visible !== undefined 
        ? elementOverrides[layer.id].visible 
        : (layer.visible !== false);

      if (isLayerVisible) {
        const els = layer.elements || layer.children || [];
        els.forEach((el: any) => {
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
  }

  const resolverContext = {
    packId: activeSession?.packId || "_default_pack",
    templateId: template?.id || "fallback"
  };
  
  const elementsWithData = flatElements.map(el => resolveBoundData(el, match, manualInputs, elementOverrides[el.id], resolverContext));

  useImperativeHandle(ref, () => ({
    exportPNG: () => {
      if (!stageRef.current || !template) return;
      
      const prevSelected = selectedElementId;
      setSelectedElementId(null);
      
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
        
        if (prevSelected) {
          setTimeout(() => setSelectedElementId(prevSelected), 50);
        }
      }, 150);
    },
    exportHTML: async () => {
      if (!template) return;
      const fallbackId = match?.id || 'nomatch';
      const canvasBgColor = elementOverrides['__canvas']?.bgEnabled === false ? 'transparent' : (elementOverrides['__canvas']?.bgColor || template.canvas.backgroundColor || 'transparent');
      await exportHTMLZip(template, elementsWithData, match, fallbackId, canvasBgColor);
    },
    exportSVG: async () => {
      if (!template) return;
      const fallbackId = match?.id || 'nomatch';
      const canvasBgColor = elementOverrides['__canvas']?.bgEnabled === false ? 'transparent' : (elementOverrides['__canvas']?.bgColor || template.canvas.backgroundColor || 'transparent');
      await exportSVG(template, elementsWithData, fallbackId, canvasBgColor);
    }
  }));

  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !template?.canvas) return;
    
    // Use clientWidth/Height for more immediate values than getBoundingClientRect during transitions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Safety: ignore calls with zero or suspicious dimensions during layout shifts
    if (containerWidth < 200 || containerHeight < 200) return;

    const canvasWidth = template.canvas.width || 1920;
    const canvasHeight = template.canvas.height || 1080;
    
    // Fit with healthy margins (50px padding)
    const scaleX = (containerWidth - 100) / canvasWidth;
    const scaleY = (containerHeight - 100) / canvasHeight;
    
    const newScale = Math.max(0.1, Math.min(scaleX, scaleY, 1.0)); // Don't auto-zoom past 100%
    setScale(newScale);
  }, [template]);

  useEffect(() => {
    if (!containerRef.current || !template?.id) return;
    
    // Force re-fit only when the template ID actually changes
    if (lastTemplateIdRef.current === template.id) return;
    lastTemplateIdRef.current = template.id;

    const timer = setTimeout(fitToScreen, 200); // Slightly longer delay to allow flex layout to stabilize
    return () => clearTimeout(timer);
  }, [template?.id, fitToScreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedElementId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedElementId]);

  // Handle Ctrl + Scroll Zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();

      const direction = e.deltaY > 0 ? 0.9 : 1.1;
      setScale(prev => {
        const next = prev * direction;
        return Math.max(0.05, Math.min(next, 5)); // 5% to 500%
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col relative bg-app-bg overflow-hidden focus:outline-none w-full h-full">
      <div ref={containerRef} className="flex-1 overflow-auto flex flex-col items-center justify-center bg-transparent relative p-8">
        {!template ? (
          <div className="flex flex-col items-center justify-center text-app-muted p-8">
            <p>Select a template to open the editor.</p>
          </div>
        ) : (
          <div 
            className={(elementOverrides['__canvas']?.bgEnabled === false || (!elementOverrides['__canvas']?.bgColor && !template.canvas.backgroundColor) || elementOverrides['__canvas']?.bgColor === 'transparent' || template.canvas.backgroundColor === 'transparent') ? "bg-checkerboard" : ""}
            style={{ 
              width: template.canvas.width * scale, 
              height: template.canvas.height * scale,
              backgroundColor: elementOverrides['__canvas']?.bgEnabled === false ? 'transparent' : (elementOverrides['__canvas']?.bgColor || template.canvas.backgroundColor || 'transparent'),
              boxShadow: '0 0 40px rgba(0,0,0,0.2)',
              border: '1px solid var(--app-border)',
              position: 'relative'
            }}
          >
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
                const w = element.width || 0;
                const h = element.height || 0;
                const skX = element.skewX || 0;
                const tw = element.topWidth !== undefined ? element.topWidth : w;

                const commonProps = {
                  draggable: element.draggable,
                  // Stationary center pivot for all transformations (Rotation & Skew)
                  x: element.x + w / 2,
                  y: element.y + h / 2,
                  offsetX: w / 2,
                  offsetY: h / 2,
                  scaleX: element.flipX ? -1 : 1,
                  scaleY: element.flipY ? -1 : 1,
                  skewX: skX,
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
                    const konvaX = e.target.x();
                    const konvaY = e.target.y();
                    setElementOverride(element.id, { 
                      position: { 
                        x: Math.round(konvaX - w / 2), 
                        y: Math.round(konvaY - h / 2) 
                      } 
                    });
                    commitHistory();
                  }
                };

                if (element.type === "Image" || element.type === "image") {
                  return <URLImage key={element.id} imageInfo={element} commonProps={commonProps} />;
                }
                
                if (element.type === "Shape") {
                   const shadowEnabled = element.shadowEnabled && (element.shadowBlur > 0 || element.shadowOffsetX !== 0 || element.shadowOffsetY !== 0);
                   const strokeWidth = (element.strokeEnabled !== false && element.strokeWidth > 0) ? element.strokeWidth * 2 : 0;
                   const stroke = (element.strokeEnabled !== false && element.strokeWidth > 0) ? element.stroke : undefined;
                   
                   // 1. ELLIPSE
                   if (element.shapeType === "ellipse") {
                     return (
                       <Ellipse
                         key={element.id}
                         radiusX={element.radiusX || w / 2}
                         radiusY={element.radiusY || h / 2}
                         fill={element.fill}
                         rotation={element.rotation}
                         opacity={element.opacity !== undefined ? element.opacity : 1}
                         shadowColor={shadowEnabled ? element.shadowColor : undefined}
                         shadowBlur={element.shadowBlur}
                         shadowOffsetX={element.shadowOffsetX}
                         shadowOffsetY={element.shadowOffsetY}
                         shadowOpacity={element.shadowOpacity}
                         stroke={stroke}
                         strokeWidth={strokeWidth}
                         fillAfterStrokeEnabled={true}
                         {...commonProps}
                       />
                     );
                   }

                   // 2. QUAD (Rect, Parallelogram, Trapezoid)
                   const isComplexQuad = Math.abs(tw - w) > 0.01;

                   if (isComplexQuad) {
                     return (
                       <Shape
                         key={element.id}
                         fill={element.fill}
                         rotation={element.rotation}
                         opacity={element.opacity !== undefined ? element.opacity : 1}
                         shadowColor={shadowEnabled ? element.shadowColor : undefined}
                         shadowBlur={element.shadowBlur}
                         shadowOffsetX={element.shadowOffsetX}
                         shadowOffsetY={element.shadowOffsetY}
                         shadowOpacity={element.shadowOpacity}
                         stroke={stroke}
                         strokeWidth={strokeWidth}
                         fillAfterStrokeEnabled={true}
                         {...commonProps}
                         sceneFunc={(context, shape) => {
                           const radius = element.cornerRadius || 0;
                           
                           // Using Right Trapezoid logic (Left side vertical)
                           // Leaning is handled by commonProps.skewX
                           const tl_x = 0;
                           const tr_x = tw;
                           const br_x = w;
                           const bl_x = 0;
                           
                           if (radius > 0) {
                              context.beginPath();
                              context.moveTo((tl_x + tr_x)/2, 0); 
                              context.arcTo(tr_x, 0, br_x, h, radius);
                              context.arcTo(br_x, h, bl_x, h, radius);
                              context.arcTo(bl_x, h, tl_x, 0, radius);
                              context.arcTo(tl_x, 0, tr_x, 0, radius);
                              context.closePath();
                           } else {
                              context.beginPath();
                              context.moveTo(tl_x, 0);
                              context.lineTo(tr_x, 0);
                              context.lineTo(br_x, h);
                              context.lineTo(bl_x, h);
                              context.closePath();
                           }
                           context.fillStrokeShape(shape);
                         }}
                       />
                     );
                   }

                   // Default to simple Rect (Canonical Quad as Rect)
                   return (
                     <Rect
                       key={element.id}
                       width={w}
                       height={h}
                       fill={element.fill}
                       rotation={element.rotation}
                       opacity={element.opacity !== undefined ? element.opacity : 1}
                       shadowColor={shadowEnabled ? element.shadowColor : undefined}
                       shadowBlur={element.shadowBlur}
                       shadowOffsetX={element.shadowOffsetX}
                       shadowOffsetY={element.shadowOffsetY}
                       shadowOpacity={element.shadowOpacity}
                       stroke={stroke}
                       strokeWidth={strokeWidth}
                       fillAfterStrokeEnabled={true}
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
                      skewX={element.skewX || 0}
                      skewY={element.skewY || 0}
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
                      skewX={element.skewX || 0}
                      skewY={element.skewY || 0}
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
                        stroke={(element.strokeEnabled !== false && element.strokeWidth > 0) ? element.stroke : undefined}
                        strokeWidth={(element.strokeEnabled !== false && element.strokeWidth > 0) ? element.strokeWidth * 2 : 0}
                        fillAfterStrokeEnabled={true}
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
                const strokeColor = isSelected ? "#3b82f6" : "rgba(59, 130, 246, 0.5)"; 
                const strokeWidth = 1 / scale;
                const handleSize = 6 / scale;

                const w = targetEl.width || 0;
                const h = targetEl.height || 0;
                const skX = targetEl.skewX || 0;
                const tw = targetEl.topWidth !== undefined ? targetEl.topWidth : w;
                
                const pivotX = w / 2;
                const pivotY = h / 2;

                // Points relative to un-skewed local group
                const outlinePoints = [
                  0, 0,
                  tw, 0,
                  w, h,
                  0, h
                ];

                const crossSize = 8 / scale;

                return (
                  <Group listening={false}>
                    {/* 1. Skewed transform stack - Geometric Outline & Handles */}
                    <Group 
                      x={targetEl.x + w / 2} 
                      y={targetEl.y + h / 2}
                      rotation={targetEl.rotation || 0} 
                      offsetX={pivotX} 
                      offsetY={pivotY} 
                      skewX={skX}
                      scaleX={targetEl.flipX ? -1 : 1}
                      scaleY={targetEl.flipY ? -1 : 1}
                    >
                      {/* Geometric Outline */}
                      <Line
                        points={outlinePoints}
                        closed={true}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        dash={isSelected ? [] : [4 / scale, 4 / scale]}
                      />
                      
                      {/* Vertices handles */}
                      {isSelected && [
                        { x: 0, y: 0 },
                        { x: tw, y: 0 },
                        { x: w, y: h },
                        { x: 0, y: h }
                      ].map((pos, i) => (
                        <Rect
                          key={i}
                          x={pos.x - handleSize / 2}
                          y={pos.y - handleSize / 2}
                          width={handleSize}
                          height={handleSize}
                          fill="#FFFFFF"
                          stroke={strokeColor}
                          strokeWidth={0.5 / scale}
                        />
                      ))}
                    </Group>

                    {/* 2. Unskewed Pivot Indicator - Stationary Crosshair */}
                    {/* Positioned at the exact geometric center, rotates but does NOT skew */}
                    <Group 
                      x={targetEl.x + w / 2} 
                      y={targetEl.y + h / 2}
                      rotation={targetEl.rotation || 0}
                    >
                      <Line 
                        points={[-crossSize/2, 0, crossSize/2, 0]} 
                        stroke={strokeColor} 
                        strokeWidth={1.5 / scale}
                      />
                      <Line 
                        points={[0, -crossSize/2, 0, crossSize/2]} 
                        stroke={strokeColor} 
                        strokeWidth={1.5 / scale}
                      />
                      <Rect 
                        x={-0.5/scale} 
                        y={-0.5/scale} 
                        width={1/scale} 
                        height={1/scale} 
                        fill="#FFF"
                      />
                    </Group>

                    {/* 3. Logical Anchor (Top-Left point in store coordinate system) */}
                    <Group x={targetEl.x} y={targetEl.y}>
                      <Rect 
                         x={-2/scale} y={-2/scale} width={4/scale} height={4/scale}
                         fill="transparent" stroke={strokeColor} strokeWidth={0.5/scale}
                         dash={[1/scale, 1/scale]}
                      />
                    </Group>
                  </Group>
                );
              })()}
            </Layer>
          </Stage>
        </div>
      )}
      </div>

      {/* Toolbar - Fixed bottom-center for best screen compatibility */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center bg-app-card/90 backdrop-blur-xl border border-app-border rounded-full shadow-2xl px-2 py-1 gap-1 divide-x divide-app-border/40">
        <div className="flex items-center">
          <button 
            className="hover:bg-app-accent/10 hover:text-app-accent h-8 w-8 flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-transparent rounded-full" 
            onClick={() => setScale(s => Math.max(0.05, s * 0.8))}
            disabled={scale <= 0.05}
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          
          <div className="px-2 min-w-[56px] text-center">
            <span className="text-[12px] font-mono font-medium text-app-text">
              {Math.round(scale * 100)}%
            </span>
          </div>

          <button 
            className="hover:bg-app-accent/10 hover:text-app-accent h-8 w-8 flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-transparent rounded-full" 
            onClick={() => setScale(s => Math.min(5, s * 1.2))}
            disabled={scale >= 5}
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
        </div>

        <button 
          className="px-4 py-1.5 hover:bg-app-accent/10 hover:text-app-accent text-[11px] font-medium transition-colors uppercase tracking-wider disabled:opacity-30 disabled:hover:bg-transparent rounded-r-full"
          onClick={fitToScreen}
          disabled={!template}
        >
          Fit
        </button>
      </div>
    </div>
  );
});

export default KonvaEditor;
