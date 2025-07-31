import * as THREE from 'three';

export interface DrawingPoint {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  uv: THREE.Vector2;
  timestamp: number;
}

export interface DrawingStroke {
  id: string;
  type: 'brush' | 'pencil' | 'polyline' | 'bezier' | 'mask' | 'eraser';
  points: DrawingPoint[];
  settings: any;
  mesh?: THREE.Mesh | THREE.Line;
  completed: boolean;
}

export class DrawingSystem {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private strokes: Map<string, DrawingStroke> = new Map();
  private currentStroke: DrawingStroke | null = null;
  private isDrawing: boolean = false;
  private drawingGroup: THREE.Group;
  private cursorMesh: THREE.Mesh | null = null;
  private history: DrawingStroke[][] = [];
  private historyIndex: number = -1;

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Create drawing group
    this.drawingGroup = new THREE.Group();
    this.drawingGroup.name = 'DrawingGroup';
    this.scene.add(this.drawingGroup);
    
    this.createCursor();
    console.log('DrawingSystem: Custom drawing system initialized');
  }

  private createCursor(): void {
    const geometry = new THREE.RingGeometry(0.5, 1, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthTest: false
    });
    
    this.cursorMesh = new THREE.Mesh(geometry, material);
    this.cursorMesh.visible = false;
    this.cursorMesh.renderOrder = 1000;
    this.scene.add(this.cursorMesh);
    console.log('DrawingSystem: Cursor created');
  }

  public updateCursor(event: MouseEvent, canvas: HTMLElement, models: THREE.Mesh[], toolType: string, brushSize: number): void {
    if (!this.cursorMesh) return;

    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(models);

    if (intersects.length > 0) {
      const intersect = intersects[0];
      
      this.cursorMesh.position.copy(intersect.point);
      
      // Orient cursor to surface normal
      if (intersect.face && intersect.face.normal) {
        const normal = intersect.face.normal.clone();
        normal.transformDirection(intersect.object.matrixWorld);
        this.cursorMesh.lookAt(intersect.point.clone().add(normal));
      }
      
      // Update cursor size and color based on tool
      const scale = toolType === 'brush' ? brushSize * 0.3 : brushSize * 0.2;
      this.cursorMesh.scale.setScalar(scale);
      this.cursorMesh.visible = true;

      // Update cursor color based on tool
      const material = this.cursorMesh.material as THREE.MeshBasicMaterial;
      switch (toolType) {
        case 'brush':
          material.color.setHex(0xff0000);
          break;
        case 'pencil':
          material.color.setHex(0x00ff00);
          break;
        case 'eraser':
          material.color.setHex(0xffffff);
          break;
        default:
          material.color.setHex(0x0000ff);
      }
    } else {
      this.cursorMesh.visible = false;
    }
  }

  public startDrawing(event: MouseEvent, canvas: HTMLElement, models: THREE.Mesh[], toolType: string, settings: any): boolean {
    console.log('DrawingSystem: Starting custom drawing with tool:', toolType);
    console.log('DrawingSystem: Available models for drawing:', models.length);
    
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    console.log('DrawingSystem: Mouse coordinates:', this.mouse.x.toFixed(3), this.mouse.y.toFixed(3));
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(models);

    console.log('DrawingSystem: Intersections found:', intersects.length);
    
    if (intersects.length === 0) {
      console.log('DrawingSystem: No intersections - cannot start drawing');
      return false;
    }

    const intersect = intersects[0];
    console.log('DrawingSystem: Intersection point:', intersect.point);
    
    // Transform intersection point to world coordinates
    const worldPoint = intersect.point.clone();
    const worldNormal = intersect.face?.normal?.clone() || new THREE.Vector3(0, 0, 1);
    worldNormal.transformDirection(intersect.object.matrixWorld);
    
    const drawingPoint: DrawingPoint = {
      position: worldPoint,
      normal: worldNormal,
      uv: intersect.uv || new THREE.Vector2(),
      timestamp: Date.now()
    };

    this.currentStroke = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: toolType as any,
      points: [drawingPoint],
      settings: { ...settings },
      completed: false
    };

    this.isDrawing = true;
    console.log('DrawingSystem: Created stroke:', this.currentStroke.id);

    // Start drawing based on tool type
    if (toolType === 'pencil') {
      this.createCustomPencilStroke(this.currentStroke);
    }

    return true;
  }

  public continueDrawing(event: MouseEvent, canvas: HTMLElement, models: THREE.Mesh[]): void {
    if (!this.isDrawing || !this.currentStroke) return;

    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(models);
    
    if (intersects.length === 0) return;

    const intersect = intersects[0];
    
    // Transform intersection point to world coordinates
    const worldPoint = intersect.point.clone();
    const worldNormal = intersect.face?.normal?.clone() || new THREE.Vector3(0, 0, 1);
    worldNormal.transformDirection(intersect.object.matrixWorld);
    
    const drawingPoint: DrawingPoint = {
      position: worldPoint,
      normal: worldNormal,
      uv: intersect.uv || new THREE.Vector2(),
      timestamp: Date.now()
    };

    // Check distance from last point for smoothing
    const lastPoint = this.currentStroke.points[this.currentStroke.points.length - 1];
    const distance = drawingPoint.position.distanceTo(lastPoint.position);
    const minDistance = 0.1; // Very small for smooth lines

    if (distance > minDistance) {
      this.currentStroke.points.push(drawingPoint);
      
      if (this.currentStroke.type === 'pencil') {
        this.updateCustomPencilStroke(this.currentStroke);
      }
      
      console.log('DrawingSystem: Added point, total points:', this.currentStroke.points.length);
    }
  }

  public finishDrawing(): void {
    if (!this.currentStroke) return;

    this.currentStroke.completed = true;
    this.strokes.set(this.currentStroke.id, this.currentStroke);
    
    // Save to history for undo/redo
    this.saveToHistory();
    
    console.log('DrawingSystem: Finished drawing stroke:', this.currentStroke.id, 'with', this.currentStroke.points.length, 'points');
    
    this.currentStroke = null;
    this.isDrawing = false;
  }

  private createCustomPencilStroke(stroke: DrawingStroke): void {
    if (stroke.points.length < 1) return;

    console.log('DrawingSystem: Creating custom pencil stroke with', stroke.points.length, 'points');
    
    // Create initial line with first point
    const points = stroke.points.map(p => p.position);
    this.createSmoothLine(stroke, points);
  }

  private updateCustomPencilStroke(stroke: DrawingStroke): void {
    // Remove old mesh
    if (stroke.mesh) {
      this.drawingGroup.remove(stroke.mesh);
      if (stroke.mesh.geometry) stroke.mesh.geometry.dispose();
      if (stroke.mesh.material) {
        if (Array.isArray(stroke.mesh.material)) {
          stroke.mesh.material.forEach(mat => mat.dispose());
        } else {
          stroke.mesh.material.dispose();
        }
      }
      stroke.mesh = undefined;
    }

    // Create new mesh with all points
    const points = stroke.points.map(p => p.position);
    this.createSmoothLine(stroke, points);
  }

  private createSmoothLine(stroke: DrawingStroke, points: THREE.Vector3[]): void {
    if (points.length < 2) return;

    console.log('DrawingSystem: Creating smooth line with', points.length, 'points');

    // Create smooth curve through points using CatmullRom
    let curve: THREE.CatmullRomCurve3;
    
    if (points.length === 2) {
      // For 2 points, create a simple line
      curve = new THREE.CatmullRomCurve3(points);
    } else {
      // For multiple points, create smooth curve
      curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
    }

    // Get smooth points from curve
    const curvePoints = curve.getPoints(Math.max(50, points.length * 10));
    
    // Create tube geometry for better visibility
    const tubeGeometry = new THREE.TubeGeometry(
      curve,
      Math.max(20, points.length * 5), // segments
      Math.max(0.05, (stroke.settings.pencilSize || 1.0) * 0.1), // radius
      8, // radial segments
      false // closed
    );

    // Create material
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(stroke.settings.pencilColor || '#00ff00'),
      transparent: false,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: true
    });

    // Create mesh
    const mesh = new THREE.Mesh(tubeGeometry, material);
    mesh.userData.strokeId = stroke.id;
    mesh.userData.strokeType = 'pencil';
    mesh.renderOrder = 100; // Render on top
    
    console.log('DrawingSystem: Adding custom pencil mesh to scene');
    this.drawingGroup.add(mesh);
    stroke.mesh = mesh;
  }

  public clearAllStrokes(): void {
    console.log('DrawingSystem: Clearing all strokes');
    this.strokes.forEach(stroke => {
      if (stroke.mesh) {
        this.drawingGroup.remove(stroke.mesh);
        if (stroke.mesh.geometry) stroke.mesh.geometry.dispose();
        if (stroke.mesh.material) {
          if (Array.isArray(stroke.mesh.material)) {
            stroke.mesh.material.forEach(mat => mat.dispose());
          } else {
            stroke.mesh.material.dispose();
          }
        }
      }
    });
    this.strokes.clear();
    this.saveToHistory();
  }

  public undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreFromHistory();
      console.log('DrawingSystem: Undo action');
    }
  }

  public redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreFromHistory();
      console.log('DrawingSystem: Redo action');
    }
  }

  private saveToHistory(): void {
    const currentState = Array.from(this.strokes.values()).map(stroke => ({ ...stroke }));
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(currentState);
    this.historyIndex = this.history.length - 1;
  }

  private restoreFromHistory(): void {
    if (this.historyIndex < 0 || this.historyIndex >= this.history.length) return;

    // Clear current strokes
    this.strokes.forEach(stroke => {
      if (stroke.mesh) {
        this.drawingGroup.remove(stroke.mesh);
        if (stroke.mesh.geometry) stroke.mesh.geometry.dispose();
        if (stroke.mesh.material) {
          if (Array.isArray(stroke.mesh.material)) {
            stroke.mesh.material.forEach(mat => mat.dispose());
          } else {
            stroke.mesh.material.dispose();
          }
        }
      }
    });
    this.strokes.clear();

    // Restore from history
    const historyState = this.history[this.historyIndex];
    historyState.forEach(stroke => {
      this.strokes.set(stroke.id, stroke);
      if (stroke.type === 'pencil' && stroke.points.length > 0) {
        const points = stroke.points.map(p => p.position);
        this.createSmoothLine(stroke, points);
      }
    });
  }

  public hideCursor(): void {
    if (this.cursorMesh) {
      this.cursorMesh.visible = false;
    }
  }

  public getStrokeCount(): number {
    return this.strokes.size;
  }

  public dispose(): void {
    console.log('DrawingSystem: Disposing drawing system');
    
    // Clean up cursor
    if (this.cursorMesh) {
      this.scene.remove(this.cursorMesh);
      if (this.cursorMesh.geometry) this.cursorMesh.geometry.dispose();
      if (this.cursorMesh.material) this.cursorMesh.material.dispose();
    }
    
    // Clean up all strokes
    this.strokes.forEach(stroke => {
      if (stroke.mesh) {
        if (stroke.mesh.geometry) stroke.mesh.geometry.dispose();
        if (stroke.mesh.material) {
          if (Array.isArray(stroke.mesh.material)) {
            stroke.mesh.material.forEach(mat => mat.dispose());
          } else {
            stroke.mesh.material.dispose();
          }
        }
      }
    });
    
    // Remove drawing group
    this.scene.remove(this.drawingGroup);
    this.strokes.clear();
    this.history = [];
  }
}