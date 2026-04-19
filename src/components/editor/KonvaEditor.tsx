import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Stage, Layer, Image, Text, Rect } from "react-konva";
import useImage from "use-image";
import { TemplateElement } from "../../types/template";
import { ZoomIn, ZoomOut, PanelRightOpen } from "lucide-react";
import { useEditorStore } from "../../stores/editorStore";
import { resolveBoundData } from "../../lib/templateEngine";

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

interface KonvaEditorProps {
  rightExpanded: boolean;
  setRightExpanded: (val: boolean) => void;
  setActiveRightTab: (val: 'match' | 'editor') => void;
}

export interface EditorRef {
  exportPNG: () => void;
}

const KonvaEditor = forwardRef<EditorRef, KonvaEditorProps>(({ rightExpanded, setRightExpanded, setActiveRightTab }, ref) => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  const {
    template,
    match,
    manualInputs,
    elementOverrides,
    selectedElementId,
    hoveredElementId,
    setSelectedElementId,
    setElementOverride,
    commitHistory
  } = useEditorStore();

  useImperativeHandle(ref, () => ({
    exportPNG: () => {
      if (!stageRef.current || !template) return;
      setSelectedElementId(null);
      
      setTimeout(() => {
        const fallbackId = match?.id || 'nomatch';
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `thumbnail_${fallbackId}_${template.id}.png`;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 50);
    }
  }));

  useEffect(() => {
    if (!containerRef.current || !template) return;
    
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

  let flatElements: TemplateElement[] = [];
  template.layers.forEach(layer => {
    if (layer.visible !== false) {
      layer.elements.forEach(el => {
        if (el.visible !== false) flatElements.push(el);
      });
    }
  });

  const elementsWithData = flatElements.map(el => resolveBoundData(el, match, manualInputs, elementOverrides[el.id]));

  return (
    <div className="flex-1 flex flex-col relative bg-app-bg overflow-hidden">
      {!rightExpanded && (
         <button 
           onClick={() => setRightExpanded(true)}
           className="absolute top-4 right-4 z-20 p-2 bg-app-sidebar border border-app-border text-app-muted hover:text-white rounded-md shadow-lg transition-colors"
           title="Open Properties"
         >
           <PanelRightOpen size={18} />
         </button>
      )}
      
      <div ref={containerRef} className="flex-1 overflow-auto flex flex-col items-center justify-center bg-[#070707] relative p-8">
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
                    setElementOverride(element.id, { x: Math.round(e.target.x()), y: Math.round(e.target.y()) });
                    commitHistory();
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

        <div className="absolute bottom-[20px] bg-black/80 backdrop-blur-md rounded-[100px] px-5 py-2 flex gap-4 border border-white/10 text-[12px] text-app-muted items-center">
          <div className="flex items-center gap-1">
            <button className="hover:text-white" onClick={() => setScale(s => s * 0.9)}><ZoomOut size={14} /></button>
            Zoom: <span className="text-white w-10 text-center">{Math.round(scale * 100)}%</span>
            <button className="hover:text-white" onClick={() => setScale(s => s * 1.1)}><ZoomIn size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default KonvaEditor;
