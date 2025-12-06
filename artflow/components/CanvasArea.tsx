import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Circle, Path, Image as KonvaImage, Transformer, Group } from 'react-konva';
import useImage from 'use-image';
import { useStore } from '../store';
import { CanvasElement } from '../types';

interface ShapeProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onTransformStart: () => void;
  onTransformEnd: () => void;
  onEdit?: (id: string, node: any) => void;
  isEditing?: boolean;
  isPreview?: boolean;
}

// Helper component for loading images or showing placeholder
const URLImage: React.FC<ShapeProps> = ({ element, isSelected, onSelect, onChange, onDragStart, onDragEnd, onTransformStart, onTransformEnd, onEdit, isPreview }) => { 
  // Enable CORS 'anonymous' to prevent tainted canvas issues during export
  const [img, status] = useImage(element.src || '', 'anonymous');
  const shapeRef = useRef<any>();
  const trRef = useRef<any>();
  
  const isPlaceholder = !element.src || element.src === '' || status === 'failed';

  useEffect(() => {
    if (isSelected && !element.locked && trRef.current && shapeRef.current && !isPreview) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, element.locked, isPlaceholder, isPreview]);

  // Common props shared between Placeholder Group and KonvaImage
  const commonProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
    rotation: element.rotation,
    scaleX: element.scaleX,
    scaleY: element.scaleY,
    opacity: isPreview ? (element.opacity || 1) : element.opacity,
    draggable: !element.locked && !isPreview, // Disable drag on preview
    onClick: isPreview ? undefined : onSelect,
    onTap: isPreview ? undefined : onSelect,
    onDragStart: onDragStart,
    onDragEnd: (e: any) => {
        onChange({ x: e.target.x(), y: e.target.y() });
        onDragEnd();
    },
    onTransformStart: onTransformStart,
    onTransformEnd: (e: any) => {
        const node = shapeRef.current;
        onChange({
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY(),
        });
        onTransformEnd();
    },
    listening: !isPreview // IMPORTANT: Preview items shouldn't block interaction, but here we want them visible on top
  };
  
  // If preview, force listening to false for the ghost layer, but true for the top layer?
  // Actually, for the "Suggestion Preview" mode, we want the preview layer to be strictly visual.
  if (isPreview) {
      commonProps.listening = false; 
      commonProps.opacity = 1; // Preview should be fully opaque
  }

  if (isPlaceholder) {
      // Calculate icon size relative to the placeholder dimensions
      const minDim = Math.min(element.width || 100, element.height || 100);
      const iconSize = Math.max(20, minDim * 0.2);
      
      return (
        <>
            <Group 
                {...commonProps} 
                ref={shapeRef}
                onDblClick={() => !isPreview && onEdit && onEdit(element.id, null)}
            >
                {/* Background & Border */}
                <Rect
                    width={element.width}
                    height={element.height}
                    fill="#f1f5f9"
                    stroke={isPreview ? "#10b981" : "#94a3b8"}
                    strokeWidth={isPreview ? 4 : 2}
                    dash={isPreview ? undefined : [10, 5]}
                    cornerRadius={element.cornerRadius || 0}
                />
                
                {/* Visual Icon Group centered */}
                <Group 
                    x={(element.width || 0) / 2} 
                    y={(element.height || 0) / 2}
                    offset={{ x: 0, y: iconSize / 2 }} // Center visually
                >
                     {/* Icon Background Circle */}
                     <Circle 
                        y={-iconSize / 2}
                        radius={iconSize}
                        fill={isPreview ? "#d1fae5" : "#e2e8f0"}
                    />
                    
                    {/* Simple Camera Icon Shape */}
                    <Rect
                        x={-iconSize * 0.6}
                        y={-iconSize * 0.8}
                        width={iconSize * 1.2}
                        height={iconSize * 0.8}
                        fill={isPreview ? "#059669" : "#94a3b8"}
                        cornerRadius={3}
                    />
                     <Circle
                        y={-iconSize * 0.4}
                        radius={iconSize * 0.3}
                        stroke={isPreview ? "#d1fae5" : "#e2e8f0"}
                        strokeWidth={2}
                     />
                     {/* Lens reflection */}
                     <Circle
                        x={iconSize * 0.15}
                        y={-iconSize * 0.5}
                        radius={iconSize * 0.08}
                        fill={isPreview ? "#d1fae5" : "#e2e8f0"}
                     />
                     
                     <Text
                        x={-element.width! / 2}
                        y={iconSize * 0.8}
                        width={element.width}
                        text={isPreview ? "New Position" : "Double-click to Replace"}
                        align="center"
                        fontSize={Math.max(10, minDim * 0.08)}
                        fill={isPreview ? "#059669" : "#94a3b8"}
                        fontFamily="Inter"
                        listening={false} // Click through to group
                    />
                </Group>
            </Group>
            {isSelected && !element.locked && !isPreview && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) return oldBox;
                        return newBox;
                    }}
                    anchorStroke="#0ea5e9"
                    anchorFill="#ffffff"
                    anchorSize={8}
                    borderStroke="#0ea5e9"
                />
            )}
        </>
      )
  }

  return (
    <>
      <KonvaImage
        image={img}
        ref={shapeRef}
        {...commonProps}
        stroke={isPreview ? '#10b981' : element.stroke}
        strokeWidth={isPreview ? 4 : element.strokeWidth}
        shadowColor={element.shadowColor}
        shadowBlur={element.shadowBlur}
        shadowOffsetX={element.shadowOffsetX}
        shadowOffsetY={element.shadowOffsetY}
        shadowOpacity={element.shadowOpacity}
        cornerRadius={element.cornerRadius || 0}
        imageSmoothingEnabled={true} // Force high quality smoothing
      />
      {isSelected && !element.locked && !isPreview && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
          anchorStroke="#0ea5e9"
          anchorFill="#ffffff"
          anchorSize={8}
          borderStroke="#0ea5e9"
        />
      )}
    </>
  );
};

