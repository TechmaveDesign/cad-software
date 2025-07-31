import { useState, useRef, useCallback } from 'react';
import * as THREE from 'three';

export interface DrawingPoint {
  x: number;
  y: number;
  worldPosition: THREE.Vector3;
  timestamp: number;
}

export interface DrawingStroke {
  id: string;
  tool: string;
  points: DrawingPoint[];
  color: string;
  size: number;
  completed: boolean;
}

export const useDrawing = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const strokeIdRef = useRef(0);

  const startDrawing = useCallback((
    point: DrawingPoint,
    tool: string,
    color: string,
    size: number
  ) => {
    const newStroke: DrawingStroke = {
      id: `stroke_${++strokeIdRef.current}`,
      tool,
      points: [point],
      color,
      size,
      completed: false
    };

    setCurrentStroke(newStroke);
    setIsDrawing(true);
    console.log('Started drawing stroke:', newStroke.id, 'with tool:', tool);
  }, []);

  const addPoint = useCallback((point: DrawingPoint) => {
    if (!currentStroke || !isDrawing) return;

    setCurrentStroke(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point]
      };
    });
  }, [currentStroke, isDrawing]);

  const finishDrawing = useCallback(() => {
    if (!currentStroke) return;

    const completedStroke = { ...currentStroke, completed: true };
    setStrokes(prev => [...prev, completedStroke]);
    setCurrentStroke(null);
    setIsDrawing(false);
    console.log('Finished drawing stroke:', completedStroke.id, 'with', completedStroke.points.length, 'points');
  }, [currentStroke]);

  const clearStrokes = useCallback(() => {
    setStrokes([]);
    setCurrentStroke(null);
    setIsDrawing(false);
    console.log('Cleared all strokes');
  }, []);

  const undoLastStroke = useCallback(() => {
    setStrokes(prev => prev.slice(0, -1));
    console.log('Undid last stroke');
  }, []);

  return {
    isDrawing,
    strokes,
    currentStroke,
    startDrawing,
    addPoint,
    finishDrawing,
    clearStrokes,
    undoLastStroke
  };
};