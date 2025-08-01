import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { STLModel, ViewportSettings } from '../types';
import { useDropzone } from 'react-dropzone';
import { Upload, Grid3X3, Lightbulb, Palette } from 'lucide-react';
import { DrawingSettings } from './DrawingToolbar';
import { useDrawing } from '../hooks/useDrawing';
import CustomCursor from './CustomCursor';
import PencilRenderer from './PencilRenderer';

interface Viewport3DProps {
  models: STLModel[];
  onModelsChange: (models: STLModel[]) => void;
  activeTool: string | null;
  drawingSettings: DrawingSettings;
  isOrthographic: boolean;
  showGrid: boolean;
  onGridToggle: (show: boolean) => void;
}

const Viewport3D: React.FC<Viewport3DProps> = ({ 
  models, 
  onModelsChange, 
  activeTool, 
  drawingSettings,
  isOrthographic,
  showGrid,
  onGridToggle
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
  
  // Camera control refs
  const orthoCameraRef = useRef<THREE.OrthographicCamera>();
  const perspectiveCameraRef = useRef<THREE.PerspectiveCamera>();
  
  // Custom drawing hook
  const {
    isDrawing,
    strokes,
    currentStroke,
    startDrawing,
    addPoint,
    finishDrawing,
    clearStrokes,
    undoLastStroke
  } = useDrawing();
  
  // Cursor state
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  
  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    wireframe: false,
    showGrid: showGrid,
    backgroundColor: '#1e293b',
    lightIntensity: 1.0
  });

  // Camera control functions
  const resetView = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 50);
      cameraRef.current.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, []);

  const zoomIn = useCallback(() => {
    if (cameraRef.current) {
      if (isOrthographic && cameraRef.current instanceof THREE.OrthographicCamera) {
        cameraRef.current.zoom *= 1.2;
        cameraRef.current.updateProjectionMatrix();
      } else {
        const direction = new THREE.Vector3();
        cameraRef.current.getWorldDirection(direction);
        cameraRef.current.position.add(direction.multiplyScalar(5));
      }
    }
  }, [isOrthographic]);

  const zoomOut = useCallback(() => {
    if (cameraRef.current) {
      if (isOrthographic && cameraRef.current instanceof THREE.OrthographicCamera) {
        cameraRef.current.zoom /= 1.2;
        cameraRef.current.updateProjectionMatrix();
      } else {
        const direction = new THREE.Vector3();
        cameraRef.current.getWorldDirection(direction);
        cameraRef.current.position.add(direction.multiplyScalar(-5));
      }
    }
  }, [isOrthographic]);

  const fitToScreen = useCallback(() => {
    if (!sceneRef.current || !cameraRef.current || !controlsRef.current) return;
    
    const box = new THREE.Box3();
    const meshes = models.filter(m => m.mesh).map(m => m.mesh!);
    
    if (meshes.length === 0) return;
    
    meshes.forEach(mesh => box.expandByObject(mesh));
    
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    controlsRef.current.target.copy(center);
    
    if (isOrthographic && cameraRef.current instanceof THREE.OrthographicCamera) {
      cameraRef.current.zoom = 30 / maxDim;
      cameraRef.current.updateProjectionMatrix();
    } else {
      const distance = maxDim * 2;
      cameraRef.current.position.copy(center);
      cameraRef.current.position.z += distance;
    }
    
    controlsRef.current.update();
  }, [models, isOrthographic]);

  // Update viewport settings when showGrid prop changes
  useEffect(() => {
    setViewportSettings(prev => ({ ...prev, showGrid }));
  }, [showGrid]);
  
  const viewTop = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 50, 0);
      cameraRef.current.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, []);

  const viewFront = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 50);
      cameraRef.current.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, []);

  const viewRight = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(50, 0, 0);
      cameraRef.current.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, []);

  const viewIsometric = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(35, 35, 35);
      cameraRef.current.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, []);

  // Model translation event handlers
  const handleModelTranslateEvent = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    const direction = customEvent.detail?.direction;
    
    console.log('Model translate event received:', direction);
    
    if (!direction) {
      console.log('No direction specified');
      return;
    }
    
    const visibleModels = models.filter(m => m.mesh && m.visible);
    console.log('Visible models to translate:', visibleModels.length);
    
    if (visibleModels.length === 0) {
      console.log('No visible models to translate');
      return;
    }
    
    const translateAmount = 5; // Units to move
    
    visibleModels.forEach((model, index) => {
      if (!model.mesh) return;
      
      const oldPosition = model.mesh.position.clone();
      console.log(`Model ${index} old position:`, oldPosition);
      
      switch (direction) {
        case 'left':
          model.mesh.position.x -= translateAmount;
          break;
        case 'right':
          model.mesh.position.x += translateAmount;
          break;
        case 'up':
          model.mesh.position.y += translateAmount;
          break;
        case 'down':
          model.mesh.position.y -= translateAmount;
          break;
        default:
          console.log('Unknown direction:', direction);
          return;
      }
      
      // Force matrix update
      model.mesh.updateMatrix();
      model.mesh.updateMatrixWorld(true);
      
      console.log(`Model ${index} new position:`, model.mesh.position);
      console.log(`Model ${index} moved ${direction} by ${translateAmount} units`);
    });
    
    // Force re-render
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    
    console.log('Model translation completed');
  }, [models]);

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
    perspectiveCameraRef.current = camera;

    // Create orthographic camera
    const orthoCamera = new THREE.OrthographicCamera(
      -50, 50, 50, -50, 0.1, 1000
    );
    orthoCamera.position.set(0, 0, 50);
    orthoCameraRef.current = orthoCamera;

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
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x444444);
      gridHelper.name = 'gridHelper';
      scene.add(gridHelper);
      console.log('Initial grid added to scene');
    }

    // STL Loader
    loaderRef.current = new STLLoader();

    console.log('Three.js scene initialized');

    // Custom mouse event handlers
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return; // Only left mouse button
      
      console.log('Mouse down - Active tool:', activeTool);
      
      const drawingTools = ['brush', 'pencil', 'polyline', 'bezier', 'mask-brush', 'eraser'];
      if (!drawingTools.includes(activeTool)) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      const drawingPoint = getDrawingPoint(event);
      if (drawingPoint) {
        const color = activeTool === 'pencil' ? drawingSettings.pencilColor : 
                     activeTool === 'brush' ? drawingSettings.brushColor : '#00ff00';
        const size = activeTool === 'pencil' ? drawingSettings.pencilSize : 
                    activeTool === 'brush' ? drawingSettings.brushSize : 1.0;
        
        startDrawing(drawingPoint, activeTool, color, size);
        controls.enabled = false; // Disable camera controls while drawing
        console.log('Started drawing with tool:', activeTool);
      }
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      // Update cursor position
      setCursorPosition({ x: event.clientX, y: event.clientY });
      
      const drawingTools = ['brush', 'pencil', 'polyline', 'bezier', 'mask-brush', 'eraser'];
      const isDrawingTool = activeTool && drawingTools.includes(activeTool);
      
      // Show/hide cursor based on tool and model intersection
      if (isDrawingTool) {
        const hasIntersection = checkModelIntersection(event);
        setCursorVisible(hasIntersection);
      } else {
        setCursorVisible(false);
      }
      
      // Continue drawing if active
      if (isDrawing && activeTool) {
        const drawingPoint = getDrawingPoint(event);
        if (drawingPoint) {
          addPoint(drawingPoint);
        }
      }
    };
    
    const handleMouseUp = () => {
      if (isDrawing) {
        finishDrawing();
        controls.enabled = true; // Re-enable camera controls
        console.log('Finished drawing');
      }
    };
    
    const getDrawingPoint = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const meshes = models.filter(m => m.mesh && m.visible).map(m => m.mesh!);
      const intersects = raycasterRef.current.intersectObjects(meshes);
      
      if (intersects.length > 0) {
        const intersect = intersects[0];
        return {
          x: event.clientX,
          y: event.clientY,
          worldPosition: intersect.point.clone(),
          timestamp: Date.now()
        };
      }
      
      return null;
    };
    
    const checkModelIntersection = (event: MouseEvent): boolean => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const meshes = models.filter(m => m.mesh && m.visible).map(m => m.mesh!);
      const intersects = raycasterRef.current.intersectObjects(meshes);
      
      return intersects.length > 0;
    };
    
    // Model selection handler (for transform tools)
    const handleModelClick = (event: MouseEvent) => {
      const drawingTools = ['brush', 'pencil', 'polyline', 'bezier', 'mask-brush', 'eraser'];
      if (activeTool && drawingTools.includes(activeTool)) {
        return;
      }
      
      if (!['translate', 'rotate', 'scale'].includes(activeTool || '')) {
        if (transformControlsRef.current) {
          transformControlsRef.current.detach();
          selectedModelRef.current = null;
        }
        return;
      }
      
      event.preventDefault();
      event.stopPropagation();
      
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      
      const meshes = models.filter(m => m.mesh && m.visible).map(m => m.mesh!);
      const intersects = raycaster.intersectObjects(meshes);
      
      if (intersects.length > 0) {
        const selectedMesh = intersects[0].object as THREE.Mesh;
        selectedModelRef.current = selectedMesh;
        console.log('Model selected:', selectedMesh.uuid, 'for tool:', activeTool);
        
        if (transformControlsRef.current) {
          transformControlsRef.current.attach(selectedMesh);
          
          if (activeTool === 'translate') {
            transformControlsRef.current.setMode('translate');
          } else if (activeTool === 'rotate') {
            transformControlsRef.current.setMode('rotate');
          } else if (activeTool === 'scale') {
            transformControlsRef.current.setMode('scale');
          }
        }
      } else {
        console.log('No model clicked');
      }
    };
    
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('click', handleModelClick, true);

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

    // Camera control event listeners
    const handleCameraEvents = (event: Event) => {
      const customEvent = event as CustomEvent;
      switch (customEvent.type) {
        case 'camera-reset':
          resetView();
          break;
        case 'camera-zoom-in':
          zoomIn();
          break;
        case 'camera-zoom-out':
          zoomOut();
          break;
        case 'camera-fit-screen':
          fitToScreen();
          break;
        case 'camera-view-top':
          viewTop();
          break;
        case 'camera-view-front':
          viewFront();
          break;
        case 'camera-view-right':
          viewRight();
          break;
        case 'camera-view-iso':
          viewIsometric();
          break;
      }
    };

    window.addEventListener('camera-reset', handleCameraEvents);
    window.addEventListener('camera-zoom-in', handleCameraEvents);
    window.addEventListener('camera-zoom-out', handleCameraEvents);
    window.addEventListener('camera-fit-screen', handleCameraEvents);
    window.addEventListener('camera-view-top', handleCameraEvents);
    window.addEventListener('camera-view-front', handleCameraEvents);
    window.addEventListener('camera-view-right', handleCameraEvents);
    window.addEventListener('camera-view-iso', handleCameraEvents);

    return () => {
      initializedRef.current = false;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('camera-reset', handleCameraEvents);
      window.removeEventListener('camera-zoom-in', handleCameraEvents);
      window.removeEventListener('camera-zoom-out', handleCameraEvents);
      window.removeEventListener('camera-fit-screen', handleCameraEvents);
      window.removeEventListener('camera-view-top', handleCameraEvents);
      window.removeEventListener('camera-view-front', handleCameraEvents);
      window.removeEventListener('camera-view-right', handleCameraEvents);
      window.removeEventListener('camera-view-iso', handleCameraEvents);
      
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('mouseup', handleMouseUp);
        renderer.domElement.removeEventListener('click', handleModelClick, true);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Cleanup drawing and cutting systems
      
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
      transformControls.dispose();
      renderer.dispose();
    };
  }, []);
  
  // Separate effect for model translation event listener
  useEffect(() => {
    window.addEventListener('model-translate', handleModelTranslateEvent);
    
    return () => {
      window.removeEventListener('model-translate', handleModelTranslateEvent);
    };
  }, [handleModelTranslateEvent]);
  
  // Handle camera switching
  useEffect(() => {
    if (!perspectiveCameraRef.current || !orthoCameraRef.current || !controlsRef.current || !rendererRef.current) return;
    
    const newCamera = isOrthographic ? orthoCameraRef.current : perspectiveCameraRef.current;
    
    // Copy position and rotation from current camera to new camera
    if (cameraRef.current) {
      newCamera.position.copy(cameraRef.current.position);
      newCamera.rotation.copy(cameraRef.current.rotation);
      
      // Update aspect ratio for new camera
      if (rendererRef.current) {
        const aspect = rendererRef.current.domElement.clientWidth / rendererRef.current.domElement.clientHeight;
        if (newCamera instanceof THREE.PerspectiveCamera) {
          newCamera.aspect = aspect;
        } else if (newCamera instanceof THREE.OrthographicCamera) {
          const frustumSize = 100;
          newCamera.left = -frustumSize * aspect / 2;
          newCamera.right = frustumSize * aspect / 2;
          newCamera.top = frustumSize / 2;
          newCamera.bottom = -frustumSize / 2;
        }
        newCamera.updateProjectionMatrix();
      }
    }
    
    cameraRef.current = newCamera;
    controlsRef.current.object = newCamera;
    
    // Update transform controls camera
    if (transformControlsRef.current) {
      transformControlsRef.current.camera = newCamera;
    }
  }, [isOrthographic]);
  
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
    
    // Remove existing grids
    const existingGrids = [];
    sceneRef.current.traverse((object) => {
      if (object instanceof THREE.GridHelper) {
        existingGrids.push(object);
      }
    });
    
    existingGrids.forEach(grid => {
      sceneRef.current!.remove(grid);
      grid.dispose();
    });
    
    console.log('Grid visibility changed to:', showGrid);
    
    // Add new grid if enabled
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x444444);
      gridHelper.name = 'gridHelper';
      sceneRef.current.add(gridHelper);
      console.log('Grid added to scene');
    } else {
      console.log('Grid removed from scene');
    }
    
    // Force re-render
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  
  // Update transform controls when active tool changes
  useEffect(() => {
    if (!controlsRef.current || !transformControlsRef.current) return;
    
    // Handle camera controls based on active tool
    const drawingTools = ['brush', 'pencil', 'polyline', 'bezier', 'mask-brush', 'eraser'];
    const isDrawingTool = activeTool && drawingTools.includes(activeTool);
    
    // Only disable camera controls when actually drawing
    if (!isDrawing) {
      controlsRef.current.enabled = !isDrawingTool;
    }
    
    if (!transformControlsRef.current) return;
    
    if (['translate', 'rotate', 'scale'].includes(activeTool || '')) {
      transformControlsRef.current.visible = true;
      
      // Set transform mode based on active tool
      if (activeTool === 'translate') {
        transformControlsRef.current.setMode('translate');
      } else if (activeTool === 'rotate') {
        transformControlsRef.current.setMode('rotate');
      } else if (activeTool === 'scale') {
        transformControlsRef.current.setMode('scale');
      }
    } else {
      transformControlsRef.current.visible = false;
      transformControlsRef.current.detach();
      selectedModelRef.current = null;
    }
  }, [activeTool]);


  // Update scene when models change
  useEffect(() => {
    if (!sceneRef.current || !loaderRef.current) return;

    console.log('Processing models:', models.length);

    models.forEach((model) => {
      if (model.file && !model.mesh) {
        console.log('Loading new model:', model.name);
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            console.log('File loaded, parsing STL...');
            const arrayBuffer = event.target!.result as ArrayBuffer;
            console.log('ArrayBuffer size:', arrayBuffer.byteLength);
            
            const geometry = loaderRef.current!.parse(arrayBuffer);
            console.log('STL parsed successfully, vertices:', geometry.attributes.position.count);
            
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
            console.log('Geometry processed - size:', size, 'scale:', scale);

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
            mesh.userData.modelId = model.id; // Add reference for debugging

            console.log('Adding mesh to scene:', mesh.uuid, 'at position:', mesh.position);
            sceneRef.current!.add(mesh);
            
            // Prepare mesh for cutting operations

            // Update model with mesh reference
            const updatedModels = models.map(m => 
              m.id === model.id ? { ...m, mesh } : m
            );
            console.log('Updating models with mesh reference for model:', model.id);
            onModelsChange(updatedModels);
            
            // Force a render to ensure the model appears
            if (rendererRef.current && cameraRef.current) {
              rendererRef.current.render(sceneRef.current!, cameraRef.current);
            }
          } catch (error) {
            console.error('Error loading STL file:', error);
            console.error('Model that failed:', model.name);
          }
        };
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
        };
        console.log('Reading file as ArrayBuffer...');
        reader.readAsArrayBuffer(model.file);
      } else if (model.mesh) {
        console.log('Updating existing model visibility/color:', model.name);
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
    onGridToggle(!showGrid);
  };

  const clearAnnotations = () => {
    clearStrokes();
    console.log('Cleared all annotations');
  };
  
  const undoLastAction = () => {
    undoLastStroke();
  };
  
  const redoLastAction = () => {
    // TODO: Implement redo functionality
    console.log('Redo not implemented yet');
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
              showGrid
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
          {strokes.length > 0 && (
            <button
              onClick={clearAnnotations}
              className="px-3 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
            >
              Clear Annotations
            </button>
          )}
          <div className="flex items-center space-x-1">
            <button
              onClick={undoLastAction}
              className="px-2 py-1 rounded text-xs bg-slate-600 text-white hover:bg-slate-500 transition-colors duration-200"
              title="Undo (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={redoLastAction}
              className="px-2 py-1 rounded text-xs bg-slate-600 text-white hover:bg-slate-500 transition-colors duration-200"
              title="Redo (Ctrl+Y)"
            >
              ↷
            </button>
          </div>
        </div>
        
        <div className="text-slate-400 text-sm">
          {activeTool === 'move' ? 'Camera Control Mode' :
           activeTool && ['brush', 'pencil', 'polyline', 'bezier', 'eraser'].includes(activeTool) ? 
            `Drawing Tool: ${activeTool}` : 
            activeTool ? `Tool: ${activeTool}` : 'No tool selected'
          }
          {selectedModelRef.current && ['translate', 'rotate', 'scale'].includes(activeTool || '') && (
            <span className="ml-4 text-blue-400">Model Selected</span>
          )}
          {strokes.length > 0 && (
            <span className="ml-4 text-green-400">Drawings: {strokes.length}</span>
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

      {/* Custom Cursor */}
      <CustomCursor
        tool={activeTool}
        size={activeTool === 'pencil' ? drawingSettings.pencilSize : 
              activeTool === 'brush' ? drawingSettings.brushSize : 1.0}
        color={activeTool === 'pencil' ? drawingSettings.pencilColor : 
               activeTool === 'brush' ? drawingSettings.brushColor : '#00ff00'}
        position={cursorPosition}
        visible={cursorVisible}
      />

      {/* Pencil Renderer */}
      {sceneRef.current && (
        <PencilRenderer
          strokes={strokes}
          currentStroke={currentStroke}
          scene={sceneRef.current}
        />
      )}

      {/* Status Bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span>Models: {models.length}</span>
          <span>Visible: {models.filter(m => m.visible).length}</span>
          {strokes.length > 0 && (
            <span>Strokes: {strokes.length}</span>
          )}
          {activeTool && (
            <span>Tool: {activeTool}</span>
          )}
        </div>
        <div className="text-slate-400 text-sm">
          <span className="mr-4">Projection: {isOrthographic ? 'Orthographic' : 'Perspective'}</span>
          <span>
            {activeTool && ['brush', 'pencil', 'polyline', 'bezier', 'mask-brush', 'eraser'].includes(activeTool) 
              ? 'Click and drag on model to draw' 
              : 'Use mouse wheel to zoom, drag to rotate'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default Viewport3D;