const TextElement: React.FC<ShapeProps> = ({ element, isSelected, onSelect, onChange, onDragStart, onDragEnd, onTransformStart, onTransformEnd, onEdit, isEditing, isPreview }) => {
    const shapeRef = useRef<any>();
    const trRef = useRef<any>();
  
    useEffect(() => {
      if (isSelected && !element.locked && !isEditing && trRef.current && shapeRef.current && !isPreview) {
        trRef.current.nodes([shapeRef.current]);
        trRef.current.getLayer().batchDraw();
      }
    }, [isSelected, element.locked, isEditing, isPreview]);

    return (
        <>
            <Text
                text={element.text}
                x={element.x}
                y={element.y}
                width={element.width} // Text needs width for alignment
                fontSize={element.fontSize}
                fontFamily={element.fontFamily}
                fontStyle={element.fontStyle}
                textDecoration={element.textDecoration}
                align={element.align}
                fill={isPreview ? '#059669' : element.fill} // Highlight text color in preview
                fillPriority={element.fillPriority}
                fillLinearGradientStartPointX={element.fillLinearGradientStartPointX}
                fillLinearGradientStartPointY={element.fillLinearGradientStartPointY}
                fillLinearGradientEndPointX={element.fillLinearGradientEndPointX}
                fillLinearGradientEndPointY={element.fillLinearGradientEndPointY}
                fillLinearGradientColorStops={element.fillLinearGradientColorStops}
                rotation={element.rotation}
                scaleX={element.scaleX}
                scaleY={element.scaleY}
                opacity={isPreview ? 1 : element.opacity}
                visible={element.visible !== false}
                draggable={!element.locked && !isPreview}
                stroke={isPreview ? undefined : element.stroke}
                strokeWidth={element.strokeWidth}
                shadowColor={element.shadowColor}
                shadowBlur={element.shadowBlur}
                shadowOffsetX={element.shadowOffsetX}
                shadowOffsetY={element.shadowOffsetY}
                shadowOpacity={element.shadowOpacity}
                onClick={isPreview ? undefined : onSelect}
                onTap={isPreview ? undefined : onSelect}
                onDblClick={() => !isPreview && onEdit && onEdit(element.id, shapeRef.current)}
                onDragStart={onDragStart}
                onDragEnd={(e) => {
                    onChange({
                        x: e.target.x(),
                        y: e.target.y()
                    });
                    onDragEnd();
                }}
                onTransformStart={onTransformStart}
                onTransformEnd={() => {
                     const node = shapeRef.current;
                     onChange({
                         x: node.x(),
                         y: node.y(),
                         width: node.width() * node.scaleX(), // Baking scale into width for better text wrapping
                         scaleX: 1, 
                         scaleY: node.scaleY(),
                         rotation: node.rotation()
                     });
                     onTransformEnd();
                }}
                ref={shapeRef}
                listening={!isPreview}
            />
             {isSelected && !element.locked && !isEditing && !isPreview && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                         // limit resize
                        newBox.width = Math.max(30, newBox.width);
                        return newBox;
                    }}
                    enabledAnchors={['middle-left', 'middle-right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    anchorStroke="#0ea5e9"
                    anchorFill="#ffffff"
                    anchorSize={8}
                    borderStroke="#0ea5e9"
                />
            )}
        </>
    )
}

