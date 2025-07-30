import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { STLModel, ViewportSettings } from '../types';
import { useDropzone } from 'react-dropzone';
import { Upload, Grid3X3, Lightbulb, Palette } from 'lucide-react';

interface Viewport3DProps {
  models: STLModel[];
  onModelsChange: (models: STLModel[]) => void;
  activeTool: string | null;
  brushSize: number;
  brushOpacity: number;
  drawingColor: string;
}

const Viewport3D: React.FC<Viewport3DProps> = ({
  models,
  onModelsChange,
  activeTool,
  brushSize,
  brushOpacity,
  drawingColor
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<OrbitControls>();
  const transformControlsRef = useRef<TransformControls>();
  const selectedModelRef = useRef<THREE.Mesh | null>(null);
  const loaderRef = useRef<STLLoader>();
  const initializedRef = useRef<boolean>(false);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState<THREE.Group[]>([]);
  const [polygonPoints, setPolygonPoints] = useState<THREE.Vector3[]>([]);
  const [bezierControlPoints, setBezierControlPoints] = useState<THREE.Vector3[]>([]);
  const [currentStroke, setCurrentStroke] = useState<THREE.Vector3[]>([]);
  const [currentStrokeGroup, setCurrentStrokeGroup] = useState<THREE.Group | null>(null);
  
  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    wireframe: false,
    showGrid: true,
    backgroundColor: '#1e293b',
    lightIntensity: 1.0
  });

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current || initializedRef.current) return;
    
    initializedRef.current = true;

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

    // Transform controls
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value;
    });
    scene.add(transformControls);
    transformControlsRef.current = transformControls;

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

    // Mouse event handlers for drawing tools
    const handleMouseDown = (event: MouseEvent) => {
      // Prevent default behavior for drawing tools
      const drawingTools = ['pencil', 'mask-brush', 'polygon', 'bezier', 'eraser'];
      if (activeTool && drawingTools.includes(activeTool)) {
        event.preventDefault();
        event.stopPropagation();
        
        // Disable orbit controls when using drawing tools
        if (controlsRef.current) {
          controlsRef.current.enabled = false;
        }
      }
      
      if (!activeTool || !drawingTools.includes(activeTool)) return;
      
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      const meshes = models.filter(m => m.mesh && m.visible).map(m => m.mesh!);
      const intersects = raycasterRef.current.intersectObjects(meshes);
      
      if (intersects.length > 0) {
        const point = intersects[0].point;
        const normal = intersects[0].face?.normal.clone();
        if (normal) {
          normal.transformDirection(intersects[0].object.matrixWorld);
        }
        
        if (activeTool === 'mask-brush' || activeTool === 'pencil' || activeTool === 'eraser') {
          setIsDrawing(true);
          setDrawingPoints([point]);
          const strokeGroup = new THREE.Group();
          strokeGroup.userData.toolType = activeTool;
          strokeGroup.userData.color = drawingColor;
          strokeGroup.userData.brushSize = brushSize;
          strokeGroup.userData.opacity = brushOpacity;
          scene.add(strokeGroup);
          setAnnotations(prev => [...prev, strokeGroup]);
          addDrawingPoint(point, normal || new THREE.Vector3(0, 1, 0), activeTool, strokeGroup);
        } else if (activeTool === 'polygon') {
          addPolygonPoint(point);
        } else if (activeTool === 'bezier') {
          addBezierPoint(point);
        }
      }
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDrawing || !activeTool || !['mask-brush', 'pencil', 'eraser'].includes(activeTool)) return;
      
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      const meshes = models.filter(m => m.mesh && m.visible).map(m => m.mesh!);
      const intersects = raycasterRef.current.intersectObjects(meshes);
      
      if (intersects.length > 0) {
        const point = intersects[0].point;
        const normal = intersects[0].face?.normal.clone();
        if (normal) {
          normal.transformDirection(intersects[0].object.matrixWorld);
        }
        
        setDrawingPoints(prev => [...prev, point]);
        const currentStroke = annotations[annotations.length - 1];
        if (currentStroke) {
          addDrawingPoint(point, normal || new THREE.Vector3(0, 1, 0), activeTool, currentStroke);
        }
      }
    };
    
    const handleMouseUp = () => {
      if (isDrawing) {
        setIsDrawing(false);
        setDrawingPoints([]);
      }
      
      // Re-enable orbit controls after drawing
      const drawingTools = ['pencil', 'mask-brush', 'polygon', 'bezier', 'eraser'];
      if (activeTool && drawingTools.includes(activeTool)) {
        setTimeout(() => {
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
          }
        }, 100);
      }
    };
    
    // Model selection handler
    const handleModelClick = (event: MouseEvent) => {
      // Only handle model selection for transform tools
      const transformTools = ['translate', 'rotate', 'scale'];
      if (!transformTools.includes(activeTool || '')) return;
      
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      
      const meshes = models.filter(m => m.mesh && m.visible).map(m => m.mesh!);
      const intersects = raycasterRef.current.intersectObjects(meshes);
      
      if (intersects.length > 0) {
        const selectedMesh = intersects[0].object as THREE.Mesh;
        selectedModelRef.current = selectedMesh;
        
        if (transformControlsRef.current) {
          transformControlsRef.current.attach(selectedMesh);
          
          // Set transform mode based on active tool
          if (activeTool === 'translate') {
            transformControlsRef.current.setMode('translate');
          } else if (activeTool === 'rotate') {
            transformControlsRef.current.setMode('rotate');
          } else if (activeTool === 'scale') {
            transformControlsRef.current.setMode('scale');
          }
        }
      }
    };
    
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('click', handleModelClick);

    mountRef.current.appendChild(renderer.domElement);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
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
      initializedRef.current = false;
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('mouseup', handleMouseUp);
        renderer.domElement.removeEventListener('click', handleModelClick);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Proper cleanup of Three.js resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      controls.dispose();
      if (transformControls.parent) {
        transformControls.parent.remove(transformControls);
      }
      transformControls.dispose();
      renderer.dispose();
    };
  }, []); // Empty dependency array - initialize only once
  
  // Update viewport settings
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Update background color
    sceneRef.current.background = new THREE.Color(viewportSettings.backgroundColor);
    
    // Update light intensity
    sceneRef.current.traverse((object) => {
      if (object instanceof THREE.DirectionalLight && object.intensity !== 0.3) {
        object.intensity = viewportSettings.lightIntensity;
      }
    });
  }, [viewportSettings]);
  
  // Update grid visibility
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Remove existing grid
    const existingGrid = sceneRef.current.getObjectByName('gridHelper');
    if (existingGrid) {
      sceneRef.current.remove(existingGrid);
    }
    
    // Add new grid if enabled
    if (viewportSettings.showGrid) {
      const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x444444);
      gridHelper.name = 'gridHelper';
      sceneRef.current.add(gridHelper);
    }
  }, [viewportSettings.showGrid]);
  
  // Update transform controls when active tool changes
  useEffect(() => {
    if (!transformControlsRef.current) return;
    
    const transformTools = ['translate', 'rotate', 'scale'];
    const drawingTools = ['pencil', 'mask-brush', 'polygon', 'bezier', 'eraser'];
    
    if (transformTools.includes(activeTool || '')) {
      transformControlsRef.current.visible = true;
      // Enable orbit controls for transform tools
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    } else if (drawingTools.includes(activeTool || '')) {
      // Hide transform controls and disable orbit controls for drawing tools
      transformControlsRef.current.visible = false;
      transformControlsRef.current.detach();
      selectedModelRef.current = null;
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    } else {
      transformControlsRef.current.visible = false;
      transformControlsRef.current.detach();
      selectedModelRef.current = null;
      // Re-enable orbit controls when no tool is selected
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    }
  }, [activeTool]);
  
  // Drawing helper functions
  const addDrawingPoint = (point: THREE.Vector3, normal: THREE.Vector3, toolType: string, strokeGroup: THREE.Group) => {
    if (!sceneRef.current || !strokeGroup) return;
    
    let geometry: THREE.BufferGeometry;
    let size = strokeGroup.userData.brushSize || brushSize;
    let opacity = strokeGroup.userData.opacity || brushOpacity;
    
    if (toolType === 'pencil') {
      geometry = new THREE.SphereGeometry(size * 0.05, 8, 8);
    } else if (toolType === 'mask-brush') {
      geometry = new THREE.SphereGeometry(size * 0.15, 12, 12);
    } else if (toolType === 'eraser') {
      geometry = new THREE.SphereGeometry(size * 0.1, 8, 8);
    } else {
      geometry = new THREE.SphereGeometry(0.05, 8, 8);
    }
    
    const color = toolType === 'eraser' ? 0xff0000 : parseInt((strokeGroup.userData.color || drawingColor).replace('#', ''), 16);
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: toolType === 'mask-brush' ? opacity : (toolType === 'eraser' ? 0.7 : 1.0)
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(point);
    
    // Offset slightly along normal to prevent z-fighting
    const offset = normal.clone().multiplyScalar(0.01);
    sphere.position.add(offset);
    
    sphere.userData.toolType = toolType;
    
    strokeGroup.add(sphere);
    
    // Connect points with lines for continuous strokes
    if (strokeGroup.children.length > 1 && (toolType === 'pencil' || toolType === 'mask-brush' || toolType === 'eraser')) {
      const prevPoint = strokeGroup.children[strokeGroup.children.length - 2].position;
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([prevPoint, point]);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: color, 
        linewidth: toolType === 'pencil' ? 2 : (toolType === 'eraser' ? 4 : 5),
        transparent: true,
        opacity: toolType === 'mask-brush' ? opacity : (toolType === 'eraser' ? 0.7 : 1.0)
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      strokeGroup.add(line);
    }
  };
  
  const addPolygonPoint = (point: THREE.Vector3) => {
    if (!sceneRef.current) return;
    
    // Add point marker
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const color = parseInt(drawingColor.replace('#', ''), 16);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(point);
    
    let polygonGroup = annotations.find(group => group.userData.toolType === 'polygon' && !group.userData.completed);
    if (!polygonGroup) {
      polygonGroup = new THREE.Group();
      polygonGroup.userData.toolType = 'polygon';
      polygonGroup.userData.points = [];
      polygonGroup.userData.color = drawingColor;
      polygonGroup.userData.completed = false;
      sceneRef.current.add(polygonGroup);
      setAnnotations(prev => [...prev, polygonGroup!]);
    }
    
    polygonGroup.add(sphere);
    polygonGroup.userData.points.push(point);
    setPolygonPoints(prev => [...prev, point]);
    
    // Draw line to previous point
    if (polygonGroup.userData.points.length > 1) {
      const points = polygonGroup.userData.points;
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        points[points.length - 2],
        points[points.length - 1]
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: 3 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      polygonGroup.add(line);
    }
    
    console.log(`Polygon point added. Total points: ${polygonGroup.userData.points.length}`);
  };
  
  const addBezierPoint = (point: THREE.Vector3) => {
    if (!sceneRef.current) return;
    
    // Add control point
    const geometry = new THREE.SphereGeometry(0.15, 8, 8);
    const color = parseInt(drawingColor.replace('#', ''), 16);
    const material = new THREE.MeshBasicMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.8
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(point);
    
    let bezierGroup = annotations.find(group => group.userData.toolType === 'bezier' && !group.userData.completed);
    if (!bezierGroup) {
      bezierGroup = new THREE.Group();
      bezierGroup.userData.toolType = 'bezier';
      bezierGroup.userData.controlPoints = [];
      bezierGroup.userData.color = drawingColor;
      bezierGroup.userData.completed = false;
      sceneRef.current.add(bezierGroup);
      setAnnotations(prev => [...prev, bezierGroup!]);
    }
    
    bezierGroup.add(sphere);
    bezierGroup.userData.controlPoints.push(point);
    setBezierControlPoints(prev => [...prev, point]);
    
    // Create bezier curve when we have enough points
    if (bezierGroup.userData.controlPoints.length >= 4) {
      const points = bezierGroup.userData.controlPoints;
      const curve = new THREE.CubicBezierCurve3(
        points[points.length - 4],
        points[points.length - 3],
        points[points.length - 2],
        points[points.length - 1]
      );
      
      const curvePoints = curve.getPoints(50);
      const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const curveMaterial = new THREE.LineBasicMaterial({ 
        color: color, 
        linewidth: 4,
        transparent: true,
        opacity: 0.9
      });
      const curveLine = new THREE.Line(curveGeometry, curveMaterial);
      bezierGroup.add(curveLine);
      
      // Mark as completed and start new curve
      bezierGroup.userData.completed = true;
      setBezierControlPoints([]);
      
      console.log('Bezier curve completed');
    }
    
    console.log(`Bezier control point added. Total points: ${bezierGroup.userData.controlPoints.length}`);
  };

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
          mesh.position.x = model.type === 'upper' ? 0 : 20;

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
      }
    });
  }, [models, viewportSettings.wireframe]);

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
    noClick: true
  });

  const toggleWireframe = () => {
    setViewportSettings(prev => ({ ...prev, wireframe: !prev.wireframe }));
  };

  const toggleGrid = () => {
    setViewportSettings(prev => ({ ...prev, showGrid: !prev.showGrid }));
  };

  const clearAnnotations = () => {
    if (!sceneRef.current) return;
    
    annotations.forEach(group => {
      sceneRef.current!.remove(group);
    });
    setAnnotations([]);
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
          {annotations.length > 0 && (
            <button
              onClick={clearAnnotations}
              className="px-3 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
            >
              Clear Annotations
            </button>
          )}
        </div>
        
        <div className="text-slate-400 text-sm">
          {activeTool ? `Active Tool: ${activeTool}` : 'No tool selected'}
          {selectedModelRef.current && ['translate', 'rotate', 'scale'].includes(activeTool || '') && (
            <span className="ml-4 text-blue-400">Model Selected</span>
          )}
          {['pencil', 'mask-brush', 'polygon', 'bezier', 'eraser'].includes(activeTool || '') && (
            <span className="ml-4 text-green-400">Drawing Mode - Right-click to rotate view</span>
          )}
          {annotations.length > 0 && (
            <span className="ml-4 text-green-400">Annotations: {annotations.length}</span>
          )}
          {isDrawing && (
            <span className="ml-4 text-yellow-400">Drawing...</span>
          )}
        </div>
      </div>

      {/* 3D Viewport */}
      <div {...getRootProps()} className="flex-1 relative">
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

        {isDragActive && (
          <div className="absolute inset-0 bg-blue-600 bg-opacity-20 border-2 border-dashed border-blue-400 flex items-center justify-center">
            <div className="text-center">
              <Upload size={48} className="text-blue-400 mx-auto mb-4" />
              <p className="text-blue-400 text-lg">Drop STL files here</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span>Models: {models.length}</span>
          <span>Visible: {models.filter(m => m.visible).length}</span>
          <span>Annotations: {annotations.length}</span>
          {activeTool && (
            <span className={`${['pencil', 'mask-brush', 'polygon', 'bezier', 'eraser'].includes(activeTool) ? 'text-green-400' : 'text-blue-400'}`}>
              Tool: {activeTool}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>Camera: Perspective</span>
          <span>Renderer: WebGL</span>
        </div>
      </div>
    </div>
  );
};

export default Viewport3D;