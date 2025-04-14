import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import styles from "./styles/drawingcanvas.module.css";

const DrawingCanvas = forwardRef(({
  selectedTool,
  brushSize,
  brushOpacity,
  selectedColor,
  layers,
  selectedLayerId,
  onEyedropperPick
}, ref) => {
  // Create a ref for the canvas element
  
  // Use useImperativeHandle to customize the value exposed when the component is referenced
  const canvasRef = useRef(null);
  const canvasLayersRef = useRef({});
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [ctx, setCtx] = useState(null);

  const [selectionStart, setSelectionStart] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectionImage, setSelectionImage] = useState(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);
  const [textInputActive, setTextInputActive] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const textInputRef = useRef(null);

  useImperativeHandle(ref, () => canvasRef.current);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext("2d");
    setCtx(context);

    context.lineWidth = brushSize || 2;
    context.lineCap = "round";
    context.strokeStyle = selectedColor || "black";
    context.globalAlpha = (brushOpacity || 100) / 100;

    layers.forEach(layer => {
      if (!canvasLayersRef.current[layer.id]) {
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = canvas.width;
        layerCanvas.height = canvas.height;
        const layerCtx = layerCanvas.getContext('2d');
        layerCtx.lineCap = 'round';
        canvasLayersRef.current[layer.id] = layerCanvas;
      }
    });

    renderLayers();

    return () => {
      setCtx(null);
    };
  }, [layers]);

  useEffect(() => {
    renderLayers();
  }, [layers, canvasPosition]);

  useEffect(() => {
    if (!ctx) return;
    
    ctx.lineWidth = brushSize || 2;
    ctx.globalAlpha = (brushOpacity || 100) / 100;
    
    if (selectedColor && !['eraser', 'eyedrop'].includes(selectedTool)) {
      ctx.strokeStyle = selectedColor;
    }
  }, [brushSize, brushOpacity, selectedColor, ctx, selectedTool]);

  useEffect(() => {
    if (!ctx) return;

    switch (selectedTool) {
      case "pencil":
        ctx.lineWidth = brushSize || 2;
        ctx.strokeStyle = selectedColor || "black";
        break;
      case "brush":
        ctx.lineWidth = brushSize || 8;
        ctx.strokeStyle = selectedColor || "blue";
        break;
      case "eraser":
        ctx.lineWidth = brushSize || 10;
        ctx.globalCompositeOperation = "destination-out"; 
        break;
      default:
        ctx.globalCompositeOperation = "source-over"; 
        break;
    }
  }, [selectedTool, ctx, brushSize, selectedColor]);

  const renderLayers = () => {
    if (!ctx || !layers.length) return;
    
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    
    ctx.translate(canvasPosition.x, canvasPosition.y);
    
    [...layers].reverse().forEach(layer => {
      const layerCanvas = canvasLayersRef.current[layer.id];
      if (layerCanvas) {
        ctx.globalAlpha = layer.opacity / 100;
        ctx.globalCompositeOperation = "source-over"; 
        ctx.drawImage(layerCanvas, 0, 0);
      }
    });
    
    if (selectedArea && selectedTool === "select") {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#00a8ff";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(selectedArea.x, selectedArea.y, selectedArea.width, selectedArea.height);
      ctx.setLineDash([]);
    }
    
    ctx.restore();
    
    ctx.globalAlpha = (brushOpacity || 100) / 100;
  };

  const getLayerCtx = () => {
    if (!selectedLayerId || !canvasLayersRef.current[selectedLayerId]) return null;
    
    const layerCanvas = canvasLayersRef.current[selectedLayerId];
    const layerCtx = layerCanvas.getContext('2d');
    
    layerCtx.lineWidth = ctx.lineWidth;
    layerCtx.lineCap = ctx.lineCap;
    layerCtx.strokeStyle = ctx.strokeStyle;
    layerCtx.globalAlpha = ctx.globalAlpha;
    
    if (selectedTool === "eraser") {
      layerCtx.globalCompositeOperation = "destination-out";
    } else {
      layerCtx.globalCompositeOperation = "source-over";
    }
    
    return layerCtx;
  };

  const getMousePos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { 
      x: e.clientX - rect.left - canvasPosition.x, 
      y: e.clientY - rect.top - canvasPosition.y 
    };
  };

  const startTextInput = (x, y) => {
    setTextInputActive(true);
    setTextPosition({ x, y });

    // Use setTimeout to ensure DOM is updated before focusing
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 10);
  };

  const handleTextInputChange = (e) => {
    // Optional: Handle realtime changes if needed
  };

  const handleTextInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyText(textInputRef.current.value);
      setTextInputActive(false);
    } else if (e.key === 'Escape') {
      setTextInputActive(false);
    }
  };

  const handleTextInputBlur = () => {
    if (textInputRef.current && textInputRef.current.value.trim()) {
      applyText(textInputRef.current.value);
    }
    setTextInputActive(false);
  };

  const applyText = (text) => {
    if (!text.trim()) return;
    
    const layerCtx = getLayerCtx();
    if (!layerCtx) return;
    
    // Configure text rendering
    const fontSize = brushSize || 16;
    layerCtx.font = `${fontSize}px Arial, sans-serif`;
    layerCtx.fillStyle = selectedColor;
    layerCtx.textBaseline = "top";
    
    // Draw the text on the selected layer
    layerCtx.fillText(text, textPosition.x, textPosition.y);
    
    // Update the canvas display
    renderLayers();
  };

  const startSelection = (pos) => {
    setSelectionStart(pos);
    setIsSelecting(true);
  };

  const updateSelection = (pos) => {
    if (!isSelecting) return;
    
    const area = {
      x: Math.min(selectionStart.x, pos.x),
      y: Math.min(selectionStart.y, pos.y),
      width: Math.abs(pos.x - selectionStart.x),
      height: Math.abs(pos.y - selectionStart.y)
    };
    
    setSelectedArea(area);
    renderLayers();
  };

  const finalizeSelection = () => {
    setIsSelecting(false);
    
    if (selectedArea && selectedArea.width > 5 && selectedArea.height > 5) {
      const layerCanvas = canvasLayersRef.current[selectedLayerId];
      if (layerCanvas) {
        const layerCtx = layerCanvas.getContext('2d');
        const imageData = layerCtx.getImageData(
          selectedArea.x,
          selectedArea.y,
          selectedArea.width,
          selectedArea.height
        );
        setSelectionImage(imageData);
        
        layerCtx.clearRect(
          selectedArea.x,
          selectedArea.y,
          selectedArea.width,
          selectedArea.height
        );
        renderLayers();
      }
    } else {
      setSelectedArea(null);
    }
  };

  const moveSelection = (newPos) => {
    if (!selectedArea || !selectionImage) return;
    
    const dx = newPos.x - lastPosRef.current.x;
    const dy = newPos.y - lastPosRef.current.y;
    
    setSelectedArea(prev => ({
      ...prev,
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    renderLayers();
  };

  const applySelection = () => {
    if (!selectedArea || !selectionImage) return;
    
    const layerCanvas = canvasLayersRef.current[selectedLayerId];
    if (layerCanvas) {
      const layerCtx = layerCanvas.getContext('2d');
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = selectionImage.width;
      tempCanvas.height = selectionImage.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.putImageData(selectionImage, 0, 0);
      
      layerCtx.drawImage(
        tempCanvas,
        0, 0, selectionImage.width, selectionImage.height,
        selectedArea.x, selectedArea.y, selectedArea.width, selectedArea.height
      );
      
      setSelectedArea(null);
      setSelectionImage(null);
      renderLayers();
    }
  };

  const handleMouseDown = (e) => {
    if (!ctx) return;

    if (textInputActive) return;

    const pos = getMousePos(e);
    lastPosRef.current = pos;

    switch(selectedTool) {
      case "select":
        if (selectedArea && 
            pos.x >= selectedArea.x && 
            pos.x <= selectedArea.x + selectedArea.width && 
            pos.y >= selectedArea.y && 
            pos.y <= selectedArea.y + selectedArea.height) {
          isDrawingRef.current = true;
        } else {
          startSelection(pos);
          applySelection();
        }
        break;

      case "hand-move":
        isDrawingRef.current = true;
        setDragStart(pos);
        document.body.style.cursor = "grabbing";
        break;

      case "eyedrop":
        const adjustedX = pos.x - canvasPosition.x;
        const adjustedY = pos.y - canvasPosition.y;
        const pixel = ctx.getImageData(adjustedX, adjustedY, 1, 1).data;
        const color = `#${pixel[0].toString(16).padStart(2, '0')}${
          pixel[1].toString(16).padStart(2, '0')}${
          pixel[2].toString(16).padStart(2, '0')}`;
        onEyedropperPick(color);
        break;

      case "bucket":
        const layerCtx = getLayerCtx();
        if (layerCtx) {
          layerCtx.fillStyle = ctx.strokeStyle;
          layerCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          renderLayers();
        }
        break;

      case "text":
        startTextInput(pos.x, pos.y);
        break;

      case "pencil":
      case "brush":
      case "eraser":
        isDrawingRef.current = true;
        const drawCtx = getLayerCtx();
        if (drawCtx) {
          drawCtx.beginPath();
          drawCtx.moveTo(pos.x, pos.y);
        }
        break;

      default:
        break;
    }
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);

    if (isSelecting) {
      updateSelection(pos);
      return;
    }

    if (!isDrawingRef.current) return;

    switch(selectedTool) {
      case "select":
        if (selectedArea) {
          moveSelection(pos);
        }
        break;

      case "hand-move":
        if (dragStart) {
          const dx = pos.x - dragStart.x;
          const dy = pos.y - dragStart.y;
          setCanvasPosition(prev => ({
            x: prev.x + dx,
            y: prev.y + dy
          }));
          renderLayers();
        }
        break;

      case "pencil":
      case "brush":
      case "eraser":
        const layerCtx = getLayerCtx();
        if (layerCtx) {
          layerCtx.lineTo(pos.x, pos.y);
          layerCtx.stroke();
          renderLayers();
        }
        break;

      default:
        break;
    }
    
    lastPosRef.current = pos;
  };

  const handleMouseUp = () => {
    if (isSelecting) {
      finalizeSelection();
    } else if (selectedTool === "select" && selectedArea) {
      applySelection();
    } else if (selectedTool === "hand-move") {
      document.body.style.cursor = "default";
      setDragStart(null);
    } else if (ctx && isDrawingRef.current) {
      const layerCtx = getLayerCtx();
      if (layerCtx) {
        layerCtx.closePath();
      }
    }
    
    isDrawingRef.current = false;
  };

  const handleMouseOut = () => {
    isDrawingRef.current = false;
    if (selectedTool === "hand-move") {
      document.body.style.cursor = "default";
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (selectedArea) {
          setSelectedArea(null);
          setSelectionImage(null);
          renderLayers();
        }
        if (textInputActive) {
          setTextInputActive(false);
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedArea, textInputActive]);

  const getTextInputStyle = () => {
    if (!canvasRef.current) return {};
    
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      position: 'absolute',
      left: `${textPosition.x + rect.left}px`,
      top: `${textPosition.y + rect.top}px`,
      color: selectedColor,
      fontSize: `${brushSize || 16}px`,
      fontFamily: 'Arial, sans-serif',
      background: 'transparent',
      border: '1px dashed #00a8ff',
      outline: 'none',
      padding: '2px',
      minWidth: '100px',
      zIndex: 1000,
      display: textInputActive ? 'block' : 'none'
    };
  };

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        id="drawingCanvas"
        className={`${styles.canvas} ${selectedTool === 'hand-move' ? styles.grabbableCanvas : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseOut}
      ></canvas>
      
      <input
        type="text"
        ref={textInputRef}
        style={getTextInputStyle()}
        onChange={handleTextInputChange}
        onKeyDown={handleTextInputKeyDown}
        onBlur={handleTextInputBlur}
      />
    </div>
  );
});

export default DrawingCanvas;