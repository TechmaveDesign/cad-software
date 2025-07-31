import * as THREE from 'three';

export interface DrawingPoint {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  uv: THREE.Vector2;
  face: THREE.Face3 | null;
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
  }

  private createCursor(): void {
    const geometry = new THREE.RingGeometry(0.5, 1, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthTest: false
    });
    
    this.cursorMesh = new THREE.Mesh(geometry, material);
    this.cursorMesh.visible = false;
    this.scene.add(this.cursorMesh);
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
      this.cursorMesh.lookAt(intersect.point.clone().add(intersect.face?.normal || new THREE.Vector3(0, 0, 1)));
      
      // Update cursor size based on tool
      const scale = toolType === 'brush' ? brushSize * 0.5 : brushSize * 0.2;
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
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(models);

    if (intersects.length === 0) return false;

    const intersect = intersects[0];
    const drawingPoint: DrawingPoint = {
      position: intersect.point.clone(),
      normal: intersect.face?.normal?.clone() || new THREE.Vector3(0, 0, 1),
      uv: intersect.uv || new THREE.Vector2(),
      face: intersect.face || null,
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

    // Handle different tool types
    switch (toolType) {
      case 'brush':
      case 'pencil':
        this.createContinuousStroke(this.currentStroke);
        break;
      case 'polyline':
        this.addPolylinePoint(drawingPoint);
        break;
      case 'bezier':
        this.addBezierPoint(drawingPoint);
        break;
      case 'mask':
        this.startMaskArea(drawingPoint, settings);
        break;
      case 'eraser':
        this.eraseAtPoint(drawingPoint, settings);
        break;
    }

    console.log(`Started drawing with ${toolType} at:`, drawingPoint.position);
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
    const drawingPoint: DrawingPoint = {
      position: intersect.point.clone(),
      normal: intersect.face?.normal?.clone() || new THREE.Vector3(0, 0, 1),
      uv: intersect.uv || new THREE.Vector2(),
      face: intersect.face || null,
      timestamp: Date.now()
    };

    // Only add point if it's far enough from the last point (smoothing)
    const lastPoint = this.currentStroke.points[this.currentStroke.points.length - 1];
    const distance = drawingPoint.position.distanceTo(lastPoint.position);
    const minDistance = this.currentStroke.type === 'brush' ? 0.5 : 0.2;

    if (distance > minDistance) {
      this.currentStroke.points.push(drawingPoint);
      this.updateContinuousStroke(this.currentStroke);
    }
  }

  public finishDrawing(): void {
    if (!this.currentStroke) return;

    this.currentStroke.completed = true;
    this.strokes.set(this.currentStroke.id, this.currentStroke);
    
    // Save to history for undo/redo
    this.saveToHistory();
    
    console.log(`Finished drawing stroke ${this.currentStroke.id} with ${this.currentStroke.points.length} points`);
    
    this.currentStroke = null;
    this.isDrawing = false;
  }

  private createContinuousStroke(stroke: DrawingStroke): void {
    const points = stroke.points.map(p => p.position);
    
    if (stroke.type === 'brush') {
      this.createBrushStroke(stroke, points);
    } else if (stroke.type === 'pencil') {
      this.createPencilStroke(stroke, points);
    }
  }

  private updateContinuousStroke(stroke: DrawingStroke): void {
    if (stroke.mesh) {
      this.drawingGroup.remove(stroke.mesh);
      stroke.mesh = undefined;
    }
    this.createContinuousStroke(stroke);
  }

  private createBrushStroke(stroke: DrawingStroke, points: THREE.Vector3[]): void {
    if (points.length < 2) return;

    // Create brush stroke using BufferGeometry for compatibility
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(stroke.settings.brushColor),
      transparent: true,
      opacity: stroke.settings.brushOpacity,
      linewidth: stroke.settings.brushSize,
      depthTest: false
    });

    const mesh = new THREE.Line(geometry, material);
    mesh.userData.strokeId = stroke.id;
    mesh.userData.strokeType = 'brush';
    
    this.drawingGroup.add(mesh);
    stroke.mesh = mesh;
  }

  private createPencilStroke(stroke: DrawingStroke, points: THREE.Vector3[]): void {
    if (points.length < 2) return;

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(stroke.settings.pencilColor),
      linewidth: stroke.settings.pencilSize || 1,
      transparent: true,
      depthTest: false
    });

    const line = new THREE.Line(geometry, material);
    line.userData.strokeId = stroke.id;
    line.userData.strokeType = 'pencil';
    
    this.drawingGroup.add(line);
    stroke.mesh = line;
  }

  private addPolylinePoint(point: DrawingPoint): void {
    // Find existing polyline or create new one
    let polylineStroke = Array.from(this.strokes.values()).find(s => s.type === 'polyline' && !s.completed);
    
    if (!polylineStroke) {
      polylineStroke = {
        id: `polyline_${Date.now()}`,
        type: 'polyline',
        points: [],
        settings: this.currentStroke?.settings || {},
        completed: false
      };
      this.strokes.set(polylineStroke.id, polylineStroke);
    }

    polylineStroke.points.push(point);
    this.updatePolyline(polylineStroke);
  }

  private updatePolyline(stroke: DrawingStroke): void {
    if (stroke.mesh) {
      this.drawingGroup.remove(stroke.mesh);
    }

    const points = stroke.points.map(p => p.position);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(stroke.settings.lineColor || '#0000ff'),
      linewidth: stroke.settings.lineWidth || 1,
      transparent: true,
      depthTest: false
    });

    const line = new THREE.Line(geometry, material);
    line.userData.strokeId = stroke.id;
    line.userData.strokeType = 'polyline';
    
    this.drawingGroup.add(line);
    stroke.mesh = line;

    // Add point markers
    stroke.points.forEach((point, index) => {
      const markerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        depthTest: false
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(point.position);
      this.drawingGroup.add(marker);
    });
  }

  private addBezierPoint(point: DrawingPoint): void {
    // Similar to polyline but creates bezier curves
    let bezierStroke = Array.from(this.strokes.values()).find(s => s.type === 'bezier' && !s.completed);
    
    if (!bezierStroke) {
      bezierStroke = {
        id: `bezier_${Date.now()}`,
        type: 'bezier',
        points: [],
        settings: this.currentStroke?.settings || {},
        completed: false
      };
      this.strokes.set(bezierStroke.id, bezierStroke);
    }

    bezierStroke.points.push(point);
    
    if (bezierStroke.points.length >= 4) {
      this.updateBezierCurve(bezierStroke);
    }
  }

  private updateBezierCurve(stroke: DrawingStroke): void {
    if (stroke.mesh) {
      this.drawingGroup.remove(stroke.mesh);
    }

    const points = stroke.points.map(p => p.position);
    
    // Create bezier curve from last 4 points
    const p0 = points[points.length - 4];
    const p1 = points[points.length - 3];
    const p2 = points[points.length - 2];
    const p3 = points[points.length - 1];

    const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
    const curvePoints = curve.getPoints(50);

    const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(stroke.settings.lineColor || '#0000ff'),
      linewidth: stroke.settings.lineWidth || 1,
      transparent: true,
      depthTest: false
    });

    const line = new THREE.Line(geometry, material);
    line.userData.strokeId = stroke.id;
    line.userData.strokeType = 'bezier';
    
    this.drawingGroup.add(line);
    stroke.mesh = line;
  }

  private startMaskArea(point: DrawingPoint, settings: any): void {
    // Create mask visualization
    const radius = settings.brushSize || 2;
    const geometry = new THREE.CircleGeometry(radius, 32);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(settings.brushColor || '#ff0000'),
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthTest: false
    });

    const mask = new THREE.Mesh(geometry, material);
    mask.position.copy(point.position);
    mask.lookAt(point.position.clone().add(point.normal));
    mask.userData.strokeId = this.currentStroke!.id;
    mask.userData.strokeType = 'mask';
    
    this.drawingGroup.add(mask);
    this.currentStroke!.mesh = mask;
  }

  private eraseAtPoint(point: DrawingPoint, settings: any): void {
    const eraseRadius = settings.brushSize || 2;
    const strokesToRemove: string[] = [];

    // Find strokes within erase radius
    this.strokes.forEach((stroke, id) => {
      if (stroke.type === 'eraser') return; // Don't erase eraser strokes
      
      const hasPointsInRadius = stroke.points.some(p => 
        p.position.distanceTo(point.position) < eraseRadius
      );

      if (hasPointsInRadius) {
        if (stroke.mesh) {
          this.drawingGroup.remove(stroke.mesh);
        }
        strokesToRemove.push(id);
      }
    });

    // Remove erased strokes
    strokesToRemove.forEach(id => {
      this.strokes.delete(id);
    });

    console.log(`Erased ${strokesToRemove.length} strokes at:`, point.position);
  }

  public clearAllStrokes(): void {
    this.strokes.forEach(stroke => {
      if (stroke.mesh) {
        this.drawingGroup.remove(stroke.mesh);
      }
    });
    this.strokes.clear();
    this.saveToHistory();
    console.log('Cleared all drawing strokes');
  }

  public undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreFromHistory();
      console.log('Undo drawing action');
    }
  }

  public redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.restoreFromHistory();
      console.log('Redo drawing action');
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
      }
    });
    this.strokes.clear();

    // Restore from history
    const historyState = this.history[this.historyIndex];
    historyState.forEach(stroke => {
      this.strokes.set(stroke.id, stroke);
      // Recreate mesh based on stroke type
      if (stroke.type === 'brush' || stroke.type === 'pencil') {
        this.createContinuousStroke(stroke);
      } else if (stroke.type === 'polyline') {
        this.updatePolyline(stroke);
      } else if (stroke.type === 'bezier') {
        this.updateBezierCurve(stroke);
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
    if (this.cursorMesh) {
      this.scene.remove(this.cursorMesh);
    }
    this.scene.remove(this.drawingGroup);
    this.strokes.clear();
    this.history = [];
  }
}