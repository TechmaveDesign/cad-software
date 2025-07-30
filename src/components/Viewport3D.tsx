import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { STLModel, ViewportSettings } from '../types';
import { useDropzone } from 'react-dropzone';
import { Upload, Grid3X3, Lightbulb, Palette } from 'lucide-react';
import { DrawingSettings } from './DrawingToolbar';
import { MeshOperations } from '../utils/meshOperations';

interface Viewport3DProps {
  models: STLModel[];
  onModelsChange: (models: STLModel[]) => void;
  activeTool: string | null;
  drawingSettings: DrawingSettings;
  isOrthographic: boolean;
}

const Viewport3D: React.FC<Viewport3DProps> = ({ 
  models, 
  onModelsChange, 
  activeTool, 
  drawingSettings,
  isOrthographic
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
  
  // Camera control refs
  const orthoCameraRef = useRef<THREE.OrthographicCamera>();
  const perspectiveCameraRef = useRef<THREE.PerspectiveCamera>();
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<THREE.Vector3[]>([]);
  const [annotations, setAnnotations] = useState<THREE.Group[]>([]);
  const [currentStroke, setCurrentStroke] = useState<THREE.Group | null>(null);
  
  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    wireframe: false,
    showGrid: true,
    backgroundColor: '#1e293b',
    lightIntensity: 1.0
  });

  // Occlusal plane state
  const [occlusalPoints, setOcclusalPoints] = useState<THREE.Vector3[]>([]);
  const [occlusalMarkers, setOcclusalMarkers] = useState<THREE.Mesh[]>([]);
  const [isSelectingOcclusalPoints, setIsSelectingOcclusalPoints] = useState(false);
  const [undoStack, setUndoStack] = useState<Array<{modelId: string, position: THREE.Vector3, rotation: THREE.Euler, scale: THREE.Vector3}>>([]);

  // Model editing state
  const [editingMode, setEditingMode] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<THREE.Box3 | null>(null);
  const [selectionHelper, setSelectionHelper] = useState<THREE.Box3Helper | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<THREE.Vector3 | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<THREE.Vector3 | null>(null);

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
  const [cuttingShape, setCuttingShape] = useState<THREE.Mesh | null>(null);
  const [isDefiningCutArea, setIsDefiningCutArea] = useState(false);
  const [cutPoints, setCutPoints] = useState<THREE.Vector3[]>([]);

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
    if (viewportSettings.showGrid) {
      const gridHelper = new THREE.GridHelper(100, 50, 0x444444, 0x444444);
      scene.add(gridHelper);
    }

    // STL Loader
    loaderRef.current = new STLLoader();

    // Mouse event handlers for drawing tools
    const handleMouseDown = (event: MouseEvent) => {
      if (!activeTool || !['brush', 'pencil', 'polyline', 'bezier', 'eraser'].includes(activeTool)) return;
      
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
        const point = intersects[0].point;
        
        if (activeTool === 'brush' || activeTool === 'pencil') {
          setIsDrawing(true);
          setDrawingPoints([point]);
          startNewStroke(point, activeTool);
        } else if (activeTool === 'polyline') {
          addPolylinePoint(point);
        } else if (activeTool === 'bezier') {
          addBezierPoint(point);
        } else if (activeTool === 'eraser') {
          eraseAtPoint(point);
        }
      }
    };
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDrawing || !activeTool || !['brush', 'pencil'].includes(activeTool)) return;
      
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
        const point = intersects[0].point;
        setDrawingPoints(prev => [...prev, point]);
        continueStroke(point, activeTool);
      }
    };
    
    const handleMouseUp = () => {
      if (isDrawing) {
        setIsDrawing(false);
        finishStroke();
      }
    };
    
    // Model selection handler
    const handleModelClick = (event: MouseEvent) => {
    console.log('Model click handler triggered, active tool:', activeTool);
    
    // Handle occlusal point selection first
    if (isSelectingOcclusalPoints) {
      console.log('Handling occlusal point selection');
      handleOcclusalPointSelection(event);
      return;
    }
    
    // Handle drawing tools
    if (activeTool && ['brush', 'pencil', 'polyline', 'bezier', 'eraser'].includes(activeTool)) {
      console.log('Drawing tool active, skipping model selection');
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
    console.log('Available meshes for selection:', meshes.length);
    
    const intersects = raycaster.intersectObjects(meshes);
    console.log('Intersections found:', intersects.length);
    
    if (intersects.length > 0) {
      const selectedMesh = intersects[0].object as THREE.Mesh;
      selectedModelRef.current = selectedMesh;
      console.log('Model selected:', selectedMesh.uuid, 'for tool:', activeTool);
      
      // Handle transform tools
      if (['translate', 'rotate', 'scale'].includes(activeTool || '')) {
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
      
      // Handle other tools that need model selection
      if (activeTool === 'cut' || activeTool === 'smooth' || activeTool === 'close-holes') {
        console.log('Model selected for editing tool:', activeTool);
        // Add visual feedback for selected model
        selectedMesh.material.emissive = new THREE.Color(0x444444);
      }
    } else {
      console.log('No model clicked');
      // Clear selection
      if (transformControlsRef.current) {
        transformControlsRef.current.detach();
      }
      selectedModelRef.current = null;
      
      // Clear visual feedback
      models.forEach(model => {
        if (model.mesh) {
          model.mesh.material.emissive = new THREE.Color(0x000000);
        }
      });
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
  
  // Occlusal plane helper functions
  const createOcclusalMarker = (position: THREE.Vector3, index: number) => {
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshBasicMaterial({ 
      color: index === 0 ? 0xff0000 : index === 1 ? 0x00ff00 : 0x0000ff,
      transparent: true,
      opacity: 0.8
    });
    const marker = new THREE.Mesh(geometry, material);
    marker.position.copy(position);
    marker.position.add(new THREE.Vector3(0, 0, 0.5)); // Slightly offset from surface
    return marker;
  };

  const calculatePlaneFromPoints = (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3) => {
    // Calculate two vectors in the plane
    const v1 = new THREE.Vector3().subVectors(p2, p1);
    const v2 = new THREE.Vector3().subVectors(p3, p1);
    
    // Calculate normal vector (cross product)
    const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
    
    // Calculate plane center
    const center = new THREE.Vector3()
      .addVectors(p1, p2)
      .add(p3)
      .divideScalar(3);
    
    return { normal, center };
  };

  const alignModelToOcclusalPlane = (modelMesh: THREE.Mesh, points: THREE.Vector3[]) => {
    if (points.length !== 3) return;

    console.log('Aligning model to occlusal plane with points:', points);

    // Save current state for undo
    const currentState = {
      modelId: modelMesh.uuid,
      position: modelMesh.position.clone(),
      rotation: modelMesh.rotation.clone(),
      scale: modelMesh.scale.clone()
    };
    setUndoStack(prev => [...prev, currentState]);

    // Calculate plane from three points
    const { normal, center } = calculatePlaneFromPoints(points[0], points[1], points[2]);
    
    console.log('Calculated plane normal:', normal);
    console.log('Calculated plane center:', center);

    // Target normal is Z-axis (0, 0, 1) for XY plane
    const targetNormal = new THREE.Vector3(0, 0, 1);
    
    // Calculate rotation quaternion to align normals
    const quaternion = new THREE.Quaternion().setFromUnitVectors(normal, targetNormal);
    
    // Apply rotation to the model
    modelMesh.applyQuaternion(quaternion);
    
    // Translate model so the plane center is at origin Z
    const rotatedCenter = center.clone().applyQuaternion(quaternion);
    modelMesh.position.sub(new THREE.Vector3(rotatedCenter.x, rotatedCenter.y, rotatedCenter.z));
    
    // Update matrices
    modelMesh.updateMatrix();
    modelMesh.updateMatrixWorld(true);
    
    console.log('Model aligned successfully');
    console.log('New position:', modelMesh.position);
    console.log('New rotation:', modelMesh.rotation);

    // Force re-render
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const handleOcclusalPointSelection = (event: MouseEvent) => {
    if (!isSelectingOcclusalPoints || !sceneRef.current || !rendererRef.current || !cameraRef.current) {
      console.log('Occlusal selection conditions not met');
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Processing occlusal point selection...');
    
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    console.log('Mouse coordinates:', mouse);
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    
    const meshes = models.filter(m => m.mesh && m.visible).map(m => m.mesh!);
    console.log('Available meshes for occlusal selection:', meshes.length);
    
    const intersects = raycaster.intersectObjects(meshes);
    console.log('Occlusal intersections found:', intersects.length);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const selectedMesh = intersects[0].object as THREE.Mesh;
      
      console.log(`Selected occlusal point ${occlusalPoints.length + 1}:`, point.toArray());
      
      // Add point to array
      const newPoints = [...occlusalPoints, point];
      setOcclusalPoints(newPoints);
      
      // Create visual marker
      const marker = createOcclusalMarker(point, occlusalPoints.length);
      sceneRef.current.add(marker);
      setOcclusalMarkers(prev => [...prev, marker]);
      
      console.log(`Total occlusal points: ${newPoints.length}/3`);
      
      // If we have 3 points, calculate and apply the occlusal plane
      if (newPoints.length === 3) {
        console.log('Three points selected, calculating occlusal plane...');
        
        // Apply alignment to the selected mesh
        alignModelToOcclusalPlane(selectedMesh, newPoints);
        
        // Show success message
        setTimeout(() => {
          alert('Occlusal Plane Set Successfully!\n\nThe model has been aligned so the selected plane is parallel to the ground.');
        }, 100);
        
        // Reset selection mode
        resetOcclusalSelection();
      }
    } else {
      console.log('No mesh intersection for occlusal point selection');
    }
  };

  const resetOcclusalSelection = () => {
    console.log('Resetting occlusal plane selection');
    
    // Remove visual markers
    if (sceneRef.current) {
      occlusalMarkers.forEach(marker => {
        sceneRef.current!.remove(marker);
        marker.geometry.dispose();
        (marker.material as THREE.Material).dispose();
      });
    }
    
    // Reset state
    setOcclusalPoints([]);
    setOcclusalMarkers([]);
    setIsSelectingOcclusalPoints(false);
    
    // Re-enable orbit controls
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }
  };

  const undoLastTransformation = () => {
    if (undoStack.length === 0) {
      alert('No transformations to undo');
      return;
    }

    const lastState = undoStack[undoStack.length - 1];
    const model = models.find(m => m.mesh?.uuid === lastState.modelId);
    
    if (model && model.mesh) {
      console.log('Undoing transformation for model:', lastState.modelId);
      
      // Restore previous state
      model.mesh.position.copy(lastState.position);
      model.mesh.rotation.copy(lastState.rotation);
      model.mesh.scale.copy(lastState.scale);
      
      // Update matrices
      model.mesh.updateMatrix();
      model.mesh.updateMatrixWorld(true);
      
      // Remove from undo stack
      setUndoStack(prev => prev.slice(0, -1));
      
      // Force re-render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      console.log('Transformation undone successfully');
    }
  };

  // Handle keyboard events for occlusal plane selection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isSelectingOcclusalPoints) {
        if (event.key === 'Escape' || event.key === 'Backspace') {
          event.preventDefault();
          resetOcclusalSelection();
        }
      }
      
      // Undo shortcut (Ctrl+Z)
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        undoLastTransformation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelectingOcclusalPoints, undoStack]);

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
    // Handle occlusal plane tool activation
    if (activeTool === 'occlusal-plane') {
      console.log('Activating occlusal plane selection mode');
      
      // Disable orbit controls during point selection
      if (controlsRef.current) {
        controlsRef.current.enabled = false;
        console.log('Orbit controls disabled');
      }
      
      // Clear any existing selection
      resetOcclusalSelection();
      setIsSelectingOcclusalPoints(true);
      console.log('Occlusal point selection mode activated');
      
      return;
    } else if (isSelectingOcclusalPoints) {
      // Reset occlusal selection when switching tools
      console.log('Resetting occlusal selection due to tool change');
      resetOcclusalSelection();
    }
    
    if (!controlsRef.current) return;
    
    // Disable camera controls when drawing tools are active
    const isDrawingTool = activeTool && ['brush', 'pencil', 'polyline', 'bezier', 'eraser'].includes(activeTool);
    controlsRef.current.enabled = !isDrawingTool;
    
    if (isDrawingTool) {
      console.log('Drawing tool active, orbit controls disabled');
    } else {
      console.log('Orbit controls enabled');
    }
    
    if (!transformControlsRef.current) return;
    
    if (['translate', 'rotate', 'scale'].includes(activeTool || '')) {
      transformControlsRef.current.visible = true;
      console.log('Transform controls visible for tool:', activeTool);
      
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
      console.log('Transform controls hidden');
    }
  }, [activeTool, isSelectingOcclusalPoints]);
  
  // Drawing helper functions
  const startNewStroke = (point: THREE.Vector3, toolType: string) => {
    if (!sceneRef.current) return;
    
    console.log('Starting new stroke at:', point, 'with tool:', toolType);
    
    // Create new stroke group
    const strokeGroup = new THREE.Group();
    strokeGroup.userData.toolType = toolType;
    strokeGroup.userData.points = [point];
    strokeGroup.userData.settings = { ...drawingSettings };
    
    // Add to scene immediately
    sceneRef.current.add(strokeGroup);
    setAnnotations(prev => [...prev, strokeGroup]);
    setCurrentStroke(strokeGroup);
    
    // Add first point
    addPointToStroke(strokeGroup, point, toolType);
  };
  
  const continueStroke = (point: THREE.Vector3, toolType: string) => {
    if (!currentStroke) return;
    
    console.log('Continuing stroke at:', point);
    
    currentStroke.userData.points.push(point);
    addPointToStroke(currentStroke, point, toolType);
    
    // Connect points with lines for smooth drawing
    if (currentStroke.userData.points.length > 1) {
      const points = currentStroke.userData.points;
      const lastPoint = points[points.length - 2];
      connectPoints(currentStroke, lastPoint, point, toolType);
    }
  };
  
  const finishStroke = () => {
    console.log('Finishing stroke');
    setCurrentStroke(null);
  };
  
  const addPointToStroke = (strokeGroup: THREE.Group, point: THREE.Vector3, toolType: string) => {
    const size = toolType === 'brush' ? drawingSettings.brushSize : drawingSettings.pencilSize;
    const color = toolType === 'brush' ? drawingSettings.brushColor : drawingSettings.pencilColor;
    const opacity = toolType === 'brush' ? drawingSettings.brushOpacity : 1.0;
    
    console.log('Adding point to stroke:', point, 'size:', size, 'color:', color);
    
    const geometry = new THREE.SphereGeometry(size * 0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: opacity,
      depthTest: false
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(point);
    sphere.position.add(new THREE.Vector3(0, 0, 0.01)); // Slightly offset from surface
    strokeGroup.add(sphere);
  };
  
  const connectPoints = (strokeGroup: THREE.Group, point1: THREE.Vector3, point2: THREE.Vector3, toolType: string) => {
    const color = toolType === 'brush' ? drawingSettings.brushColor : drawingSettings.pencilColor;
    const width = toolType === 'brush' ? drawingSettings.brushSize * 0.05 : drawingSettings.pencilSize * 0.05;
    const opacity = toolType === 'brush' ? drawingSettings.brushOpacity : 1.0;
    
    // Create cylinder between points for smooth lines
    const direction = new THREE.Vector3().subVectors(point2, point1);
    const length = direction.length();
    
    if (length > 0) {
      const geometry = new THREE.CylinderGeometry(width, width, length, 6);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: opacity,
        depthTest: false
      });
      
      const cylinder = new THREE.Mesh(geometry, material);
      
      // Position and orient cylinder
      const midpoint = new THREE.Vector3().addVectors(point1, point2).multiplyScalar(0.5);
      cylinder.position.copy(midpoint);
      cylinder.position.add(new THREE.Vector3(0, 0, 0.01)); // Slightly offset from surface
      
      // Orient cylinder along the line
      const up = new THREE.Vector3(0, 1, 0);
      const axis = new THREE.Vector3().crossVectors(up, direction.normalize());
      const angle = Math.acos(up.dot(direction));
      
      if (axis.length() > 0) {
        cylinder.rotateOnAxis(axis.normalize(), angle);
      }
      
      strokeGroup.add(cylinder);
    }
  };
  
  const addPolylinePoint = (point: THREE.Vector3) => {
    if (!sceneRef.current) return;
    
    console.log('Adding polyline point:', point);
    
    // Add point marker
    const geometry = new THREE.SphereGeometry(drawingSettings.lineWidth * 0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(drawingSettings.lineColor),
      depthTest: false
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(point);
    sphere.position.add(new THREE.Vector3(0, 0, 0.01)); // Slightly offset from surface
    
    let polylineGroup = annotations.find(group => group.userData.toolType === 'polyline');
    if (!polylineGroup) {
      polylineGroup = new THREE.Group();
      polylineGroup.userData.toolType = 'polyline';
      polylineGroup.userData.points = [];
      sceneRef.current.add(polylineGroup);
      setAnnotations(prev => [...prev, polylineGroup!]);
    }
    
    polylineGroup.add(sphere);
    polylineGroup.userData.points.push(point);
    
    // Draw line to previous point
    if (polylineGroup.userData.points.length > 1) {
      const points = polylineGroup.userData.points;
      const point1 = points[points.length - 2].clone().add(new THREE.Vector3(0, 0, 0.01));
      const point2 = points[points.length - 1].clone().add(new THREE.Vector3(0, 0, 0.01));
      
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([point1, point2]);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(drawingSettings.lineColor),
        depthTest: false
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      polylineGroup.add(line);
    }
  };
  
  const addBezierPoint = (point: THREE.Vector3) => {
    if (!sceneRef.current) return;
    
    console.log('Adding bezier point:', point);
    
    // Add control point
    const geometry = new THREE.SphereGeometry(drawingSettings.lineWidth * 0.15, 8, 8);
    const material = new THREE.MeshBasicMaterial({ 
      color: new THREE.Color(drawingSettings.lineColor),
      depthTest: false
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(point);
    sphere.position.add(new THREE.Vector3(0, 0, 0.01)); // Slightly offset from surface
    
    let bezierGroup = annotations.find(group => group.userData.toolType === 'bezier');
    if (!bezierGroup) {
      bezierGroup = new THREE.Group();
      bezierGroup.userData.toolType = 'bezier';
      bezierGroup.userData.controlPoints = [];
      sceneRef.current.add(bezierGroup);
      setAnnotations(prev => [...prev, bezierGroup!]);
    }
    
    bezierGroup.add(sphere);
    bezierGroup.userData.controlPoints.push(point);
    
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
      // Offset curve points slightly above surface
      const offsetCurvePoints = curvePoints.map(p => p.clone().add(new THREE.Vector3(0, 0, 0.01)));
      const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const curveMaterial = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(drawingSettings.lineColor),
        depthTest: false
      });
      const curveLine = new THREE.Line(curveGeometry, curveMaterial);
      bezierGroup.add(curveLine);
    }
  };

  const eraseAtPoint = (point: THREE.Vector3) => {
    if (!sceneRef.current) return;
    
    console.log('Erasing at point:', point);
    
    const eraseRadius = drawingSettings.brushSize;
    
    // Find annotations to erase
    const groupsToCheck = [...annotations];
    groupsToCheck.forEach(group => {
      const objectsToRemove: THREE.Object3D[] = [];
      
      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.position.distanceTo(point) < eraseRadius) {
          objectsToRemove.push(child);
        }
      });
      
      // Remove objects
      objectsToRemove.forEach(obj => {
        group.remove(obj);
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          }
        }
      });
      
      // Remove empty groups
      if (group.children.length === 0) {
        sceneRef.current!.remove(group);
        setAnnotations(prev => prev.filter(g => g !== group));
      }
    });
  };

  // Update scene when models change
  useEffect(() => {
    if (!sceneRef.current || !loaderRef.current) return;

    console.log('Processing models:', models.length);

    models.forEach((model) => {
      if (model.file && !model.mesh) {
        console.log('Loading new model:', model.name);
        const reader = new FileReader();
        reader.onload = (event) => {
          console.log('File loaded, parsing STL...');
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
          
          // Make mesh interactive
          mesh.userData.modelId = model.id;
          mesh.userData.interactive = true;

          console.log('Adding mesh to scene:', mesh.uuid);
          sceneRef.current!.add(mesh);

          // Update model with mesh reference
          const updatedModels = models.map(m => 
            m.id === model.id ? { ...m, mesh } : m
          );
          console.log('Updating models with mesh reference');
          onModelsChange(updatedModels);
        };
        console.log('Reading file as ArrayBuffer...');
        reader.readAsArrayBuffer(model.file);
      } else if (model.mesh) {
        console.log('Updating existing model visibility/color:', model.name);
        model.mesh.visible = model.visible;
        (model.mesh.material as THREE.MeshStandardMaterial).color.setHex(
          parseInt(model.color.replace('#', ''), 16)
        );
        (model.mesh.material as THREE.MeshStandardMaterial).wireframe = viewportSettings.wireframe;
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
          {undoStack.length > 0 && (
            <button
              onClick={undoLastTransformation}
              className="px-3 py-1 rounded text-xs bg-yellow-600 text-white hover:bg-yellow-700 transition-colors duration-200"
              title="Undo Last Transformation (Ctrl+Z)"
            >
              Undo ({undoStack.length})
            </button>
          )}
        </div>
        
        <div className="text-slate-400 text-sm">
          {activeTool === 'move' ? 'Camera Control Mode' :
           activeTool === 'occlusal-plane' ? 
            `Occlusal Plane: Select ${3 - occlusalPoints.length} more point${3 - occlusalPoints.length !== 1 ? 's' : ''} on the model (ESC to cancel)` :
           activeTool && ['brush', 'pencil', 'polyline', 'bezier', 'eraser'].includes(activeTool) ? 
            `Drawing Tool: ${activeTool}` : 
            activeTool ? `Tool: ${activeTool}` : 'No tool selected'
          }
          {selectedModelRef.current && ['translate', 'rotate', 'scale'].includes(activeTool || '') && (
            <span className="ml-4 text-blue-400">Model Selected</span>
          )}
          {occlusalPoints.length > 0 && (
            <span className="ml-4 text-yellow-400">Points: {occlusalPoints.length}/3</span>
          )}
          {annotations.length > 0 && (
            <span className="ml-4 text-green-400">Drawings: {annotations.length}</span>
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
          <span>Editable: {models.filter(m => m.mesh?.userData.interactive).length}</span>
          {occlusalPoints.length > 0 && (
            <span>Occlusal Points: {occlusalPoints.length}/3</span>
          )}
          {undoStack.length > 0 && (
            <span>Undo Available: {undoStack.length}</span>
          )}
          {activeTool && (
            <span>Tool: {activeTool}</span>
          )}
          {editingMode && (
            <span className="text-orange-400">Editing Mode: {editingMode}</span>
          )}
          {selectedModelRef.current && (
            <span className="text-blue-400">Model Selected</span>
          )}
        </div>
        <div className="text-slate-400 text-sm">
          <span className="mr-4">Projection: {isOrthographic ? 'Orthographic' : 'Perspective'}</span>
          <span>
            {editingMode === 'cut' || editingMode === 'subtract-volume'
              ? 'Click two points on the model to define the area to cut/remove (ESC to cancel)'
              : isSelectingOcclusalPoints 
              ? 'Click 3 points on the model to set occlusal plane (ESC to cancel)'
              : 'Use mouse wheel to zoom, drag to rotate, click models to select'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default Viewport3D;