import React from 'react';
import styles from './styles/layers.module.css';

const NewLayerIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 16 16" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="currentColor"
  >
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M13.71 4.29l-3-3L10 1H4L3 2v12l1 1h9l1-1V5l-.29-.71zM13 14H4V2h5v4h4v8zm-3-9V2l3 3h-3z"
    />
  </svg>
);

const DeleteLayerIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="currentColor"
  >
    <path d="M20,6H16V5a3,3,0,0,0-3-3H11A3,3,0,0,0,8,5V6H4A1,1,0,0,0,4,8H5V19a3,3,0,0,0,3,3h8a3,3,0,0,0,3-3V8h1a1,1,0,0,0,0-2ZM10,5a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1V6H10Zm7,14a1,1,0,0,1-1,1H8a1,1,0,0,1-1-1V8H17Z"/>
  </svg>
);

const Layers = ({ layers, setLayers, selectedLayerId, setSelectedLayerId }) => {
  const [layerOpacity, setLayerOpacity] = React.useState(100);
  const [nextLayerId, setNextLayerId] = React.useState(2);

  React.useEffect(() => {
    if (layers && selectedLayerId) {
      const selectedLayer = layers.find(layer => layer.id === selectedLayerId);
      if (selectedLayer) {
        setLayerOpacity(selectedLayer.opacity);
      }
    }
  }, [selectedLayerId, layers]);

  const handleLayerSelect = (id) => {
    setLayers(layers.map(layer => ({
      ...layer,
      isSelected: layer.id === id
    })));
    setSelectedLayerId(id);
    setLayerOpacity(layers.find(layer => layer.id === id)?.opacity || 100);
  };

  const handleLayerOpacityChange = (value) => {
    setLayerOpacity(value);
    setLayers(layers.map(layer => 
      layer.id === selectedLayerId 
        ? { ...layer, opacity: value }
        : layer
    ));
  };

  const addNewLayer = () => {
    const newLayer = { 
      id: nextLayerId, 
      name: `Layer #${nextLayerId}`, 
      opacity: 100, 
      isSelected: true 
    };
    
    setLayers(layers.map(layer => ({ ...layer, isSelected: false }))
      .concat(newLayer)
    );
    
    setSelectedLayerId(nextLayerId);
    setLayerOpacity(100);
    setNextLayerId(prevId => prevId + 1);
  };

  const deleteLayer = () => {
    if (layers.length > 1) {
      const updatedLayers = layers.filter(layer => layer.id !== selectedLayerId);
      const newSelectedLayer = updatedLayers[0];
      
      setLayers(updatedLayers.map(layer => ({
        ...layer,
        isSelected: layer.id === newSelectedLayer.id
      })));
      
      setSelectedLayerId(newSelectedLayer.id);
      setLayerOpacity(newSelectedLayer.opacity);
    }
  };

  const moveLayer = (direction) => {
    const currentIndex = layers.findIndex(layer => layer.id === selectedLayerId);
    if (direction === 'up' && currentIndex > 0) {
      const newLayers = [...layers];
      [newLayers[currentIndex], newLayers[currentIndex - 1]] = 
      [newLayers[currentIndex - 1], newLayers[currentIndex]];
      setLayers(newLayers);
    } else if (direction === 'down' && currentIndex < layers.length - 1) {
      const newLayers = [...layers];
      [newLayers[currentIndex], newLayers[currentIndex + 1]] = 
      [newLayers[currentIndex + 1], newLayers[currentIndex]];
      setLayers(newLayers);
    }
  };

  return (
    <div className={styles.layersContainer}>
      <div className={styles.layerOpacityControl}>
        <label>Layer Opacity:</label>
        <input
          type="range"
          min="0"
          max="100"
          value={layerOpacity}
          onChange={(e) => handleLayerOpacityChange(Number(e.target.value))}
        />
        <span>{layerOpacity}%</span>
      </div>

      <div className={styles.layerActions}>
        <button 
          onClick={addNewLayer} 
          className={styles.iconButton}
          aria-label="New Layer"
        >
          <NewLayerIcon />
        </button>
        <button 
          onClick={deleteLayer}
          disabled={layers.length <= 1}
          className={styles.iconButton}
          aria-label="Delete Layer"
        >
          <DeleteLayerIcon />
        </button>
        <div className={styles.layerMoveActions}>
          <button onClick={() => moveLayer('up')}>▲</button>
          <button onClick={() => moveLayer('down')}>▼</button>
        </div>
      </div>

      <div className={styles.layerList}>
        {layers.slice().map(layer => (
          <div 
            key={layer.id} 
            className={`${styles.layerItem} ${layer.isSelected ? styles.selectedLayer : ''}`}
            onClick={() => handleLayerSelect(layer.id)}
          >
            <span className={styles.layerName}>{layer.name}</span>
            <span className={styles.layerOpacity}>{layer.opacity}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Layers;