import * as THREE from 'three';

export class MeshDrawingSystem {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private isDrawing: boolean = false;
  private currentStroke: THREE.Vector3[] = [];
  private drawingMaterial: THREE.LineBasicMaterial;
  private maskMaterial: THREE.MeshBasicMaterial;
  private strokes: THREE.Line[] = [];

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    this.drawingMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });

    this.maskMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3
    });
  }

  startDrawing(event: MouseEvent, meshes: THREE.Mesh[]) {
    this.isDrawing = true;
    this.currentStroke = [];
    this.updateMousePosition(event);
    
    const intersects = this.getIntersections(meshes);
    if (intersects.length > 0) {
      this.currentStroke.push(intersects[0].point.clone());
    }
  }

  continueDrawing(event: MouseEvent, meshes: THREE.Mesh[]) {
    if (!this.isDrawing) return;
    
    this.updateMousePosition(event);
    const intersects = this.getIntersections(meshes);
    
    if (intersects.length > 0) {
      const point = intersects[0].point.clone();
      this.currentStroke.push(point);
      this.updateCurrentStrokeLine();
    }
  }

  stopDrawing() {
    if (!this.isDrawing || this.currentStroke.length < 2) {
      this.isDrawing = false;
      return;
    }

    this.finalizeStroke();
    this.isDrawing = false;
    this.currentStroke = [];
  }

  private updateMousePosition(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private getIntersections(meshes: THREE.Mesh[]): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(meshes);
  }

  private updateCurrentStrokeLine() {
    // Remove previous temporary line
    const tempLines = this.scene.children.filter(child => 
      child.userData.isTemporaryStroke
    );
    tempLines.forEach(line => this.scene.remove(line));

    if (this.currentStroke.length < 2) return;

    const geometry = new THREE.BufferGeometry().setFromPoints(this.currentStroke);
    const line = new THREE.Line(geometry, this.drawingMaterial);
    line.userData.isTemporaryStroke = true;
    this.scene.add(line);
  }

  private finalizeStroke() {
    // Remove temporary line
    const tempLines = this.scene.children.filter(child => 
      child.userData.isTemporaryStroke
    );
    tempLines.forEach(line => this.scene.remove(line));

    // Create final stroke
    const geometry = new THREE.BufferGeometry().setFromPoints(this.currentStroke);
    const line = new THREE.Line(geometry, this.drawingMaterial);
    line.userData.isStroke = true;
    this.scene.add(line);
    this.strokes.push(line);
  }

  createMaskBrush(center: THREE.Vector3, radius: number, normal: THREE.Vector3) {
    const geometry = new THREE.CircleGeometry(radius, 16);
    const mask = new THREE.Mesh(geometry, this.maskMaterial);
    
    // Orient the mask to the surface normal
    mask.position.copy(center);
    mask.lookAt(center.clone().add(normal));
    
    mask.userData.isMask = true;
    this.scene.add(mask);
    
    return mask;
  }

  clearStrokes() {
    this.strokes.forEach(stroke => this.scene.remove(stroke));
    this.strokes = [];
    
    // Remove all drawing-related objects
    const drawingObjects = this.scene.children.filter(child => 
      child.userData.isStroke || child.userData.isMask || child.userData.isTemporaryStroke
    );
    drawingObjects.forEach(obj => this.scene.remove(obj));
  }

  getStrokes(): THREE.Line[] {
    return [...this.strokes];
  }
}

export class TextOnMesh {
  private scene: THREE.Scene;
  private loader: THREE.FontLoader;
  private font: THREE.Font | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.loader = new THREE.FontLoader();
    this.loadFont();
  }

  private loadFont() {
    // Load a default font - in production, you'd load from a font file
    // For now, we'll create a simple text geometry
    this.font = null; // Will be loaded asynchronously
  }

  createTextGeometry(
    text: string, 
    position: THREE.Vector3, 
    normal: THREE.Vector3,
    options: {
      size: number;
      depth: number;
      font: string;
      emboss: boolean;
    }
  ): THREE.Mesh | null {
    if (!this.font) {
      console.warn('Font not loaded yet');
      return null;
    }

    const textGeometry = new THREE.TextGeometry(text, {
      font: this.font,
      size: options.size,
      height: options.emboss ? options.depth : -options.depth,
      curveSegments: 12,
      bevelEnabled: false
    });

    const material = new THREE.MeshStandardMaterial({
      color: options.emboss ? 0x4444ff : 0xff4444,
      metalness: 0.1,
      roughness: 0.3
    });

    const textMesh = new THREE.Mesh(textGeometry, material);
    textMesh.position.copy(position);
    textMesh.lookAt(position.clone().add(normal));
    
    textMesh.userData.isText = true;
    textMesh.userData.textContent = text;
    textMesh.userData.textOptions = options;

    this.scene.add(textMesh);
    return textMesh;
  }

  removeText(textMesh: THREE.Mesh) {
    this.scene.remove(textMesh);
    textMesh.geometry.dispose();
    if (Array.isArray(textMesh.material)) {
      textMesh.material.forEach(mat => mat.dispose());
    } else {
      textMesh.material.dispose();
    }
  }
}