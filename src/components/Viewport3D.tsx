import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLModel, ViewportSettings } from '../types';
import { useDropzone } from 'react-dropzone';
import { Upload, Grid3X3, Lightbulb, Palette } from 'lucide-react';
import { MeshDrawingSystem, TextOnMesh } from './MeshDrawing';
import { TransformOperation } from './TransformControls';

interface Viewport3DProps {
  models: STLModel[];
  onModelsChange: (models: STLModel[]) => void;
  selectedModel: string | null;
  activeTool: string | null;
  onTransform: (modelId: string, transform: TransformOperation) => void;
}

const Viewport3D: React.FC<Viewport3DProps> = ({ 
  models, 
  onModelsChange, 
  selectedModel,
  activeTool,
  onTransform
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const loaderRef = useRef<STLLoader>();
  const drawingSystemRef = useRef<MeshDrawingSystem>();
  const textSystemRef = useRef<TextOnMesh>();
  const isDrawingModeRef = useRef<boolean>(false);
  
  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    wireframe: false,
    showGrid: true,
    backgroundColor: '#1e293b',
    lightIntensity: 1.0
  });

  // Check if current tool should lock the model
  const shouldLockModel = activeTool && [
    'cut', 'add-volume', 'subtract-volume', 'mask-brush', 'pencil', 
    'polyline', 'bezier', 'eraser', 'text-emboss', 'text-deboss'
  ].includes(activeTool);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(viewportSettings.backgroundColor);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 50);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, viewportSettings.lightIntensity);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight2.position.set(-50, -50, -50);
    scene.add(directionalLight2);

    // Grid
    if (viewportSettings.showGrid) {
      const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x444444);
      scene.add(gridHelper);
    }

    // STL Loader
    loaderRef.current = new STLLoader();

    // Initialize drawing system
    drawingSystemRef.current = new MeshDrawingSystem(scene, camera, renderer);
    textSystemRef.current = new TextOnMesh(scene);

    mountRef.current.appendChild(renderer.domElement);

    // Mouse event handlers for drawing
    const handleMouseDown = (event: MouseEvent) => {
      if (!shouldLockModel || !drawingSystemRef.current) return;
      
      const meshes = models.map(m => m.mesh).filter(Boolean) as THREE.Mesh[];
      if (activeTool === 'pencil' || activeTool === 'mask-brush') {
        drawingSystemRef.current.startDrawing(event, meshes);
        isDrawingModeRef.current = true;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!shouldLockModel || !drawingSystemRef.current || !isDrawingModeRef.current) return;
      
      const meshes = models.map(m => m.mesh).filter(Boolean) as THREE.Mesh[];
      drawingSystemRef.current.continueDrawing(event, meshes);
    };

    const handleMouseUp = () => {
      if (!shouldLockModel || !drawingSystemRef.current) return;
      
      drawingSystemRef.current.stopDrawing();
      isDrawingModeRef.current = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (!shouldLockModel) {
        controls.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [shouldLockModel, activeTool, models]);

  // Update controls based on tool selection
  useEffect(() => {
    if (!controlsRef.current) return;
    
    controlsRef.current.enabled = !shouldLockModel;
    
    if (shouldLockModel) {
      // Change cursor to indicate drawing mode
      if (mountRef.current) {
        mountRef.current.style.cursor = activeTool === 'pencil' ? 'crosshair' : 'pointer';
      }
    } else {
      if (mountRef.current) {
        mountRef.current.style.cursor = 'default';
      }
    }
  }, [shouldLockModel, activeTool]);

  // Update scene when models change
  useEffect(() => {
    if (!sceneRef.current || !loaderRef.current) return;

    models.forEach((model) => {
      if (model.file && !model.mesh) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const geometry = loaderRef.current!.parse(event.target!.result as ArrayBuffer);
          
          // Center and scale the geometry
          geometry.computeBoundingBox();
          const center = new THREE.Vector3();
          geometry.boundingBox!.getCenter(center);
          geometry.translate(-center.x, -center.y, -center.z);
          
          const size = new THREE.Vector3();
          geometry.boundingBox!.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 30 / maxDim;
          geometry.scale(scale, scale, scale);

          const material = new THREE.MeshStandardMaterial({
            color: model.color,
            metalness: 0.1,
            roughness: 0.3,
            wireframe: viewportSettings.wireframe
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.visible = model.visible;
          
          // Position models side by side
          const modelIndex = models.findIndex(m => m.id === model.id);
          mesh.position.x = (modelIndex % 2) * 25 - 12.5;
          mesh.position.z = Math.floor(modelIndex / 2) * 25;
          
          // Add selection outline for selected model
          if (selectedModel === model.id) {
            const outlineGeometry = geometry.clone();
            const outlineMaterial = new THREE.MeshBasicMaterial({
              color: 0x00ff00,
              side: THREE.BackSide,
              transparent: true,
              opacity: 0.3
            });
            const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
            outline.scale.multiplyScalar(1.02);
            mesh.add(outline);
          }

          sceneRef.current!.add(mesh);

          // Update model with mesh reference
          const updatedModels = models.map(m => 
            m.id === model.id ? { ...m, mesh } : m
          );
          onModelsChange(updatedModels);
        };
        reader.readAsArrayBuffer(model.file);
      } else if (model.mesh) {
        model.mesh.visible = model.visible;
        (model.mesh.material as THREE.MeshStandardMaterial).color.setHex(
          parseInt(model.color.replace('#', ''), 16)
        );
        
        // Update selection outline
        const outline = model.mesh.children.find(child => 
          child instanceof THREE.Mesh && 
          (child.material as THREE.MeshBasicMaterial).color.getHex() === 0x00ff00
        );
        
        if (selectedModel === model.id && !outline) {
          // Add outline
          const outlineGeometry = model.mesh.geometry.clone();
          const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.3
          });
          const newOutline = new THREE.Mesh(outlineGeometry, outlineMaterial);
          newOutline.scale.multiplyScalar(1.02);
          model.mesh.add(newOutline);
        } else if (selectedModel !== model.id && outline) {
          // Remove outline
          model.mesh.remove(outline);
        }
      }
    });
  }, [models, viewportSettings.wireframe, selectedModel]);

  // Handle transform operations
  useEffect(() => {
    // This effect will be triggered by the onTransform prop
  }, [onTransform]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newModels: STLModel[] = acceptedFiles.map((file, index) => ({
      id: `model-${Date.now()}-${index}`,
      name: file.name,
      type: models.length % 2 === 0 ? 'upper' : 'lower',
      visible: true,
      color: models.length % 2 === 0 ? '#3b82f6' : '#10b981',
      file
    }));

    onModelsChange([...models, ...newModels]);
  }, [models, onModelsChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': ['.stl'],
      'model/stl': ['.stl']
    },
    noClick: shouldLockModel
  });

  const toggleWireframe = () => {
    setViewportSettings(prev => ({ ...prev, wireframe: !prev.wireframe }));
  };

  const toggleGrid = () => {
    setViewportSettings(prev => ({ ...prev, showGrid: !prev.showGrid }));
    // Recreate scene to toggle grid
    window.location.reload();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900">
      {/* Viewport Controls */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 text-sm">Viewport Controls</span>
          <button
            onClick={toggleWireframe}
            className={`px-3 py-1 rounded text-xs transition-colors duration-200 ${
              viewportSettings.wireframe
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Wireframe
          </button>
          <button
            onClick={toggleGrid}
            className={`px-3 py-1 rounded text-xs transition-colors duration-200 flex items-center space-x-1 ${
              viewportSettings.showGrid
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Grid3X3 size={12} />
            <span>Grid</span>
          </button>
          <div className="flex items-center space-x-2">
            <Lightbulb size={14} className="text-slate-400" />
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={viewportSettings.lightIntensity}
              onChange={(e) => setViewportSettings(prev => ({ 
                ...prev, 
                lightIntensity: parseFloat(e.target.value) 
              }))}
              className="w-20"
            />
          </div>
        </div>
        
        <div className="text-slate-400 text-sm">
          {activeTool ? (
            <span className={shouldLockModel ? 'text-orange-400' : 'text-blue-400'}>
              Active Tool: {activeTool} {shouldLockModel && '(Model Locked)'}
            </span>
          ) : (
            'No tool selected'
          )}
        </div>
      </div>

      {/* 3D Viewport */}
      <div {...(shouldLockModel ? {} : getRootProps())} className="flex-1 relative">
        <input {...getInputProps()} />
        <div ref={mountRef} className="w-full h-full" />
        
        {models.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Upload size={48} className="text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">Drop STL files here to get started</p>
              <p className="text-slate-500 text-sm">Supports .stl format</p>
            </div>
          </div>
        )}

        {isDragActive && !shouldLockModel && (
          <div className="absolute inset-0 bg-blue-600 bg-opacity-20 border-2 border-dashed border-blue-400 flex items-center justify-center">
            <div className="text-center">
              <Upload size={48} className="text-blue-400 mx-auto mb-4" />
              <p className="text-blue-400 text-lg">Drop STL files here</p>
            </div>
          </div>
        )}
        
        {shouldLockModel && (
          <div className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-md text-sm">
            🔒 Model Locked - Drawing Mode Active
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span>Models: {models.length}</span>
          <span>Visible: {models.filter(m => m.visible).length}</span>
          {selectedModel && <span>Selected: {models.find(m => m.id === selectedModel)?.name}</span>}
        </div>
        <div className="flex items-center space-x-4">
          <span>Camera: Perspective</span>
          <span>Renderer: WebGL</span>
          <span className={shouldLockModel ? 'text-orange-400' : 'text-slate-400'}>
            Controls: {shouldLockModel ? 'Locked' : 'Free'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Viewport3D;