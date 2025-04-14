import React, { useState, useRef } from 'react';
import ToolSidebar from '../components/toolsidebar';
import ColorSidebar from '../components/colorsidebar';
import TopToolbar from '../components/tooltopbar';
import DrawingCanvas from '../components/drawingcanvas';
import styles from '../styles/Canvas.module.css';

function Canvas() {
  const [selectedTool, setSelectedTool] = useState('pencil');
  
  const [brushSize, setBrushSize] = useState(10);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [selectedColor, setSelectedColor] = useState('#000000');
  
  const [layers, setLayers] = useState([
    { id: 1, name: 'Layer #1', opacity: 100, isSelected: true }
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState(1);
  
  // Add a ref to the drawing canvas
  const canvasRef = useRef(null);

  const handleEyedropperPick = (color) => {
    setSelectedColor(color);
    setSelectedTool('pencil');
  };

  const getCanvasCursor = () => {
    switch(selectedTool) {
      case 'hand-move':
        return 'grab';
      case 'eyedrop':
        return 'crosshair';
      case 'select':
        return 'crosshair';
      case 'text':
        return 'text';
      default:
        return 'default';
    }
  };

  return (
    <div className={styles.canvasContainer}>
      <ToolSidebar 
        selectedTool={selectedTool} 
        setSelectedTool={setSelectedTool} 
      />
      <div className={styles.canvasArea}>
        <TopToolbar canvasRef={canvasRef} />
        <div 
          className={styles.canvasContent} 
          style={{ cursor: getCanvasCursor() }}
        >
          <DrawingCanvas 
            ref={canvasRef}
            selectedTool={selectedTool}
            brushSize={brushSize}
            brushOpacity={brushOpacity}
            selectedColor={selectedColor}
            layers={layers}
            selectedLayerId={selectedLayerId}
            onEyedropperPick={handleEyedropperPick}
          />
        </div>
      </div>
      <ColorSidebar 
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        brushOpacity={brushOpacity}
        setBrushOpacity={setBrushOpacity}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        layers={layers}
        setLayers={setLayers}
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
      />
    </div>
  );
}

export default Canvas;