export interface STLModel {
  id: string;
  name: string;
  type: 'upper' | 'lower';
  mesh?: THREE.Mesh;
  visible: boolean;
  color: string;
  file?: File;
}

export interface Tool {
  id: string;
  name: string;
  icon: string;
  category: 'edit' | 'draw' | 'measure' | 'boolean';
  active: boolean;
}

export interface ViewportSettings {
  showGrid: boolean;
  backgroundColor: string;
  lightIntensity: number;
}

export interface ToothModel {
  id: string;
  name: string;
  category: string;
  filePath: string;
  thumbnailPath: string;
  snapSettings: {
    autoSnap: boolean;
    snapDistance: number;
  };
}

export interface ProjectSettings {
  spacer: number; // mm
  thickness: number; // mm
  taperAngle: number; // degrees
  blockoutColor: string;
}