const RectElement: React.FC<ShapeProps> = ({ element, isSelected, onSelect, onChange, onDragStart, onDragEnd, onTransformStart, onTransformEnd, isPreview }) => {
    const shapeRef = useRef<any>();
    const trRef = useRef<any>();

    useEffect(() => {
        if (isSelected && !element.locked && trRef.current && shapeRef.current && !isPreview) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected, element.locked, isPreview]);

    return (
        <>
            <Rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                fill={element.fill}
                fillPriority={element.fillPriority}
                fillLinearGradientStartPointX={element.fillLinearGradientStartPointX}
                fillLinearGradientStartPointY={element.fillLinearGradientStartPointY}
                fillLinearGradientEndPointX={element.fillLinearGradientEndPointX}
                fillLinearGradientEndPointY={element.fillLinearGradientEndPointY}
                fillLinearGradientColorStops={element.fillLinearGradientColorStops}
                rotation={element.rotation}
                scaleX={element.scaleX}
                scaleY={element.scaleY}
                opacity={isPreview ? 1 : element.opacity}
                visible={element.visible !== false}
                draggable={!element.locked && !isPreview}
                stroke={isPreview ? '#10b981' : element.stroke}
                strokeWidth={isPreview ? 4 : element.strokeWidth}
                strokeLineCap={element.strokeLineCap}
                strokeLineJoin={element.strokeLineJoin}
                shadowColor={element.shadowColor}
                shadowBlur={element.shadowBlur}
                shadowOffsetX={element.shadowOffsetX}
                shadowOffsetY={element.shadowOffsetY}
                shadowOpacity={element.shadowOpacity}
                cornerRadius={element.cornerRadius || 0}
                onClick={isPreview ? undefined : onSelect}
                onTap={isPreview ? undefined : onSelect}
                onDragStart={onDragStart}
                onDragEnd={(e) => {
                    onChange({
                        x: e.target.x(),
                        y: e.target.y()
                    });
                    onDragEnd();
                }}
                onTransformStart={onTransformStart}
                onTransformEnd={() => {
                    const node = shapeRef.current;
                    onChange({
                        x: node.x(),
                        y: node.y(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                        rotation: node.rotation()
                    });
                    onTransformEnd();
                }}
                ref={shapeRef}
                listening={!isPreview}
            />
            {isSelected && !element.locked && !isPreview && (
                <Transformer
                    ref={trRef}
                    anchorStroke="#0ea5e9"
                    anchorFill="#ffffff"
                    anchorSize={8}
                    borderStroke="#0ea5e9"
                />
            )}
        </>
    );
}

const CircleElement: React.FC<ShapeProps> = ({ element, isSelected, onSelect, onChange, onDragStart, onDragEnd, onTransformStart, onTransformEnd, isPreview }) => {
    const shapeRef = useRef<any>();
    const trRef = useRef<any>();

    useEffect(() => {
        if (isSelected && !element.locked && trRef.current && shapeRef.current && !isPreview) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected, element.locked, isPreview]);

    return (
        <>
            <Circle
                x={element.x}
                y={element.y}
                // Konva circle radius is distinct from width. We use width as diameter generally in store, so radius is width/2
                radius={(element.width || 100) / 2} 
                fill={element.fill}
                fillPriority={element.fillPriority}
                fillLinearGradientStartPointX={element.fillLinearGradientStartPointX}
                fillLinearGradientStartPointY={element.fillLinearGradientStartPointY}
                fillLinearGradientEndPointX={element.fillLinearGradientEndPointX}
                fillLinearGradientEndPointY={element.fillLinearGradientEndPointY}
                fillLinearGradientColorStops={element.fillLinearGradientColorStops}
                rotation={element.rotation}
                scaleX={element.scaleX}
                scaleY={element.scaleY}
                opacity={isPreview ? 1 : element.opacity}
                visible={element.visible !== false}
                draggable={!element.locked && !isPreview}
                stroke={isPreview ? '#10b981' : element.stroke}
                strokeWidth={isPreview ? 4 : element.strokeWidth}
                shadowColor={element.shadowColor}
                shadowBlur={element.shadowBlur}
                shadowOffsetX={element.shadowOffsetX}
                shadowOffsetY={element.shadowOffsetY}
                shadowOpacity={element.shadowOpacity}
                onClick={isPreview ? undefined : onSelect}
                onTap={isPreview ? undefined : onSelect}
                onDragStart={onDragStart}
                onDragEnd={(e) => {
                    onChange({
                        x: e.target.x(),
                        y: e.target.y()
                    });
                    onDragEnd();
                }}
                onTransformStart={onTransformStart}
                onTransformEnd={() => {
                    const node = shapeRef.current;
                    onChange({
                        x: node.x(),
                        y: node.y(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                        rotation: node.rotation()
                    });
                    onTransformEnd();
                }}
                ref={shapeRef}
                listening={!isPreview}
            />
            {isSelected && !element.locked && !isPreview && (
                <Transformer
                    ref={trRef}
                    anchorStroke="#0ea5e9"
                    anchorFill="#ffffff"
                    anchorSize={8}
                    borderStroke="#0ea5e9"
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']} // Keep circle aspect ratio
                />
            )}
        </>
    );
}

const PathElement: React.FC<ShapeProps> = ({ element, isSelected, onSelect, onChange, onDragStart, onDragEnd, onTransformStart, onTransformEnd, isPreview }) => {
    const shapeRef = useRef<any>();
    const trRef = useRef<any>();

    useEffect(() => {
        if (isSelected && !element.locked && trRef.current && shapeRef.current && !isPreview) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected, element.locked, isPreview]);

    return (
        <>
            <Path
                data={element.data}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                fill={element.fill}
                fillPriority={element.fillPriority}
                fillLinearGradientStartPointX={element.fillLinearGradientStartPointX}
                fillLinearGradientStartPointY={element.fillLinearGradientStartPointY}
                fillLinearGradientEndPointX={element.fillLinearGradientEndPointX}
                fillLinearGradientEndPointY={element.fillLinearGradientEndPointY}
                fillLinearGradientColorStops={element.fillLinearGradientColorStops}
                rotation={element.rotation}
                scaleX={element.scaleX}
                scaleY={element.scaleY}
                opacity={isPreview ? 1 : element.opacity}
                visible={element.visible !== false}
                draggable={!element.locked && !isPreview}
                stroke={isPreview ? '#10b981' : element.stroke}
                strokeWidth={isPreview ? 4 : element.strokeWidth}
                strokeLineCap={element.strokeLineCap}
                strokeLineJoin={element.strokeLineJoin}
                shadowColor={element.shadowColor}
                shadowBlur={element.shadowBlur}
                shadowOffsetX={element.shadowOffsetX}
                shadowOffsetY={element.shadowOffsetY}
                shadowOpacity={element.shadowOpacity}
                onClick={isPreview ? undefined : onSelect}
                onTap={isPreview ? undefined : onSelect}
                onDragStart={onDragStart}
                onDragEnd={(e) => {
                    onChange({
                        x: e.target.x(),
                        y: e.target.y()
                    });
                    onDragEnd();
                }}
                onTransformStart={onTransformStart}
                onTransformEnd={() => {
                    const node = shapeRef.current;
                    onChange({
                        x: node.x(),
                        y: node.y(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                        rotation: node.rotation()
                    });
                    onTransformEnd();
                }}
                ref={shapeRef}
                listening={!isPreview}
            />
            {isSelected && !element.locked && !isPreview && (
                <Transformer
                    ref={trRef}
                    anchorStroke="#0ea5e9"
                    anchorFill="#ffffff"
                    anchorSize={8}
                    borderStroke="#0ea5e9"
                />
            )}
        </>
    );
}

export const CanvasArea: React.FC<{ stageRef: React.RefObject<any> }> = ({ stageRef }) => {
  const { elements, selectedId, canvasConfig, selectElement, updateElement, clearCanvas, showGuides, saveToHistory, addElement, addOrReplaceImage, suggestionPreview, userTier } = useStore();
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Ref for the hidden file input to replace placeholder images
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initial Center
    if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        const scaleW = (offsetWidth - 100) / canvasConfig.width;
        const scaleH = (offsetHeight - 100) / canvasConfig.height;
        const scale = Math.min(scaleW, scaleH, 1); // Max zoom 1 initially
        
        setStageScale(scale);
        setStagePosition({
            x: (offsetWidth - canvasConfig.width * scale) / 2,
            y: (offsetHeight - canvasConfig.height * scale) / 2
        });
    }
  }, [canvasConfig]);

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    // Limits
    if(newScale < 0.1) newScale = 0.1;
    if(newScale > 5) newScale = 5;

    setStageScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setStagePosition(newPos);
  };

  const checkDeselect = (e: any) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectElement(null);
      setEditingId(null);
    }
  };
  
  // Handle replacing image via double click
  const handleReplaceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && editingId) {
          const reader = new FileReader();
          reader.onload = () => {
              const img = new Image();
              img.onload = () => {
                   saveToHistory();
                   const el = elements.find(e => e.id === editingId);
                   if (el) {
                       // Maintain visual dimensions while updating source resolution
                       const currentVisualWidth = (el.width || 100) * (el.scaleX || 1);
                       const newScale = currentVisualWidth / img.width;
                       
                       updateElement(editingId, { 
                           src: reader.result as string,
                           width: img.width,
                           height: img.height,
                           scaleX: newScale,
                           scaleY: newScale
                       });
                   }
                   setEditingId(null);
              };
              img.src = reader.result as string;
          };
          reader.readAsDataURL(file);
      }
      if (replaceInputRef.current) replaceInputRef.current.value = '';
  };
  
  // Trigger file input when editing an image (which means replacing it)
  useEffect(() => {
      if (editingId) {
          const el = elements.find(e => e.id === editingId);
          if (el && el.type === 'image') {
              replaceInputRef.current?.click();
              // If user cancels, we should probably reset editingId, but difficult to detect cancel.
              // For now, if they click away checkDeselect handles it.
          }
      }
  }, [editingId, elements]);

  // Drop Handler for Stickers AND External Files
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      
      const stage = stageRef.current;
      if (!stage) return;

      // Calculate drop position
      stage.setPointersPositions(e);
      const pointer = stage.getPointerPosition();
      let dropX = 0;
      let dropY = 0;
      
      if (pointer) {
           dropX = (pointer.x - stage.x()) / stage.scaleX();
           dropY = (pointer.y - stage.y()) / stage.scaleY();
      } else {
           // Fallback to center
           dropX = (canvasConfig.width - 200) / 2;
           dropY = (canvasConfig.height - 200) / 2;
      }

      // 1. Check for Internal Stickers (JSON data)
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
          try {
              const data = JSON.parse(dataStr);
              if (data.type === 'sticker') {
                   // Center the sticker on the mouse
                   const finalX = dropX - (data.width / 2);
                   const finalY = dropY - (data.height / 2);

                   addElement({
                       type: 'image',
                       src: data.src,
                       x: finalX,
                       y: finalY,
                       width: data.width,
                       height: data.height,
                       scaleX: 1,
                       scaleY: 1
                   });
                   return; // Handled
              }
          } catch (err) {
              console.error("Failed to parse drop data", err);
          }
      }

      // 2. Check for External Files (Images)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = () => {
                  const imgObj = new Image();
                  imgObj.onload = () => {
                      // Scale down VISUALLY if huge, but keep original data
                      let scale = 1;
                      if (imgObj.width > 1000 || imgObj.height > 1000) {
                          scale = Math.min(1000 / imgObj.width, 1000 / imgObj.height);
                      }

                      addOrReplaceImage({
                          type: 'image',
                          src: reader.result as string,
                          width: imgObj.width,
                          height: imgObj.height,
                          x: dropX - (imgObj.width * scale) / 2,
                          y: dropY - (imgObj.height * scale) / 2,
                          scaleX: scale,
                          scaleY: scale
                      });
                  };
                  imgObj.src = reader.result as string;
              };
              reader.readAsDataURL(file);
          }
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  return (
    <div 
        className="flex-1 bg-slate-200 dark:bg-black/50 overflow-hidden relative" 
        ref={containerRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
    >
        
      {/* Hidden input for replacing images */}
      <input 
        type="file" 
        ref={replaceInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleReplaceImage}
      />

      <Stage
        width={containerRef.current?.offsetWidth || 800}
        height={containerRef.current?.offsetHeight || 600}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        onWheel={handleWheel}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        draggable
        ref={stageRef}
        className="cursor-grab active:cursor-grabbing"
      >
        <Layer imageSmoothingEnabled={true}>
            {/* Background Rect - Acts as the canvas base */}
            <Rect 
                name="background-rect"
                x={0} 
                y={0} 
                width={canvasConfig.width} 
                height={canvasConfig.height} 
                fill="white" 
                shadowColor="black"
                shadowBlur={20}
                shadowOpacity={0.1}
            />

            {/* Original Elements Layer (Dimmed if preview active) */}
            <Group opacity={suggestionPreview ? 0.3 : 1} listening={!suggestionPreview}>
                {elements.map((el) => {
                    const props = {
                        key: el.id,
                        element: el,
                        isSelected: el.id === selectedId,
                        onSelect: () => selectElement(el.id),
                        onChange: (newAttrs: any) => updateElement(el.id, newAttrs),
                        onDragStart: () => saveToHistory(),
                        onDragEnd: () => saveToHistory(),
                        onTransformStart: () => saveToHistory(),
                        onTransformEnd: () => saveToHistory(),
                    };

                    if (el.type === 'text') {
                        return <TextElement {...props} onEdit={(id) => setEditingId(id)} isEditing={editingId === el.id} />;
                    } else if (el.type === 'image') {
                        // Pass onEdit to URLImage to trigger replacement
                        return <URLImage {...props} onEdit={(id) => setEditingId(id)} />;
                    } else if (el.type === 'circle') {
                        return <CircleElement {...props} />;
                    } else if (el.type === 'path') {
                        return <PathElement {...props} />;
                    }
                    return <RectElement {...props} />;
                })}
            </Group>

            {/* Suggestion Preview Layer (Overlay) */}
            {suggestionPreview && (
                <Group name="suggestion-layer">
                     {suggestionPreview.map((el) => {
                        // Use original image src if available, assuming map function in service preserved IDs but simplified props
                        // We need to match with original to get the src if not present in simplified version
                        const original = elements.find(o => o.id === el.id);
                        const fullEl = { ...original, ...el }; // Merge new props over original

                        const props = {
                            key: `preview-${el.id}`,
                            element: fullEl,
                            isSelected: false,
                            onSelect: () => {},
                            onChange: () => {},
                            onDragStart: () => {},
                            onDragEnd: () => {},
                            onTransformStart: () => {},
                            onTransformEnd: () => {},
                            isPreview: true
                        };

                        if (el.type === 'text') {
                            return <TextElement {...props} />;
                        } else if (el.type === 'image') {
                            return <URLImage {...props} />;
                        } else if (el.type === 'circle') {
                            return <CircleElement {...props} />;
                        } else if (el.type === 'path') {
                            return <PathElement {...props} />;
                        }
                        return <RectElement {...props} />;
                    })}
                </Group>
            )}

            {/* Watermark REMOVED */}
        </Layer>
        
        {/* Guides Layer - Always on Top, Pointer Events Disabled by default for visual only */}
        {showGuides && canvasConfig.safeAreas && (
            <Layer name="guides-layer" listening={false}>
                {canvasConfig.safeAreas.map(safe => (
                    <Group key={safe.id} x={safe.x} y={safe.y}>
                        <Rect
                            width={safe.width}
                            height={safe.height}
                            stroke={safe.stroke || '#0ea5e9'}
                            strokeWidth={1}
                            fill={safe.fill}
                            dash={[5, 5]}
                            opacity={0.8}
                        />
                        <Text 
                            text={safe.label}
                            fontSize={12}
                            fill={safe.stroke || '#0ea5e9'}
                            y={-18}
                            fontFamily="Inter"
                        />
                    </Group>
                ))}
            </Layer>
        )}
      </Stage>

      {/* Editing TextArea Overlay for TEXT elements */}
      {editingId && !suggestionPreview && (() => {
          const el = elements.find(e => e.id === editingId);
          if (el && el.type === 'text' && stageRef.current && containerRef.current) {
               // Calculate position
               const stage = stageRef.current;
               const absPos = {
                   x: (el.x * stage.scaleX()) + stage.x(),
                   y: (el.y * stage.scaleY()) + stage.y()
               };
               
               const rotation = (el.rotation || 0) + stage.rotation();
               
               return (
                   <textarea
                        value={el.text}
                        onChange={(e) => updateElement(el.id, { text: e.target.value })}
                        onBlur={() => setEditingId(null)}
                        autoFocus
                        style={{
                            position: 'absolute',
                            top: absPos.y,
                            left: absPos.x,
                            width: (el.width || 100) * stage.scaleX(),
                            height: (el.fontSize || 16) * 1.5 * stage.scaleY(),
                            fontSize: (el.fontSize || 16) * stage.scaleX(),
                            color: el.fill,
                            fontFamily: el.fontFamily,
                            fontWeight: el.fontStyle?.includes('bold') ? 'bold' : 'normal',
                            fontStyle: el.fontStyle?.includes('italic') ? 'italic' : 'normal',
                            textDecoration: el.textDecoration,
                            textAlign: el.align as any,
                            background: 'transparent',
                            border: '1px dashed #0ea5e9',
                            outline: 'none',
                            resize: 'none',
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: 'top left',
                            zIndex: 100
                        }}
                   />
               )
          }
          return null;
      })()}
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-lg shadow-lg border border-slate-200 dark:border-white/10 z-10">
          <button className="px-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded" onClick={() => setStageScale(s => Math.max(0.1, s - 0.1))}>-</button>
          <span className="text-xs font-mono w-12 text-center">{Math.round(stageScale * 100)}%</span>
          <button className="px-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded" onClick={() => setStageScale(s => Math.min(5, s + 0.1))}>+</button>
      </div>
    </div>
  );
};