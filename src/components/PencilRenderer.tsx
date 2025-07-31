import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DrawingStroke } from '../hooks/useDrawing';

interface PencilRendererProps {
  strokes: DrawingStroke[];
  currentStroke: DrawingStroke | null;
  scene: THREE.Scene;
}

const PencilRenderer: React.FC<PencilRendererProps> = ({ 
  strokes, 
  currentStroke, 
  scene 
}) => {
  const strokeMeshesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const drawingGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    // Create drawing group if it doesn't exist
    if (!drawingGroupRef.current) {
      drawingGroupRef.current = new THREE.Group();
      drawingGroupRef.current.name = 'DrawingGroup';
      scene.add(drawingGroupRef.current);
      console.log('Created drawing group');
    }

    return () => {
      // Cleanup on unmount
      if (drawingGroupRef.current) {
        scene.remove(drawingGroupRef.current);
        drawingGroupRef.current = null;
      }
    };
  }, [scene]);

  useEffect(() => {
    if (!drawingGroupRef.current) return;

    // Render completed strokes
    strokes.forEach(stroke => {
      if (!strokeMeshesRef.current.has(stroke.id)) {
        const mesh = createStrokeMesh(stroke);
        if (mesh) {
          strokeMeshesRef.current.set(stroke.id, mesh);
          drawingGroupRef.current!.add(mesh);
          console.log('Added stroke mesh:', stroke.id);
        }
      }
    });

    // Remove deleted strokes
    strokeMeshesRef.current.forEach((mesh, id) => {
      if (!strokes.find(s => s.id === id)) {
        drawingGroupRef.current!.remove(mesh);
        disposeMesh(mesh);
        strokeMeshesRef.current.delete(id);
        console.log('Removed stroke mesh:', id);
      }
    });
  }, [strokes]);

  useEffect(() => {
    if (!drawingGroupRef.current) return;

    // Handle current stroke
    const currentStrokeId = 'current_stroke';
    const existingCurrentMesh = strokeMeshesRef.current.get(currentStrokeId);

    if (currentStroke && currentStroke.points.length > 1) {
      // Remove existing current stroke mesh
      if (existingCurrentMesh) {
        drawingGroupRef.current.remove(existingCurrentMesh);
        disposeMesh(existingCurrentMesh);
      }

      // Create new current stroke mesh
      const mesh = createStrokeMesh(currentStroke);
      if (mesh) {
        strokeMeshesRef.current.set(currentStrokeId, mesh);
        drawingGroupRef.current.add(mesh);
      }
    } else if (existingCurrentMesh) {
      // Remove current stroke mesh if no current stroke
      drawingGroupRef.current.remove(existingCurrentMesh);
      disposeMesh(existingCurrentMesh);
      strokeMeshesRef.current.delete(currentStrokeId);
    }
  }, [currentStroke]);

  const createStrokeMesh = (stroke: DrawingStroke): THREE.Object3D | null => {
    if (stroke.points.length < 2) return null;

    try {
      const points = stroke.points.map(p => p.worldPosition);
      
      if (stroke.tool === 'pencil') {
        return createPencilLine(points, stroke.color, stroke.size);
      } else if (stroke.tool === 'brush') {
        return createBrushStroke(points, stroke.color, stroke.size);
      }
      
      return createBasicLine(points, stroke.color, stroke.size);
    } catch (error) {
      console.error('Error creating stroke mesh:', error);
      return null;
    }
  };

  const createPencilLine = (points: THREE.Vector3[], color: string, size: number): THREE.Object3D => {
    // Create smooth curve through points
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
    const curvePoints = curve.getPoints(Math.max(50, points.length * 10));
    
    // Create tube geometry for 3D pencil line
    const tubeGeometry = new THREE.TubeGeometry(
      curve,
      Math.max(20, points.length * 5), // segments
      Math.max(0.02, size * 0.05), // radius
      8, // radial segments
      false // closed
    );

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: false,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(tubeGeometry, material);
    mesh.renderOrder = 100;
    
    console.log('Created pencil line with', curvePoints.length, 'points');
    return mesh;
  };

  const createBrushStroke = (points: THREE.Vector3[], color: string, size: number): THREE.Object3D => {
    // Create thicker brush stroke
    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
    
    const tubeGeometry = new THREE.TubeGeometry(
      curve,
      Math.max(30, points.length * 8),
      Math.max(0.05, size * 0.1), // thicker than pencil
      12, // more radial segments for smoother brush
      false
    );

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(tubeGeometry, material);
    mesh.renderOrder = 99;
    
    return mesh;
  };

  const createBasicLine = (points: THREE.Vector3[], color: string, size: number): THREE.Object3D => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      linewidth: Math.max(1, size)
    });

    const line = new THREE.Line(geometry, material);
    line.renderOrder = 98;
    
    return line;
  };

  const disposeMesh = (mesh: THREE.Object3D) => {
    if (mesh instanceof THREE.Mesh || mesh instanceof THREE.Line) {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => mat.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    }
  };

  return null; // This component doesn't render anything directly
};

export default PencilRenderer;