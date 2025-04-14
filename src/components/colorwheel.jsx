import React, { useEffect, useRef, useState } from 'react';
import styles from './styles/colorwheel.module.css';

const ColorWheel = ({ onColorChange, initialColor }) => {
  const hueRingRef = useRef(null);
  const squareGradientRef = useRef(null);
  const huePickerRef = useRef(null);
  const satValPickerRef = useRef(null);

  const [hue, setHue] = useState(0);
  const [sat, setSat] = useState(1);
  const [val, setVal] = useState(1);
  const [hex, setHex] = useState(initialColor || '#ffffff');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Parse initial color to HSV if provided
    if (initialColor) {
      const rgb = hexToRgb(initialColor);
      if (rgb) {
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        setHue(hsv.h);
        setSat(hsv.s);
        setVal(hsv.v);
      }
    }
    
    // Initial setup
    updateSquareGradient();
    positionHuePicker(hue);
    positionSatValPicker(sat, val);
    updateColorDisplay();
  }, []);

  useEffect(() => {
    // Handle initialColor updates
    if (initialColor && initialColor !== hex && !isDragging) {
      const rgb = hexToRgb(initialColor);
      if (rgb) {
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        setHue(hsv.h);
        setSat(hsv.s);
        setVal(hsv.v);
        setHex(initialColor);
      }
    }
  }, [initialColor, isDragging]);

  useEffect(() => {
    // Update visuals when HSV changes
    updateSquareGradient();
    updateColorDisplay();
    if (onColorChange) onColorChange(hex);
  }, [hue, sat, val]);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsv = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, v = max;
    
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    
    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    
    return { h, s, v };
  };

  const hsvToRgb = (h, s, v) => {
    let r, g, b;
    const i = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
      default: r = v; g = p; b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };

  const rgbToHex = (r, g, b) => '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

  const positionHuePicker = (degrees) => {
    if (!hueRingRef.current || !huePickerRef.current) return;
    
    const ring = hueRingRef.current;
    const radius = ring.offsetWidth / 2;
    const innerRadius = radius * 0.85;
    const radians = degrees * (Math.PI / 180);
    
    // Calculate position and ensure it stays within bounds
    const x = radius + innerRadius * Math.cos(radians);
    const y = radius + innerRadius * Math.sin(radians);
    
    huePickerRef.current.style.left = `${x}px`;
    huePickerRef.current.style.top = `${y}px`;
  };

  const positionSatValPicker = (saturation, value) => {
    if (!squareGradientRef.current || !satValPickerRef.current) return;
    
    const gradient = squareGradientRef.current;
    
    // Clamp the values to ensure they stay within bounds
    const clampedSat = Math.min(1, Math.max(0, saturation));
    const clampedVal = Math.min(1, Math.max(0, value));
    
    const x = clampedSat * gradient.offsetWidth;
    const y = (1 - clampedVal) * gradient.offsetHeight;
    
    satValPickerRef.current.style.left = `${gradient.offsetLeft + x}px`;
    satValPickerRef.current.style.top = `${gradient.offsetTop + y}px`;
  };

  const updateSquareGradient = () => {
    if (!squareGradientRef.current) return;
    
    const { r, g, b } = hsvToRgb(hue, 1, 1);
    const hueHex = rgbToHex(r, g, b);
    squareGradientRef.current.style.background = `
      linear-gradient(to bottom, rgba(0,0,0,0), black),
      linear-gradient(to right, white, ${hueHex})
    `;
  };

  const updateColorDisplay = () => {
    const { r, g, b } = hsvToRgb(hue, sat, val);
    const newHex = rgbToHex(r, g, b);
    setHex(newHex);
  };

  const handleHueChange = (e) => {
    if (!hueRingRef.current) return;
    
    const rect = hueRingRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle from center
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    let degrees = (angle * (180 / Math.PI) + 360) % 360;
    
    setHue(degrees);
    positionHuePicker(degrees);
  };

  const handleSatValChange = (e) => {
    if (!squareGradientRef.current) return;
    
    const rect = squareGradientRef.current.getBoundingClientRect();
    
    // Calculate and clamp saturation and value
    let saturation = (e.clientX - rect.left) / rect.width;
    let value = 1 - (e.clientY - rect.top) / rect.height;
    
    // Enforce boundaries
    saturation = Math.min(1, Math.max(0, saturation));
    value = Math.min(1, Math.max(0, value));
    
    setSat(saturation);
    setVal(value);
    positionSatValPicker(saturation, value);
  };

  const handleDrag = (callback) => (e) => {
    setIsDragging(true);
    callback(e);
    
    const moveListener = (ev) => {
      ev.preventDefault(); // Prevent text selection during drag
      callback(ev);
    };
    
    const upListener = () => {
      document.removeEventListener('mousemove', moveListener);
      document.removeEventListener('mouseup', upListener);
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', moveListener);
    document.addEventListener('mouseup', upListener);
  };

  return (
    <div className={styles.colorPickerWrapper}>
      <div className={styles.colorPickerContainer}>
        <div ref={hueRingRef} className={styles.hueRing} onMouseDown={handleDrag(handleHueChange)} />
        <div className={styles.innerMask} />
        <div
          ref={squareGradientRef}
          className={styles.squareGradient}
          onMouseDown={handleDrag(handleSatValChange)}
        />
        <div ref={huePickerRef} className={styles.huePicker} />
        <div ref={satValPickerRef} className={styles.satValPicker} />
        <div className={styles.colorPreviewContainer}>
          <div className={styles.colorIndicator} style={{ backgroundColor: hex }} />
          <div className={styles.hexDisplay}>{hex.toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
};

export default ColorWheel;