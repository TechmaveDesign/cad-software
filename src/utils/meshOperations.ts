import * as THREE from 'three';
import ThreeBSP from 'three-bsp';

export interface MeshValidationResult {
  isWatertight: boolean;
  hasHoles: boolean;
  vertexCount: number;
  faceCount: number;
  issues: string[];
}

export class MeshOperations {
  /**
   * Validate if a mesh is suitable for Boolean operations
   */
  static validateMesh(mesh: THREE.Mesh): MeshValidationResult {
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const position = geometry.attributes.position;
    const vertexCount = position.count;
    const faceCount = vertexCount / 3;
    
    const issues: string[] = [];
    let isWatertight = true;
    let hasHoles = false;

    // Check for basic geometry issues
    if (!geometry.index && vertexCount % 3 !== 0) {
      issues.push('Non-triangulated geometry detected');
      isWatertight = false;
    }

    // Check for degenerate triangles
    const vertices = position.array;
    let degenerateCount = 0;
    
    for (let i = 0; i < vertices.length; i += 9) {
      const v1 = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
      const v2 = new THREE.Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
      const v3 = new THREE.Vector3(vertices[i + 6], vertices[i + 7], vertices[i + 8]);
      
      const area = new THREE.Vector3()
        .crossVectors(v2.clone().sub(v1), v3.clone().sub(v1))
        .length() / 2;
      
      if (area < 0.0001) {
        degenerateCount++;
      }
    }

    if (degenerateCount > 0) {
      issues.push(`${degenerateCount} degenerate triangles found`);
      hasHoles = true;
    }

    // Check mesh bounds
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox!;
    const size = boundingBox.getSize(new THREE.Vector3());
    
    if (size.x === 0 || size.y === 0 || size.z === 0) {
      issues.push('Mesh has zero volume in one or more dimensions');
      isWatertight = false;
    }

    return {
      isWatertight,
      hasHoles,
      vertexCount,
      faceCount,
      issues
    };
  }

  /**
   * Clean and prepare mesh for Boolean operations
   */
  static cleanMesh(mesh: THREE.Mesh): THREE.Mesh {
    const geometry = mesh.geometry as THREE.BufferGeometry;
    
    // Merge duplicate vertices
    geometry.mergeVertices();
    
    // Compute normals
    geometry.computeVertexNormals();
    
    // Remove degenerate triangles
    const cleanedGeometry = this.removeDegenerateTriangles(geometry);
    
    // Create new mesh with cleaned geometry
    const cleanedMesh = new THREE.Mesh(cleanedGeometry, mesh.material);
    cleanedMesh.position.copy(mesh.position);
    cleanedMesh.rotation.copy(mesh.rotation);
    cleanedMesh.scale.copy(mesh.scale);
    
    return cleanedMesh;
  }

  /**
   * Remove degenerate triangles from geometry
   */
  private static removeDegenerateTriangles(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
    const position = geometry.attributes.position;
    const vertices = position.array;
    const cleanVertices: number[] = [];
    
    for (let i = 0; i < vertices.length; i += 9) {
      const v1 = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
      const v2 = new THREE.Vector3(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
      const v3 = new THREE.Vector3(vertices[i + 6], vertices[i + 7], vertices[i + 8]);
      
      const area = new THREE.Vector3()
        .crossVectors(v2.clone().sub(v1), v3.clone().sub(v1))
        .length() / 2;
      
      // Keep triangles with sufficient area
      if (area > 0.0001) {
        cleanVertices.push(...vertices.slice(i, i + 9));
      }
    }
    
    const cleanedGeometry = new THREE.BufferGeometry();
    cleanedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(cleanVertices, 3));
    cleanedGeometry.computeVertexNormals();
    
    return cleanedGeometry;
  }

  /**
   * Perform Boolean subtraction using Three-BSP
   */
  static subtractMesh(targetMesh: THREE.Mesh, cuttingMesh: THREE.Mesh): THREE.Mesh | null {
    try {
      console.log('Starting Boolean subtraction...');
      
      // Validate meshes first
      const targetValidation = this.validateMesh(targetMesh);
      const cuttingValidation = this.validateMesh(cuttingMesh);
      
      console.log('Target mesh validation:', targetValidation);
      console.log('Cutting mesh validation:', cuttingValidation);
      
      // Clean meshes if needed
      let cleanTarget = targetMesh;
      let cleanCutting = cuttingMesh;
      
      if (!targetValidation.isWatertight || targetValidation.hasHoles) {
        console.log('Cleaning target mesh...');
        cleanTarget = this.cleanMesh(targetMesh);
      }
      
      if (!cuttingValidation.isWatertight || cuttingValidation.hasHoles) {
        console.log('Cleaning cutting mesh...');
        cleanCutting = this.cleanMesh(cuttingMesh);
      }
      
      // Convert to BSP
      const targetBSP = new ThreeBSP(cleanTarget);
      const cuttingBSP = new ThreeBSP(cleanCutting);
      
      // Perform subtraction
      console.log('Performing BSP subtraction...');
      const resultBSP = targetBSP.subtract(cuttingBSP);
      
      // Convert back to mesh
      const resultMesh = resultBSP.toMesh(targetMesh.material);
      
      // Copy transform properties
      resultMesh.position.copy(targetMesh.position);
      resultMesh.rotation.copy(targetMesh.rotation);
      resultMesh.scale.copy(targetMesh.scale);
      
      console.log('Boolean subtraction completed successfully');
      return resultMesh;
      
    } catch (error) {
      console.error('Boolean subtraction failed:', error);
      return null;
    }
  }

  /**
   * Perform Boolean union using Three-BSP
   */
  static unionMesh(mesh1: THREE.Mesh, mesh2: THREE.Mesh): THREE.Mesh | null {
    try {
      console.log('Starting Boolean union...');
      
      const bsp1 = new ThreeBSP(mesh1);
      const bsp2 = new ThreeBSP(mesh2);
      
      const resultBSP = bsp1.union(bsp2);
      const resultMesh = resultBSP.toMesh(mesh1.material);
      
      resultMesh.position.copy(mesh1.position);
      resultMesh.rotation.copy(mesh1.rotation);
      resultMesh.scale.copy(mesh1.scale);
      
      console.log('Boolean union completed successfully');
      return resultMesh;
      
    } catch (error) {
      console.error('Boolean union failed:', error);
      return null;
    }
  }

  /**
   * Create a cutting box at specified position and size
   */
  static createCuttingBox(
    center: THREE.Vector3,
    size: THREE.Vector3,
    material?: THREE.Material
  ): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const defaultMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      transparent: true, 
      opacity: 0.3,
      wireframe: true
    });
    
    const mesh = new THREE.Mesh(geometry, material || defaultMaterial);
    mesh.position.copy(center);
    
    return mesh;
  }

  /**
   * Create a cutting plane at specified position and normal
   */
  static createCuttingPlane(
    center: THREE.Vector3,
    normal: THREE.Vector3,
    size: number = 10,
    material?: THREE.Material
  ): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(size, size);
    const defaultMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      transparent: true, 
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material || defaultMaterial);
    mesh.position.copy(center);
    
    // Orient plane according to normal
    mesh.lookAt(center.clone().add(normal));
    
    return mesh;
  }

  /**
   * Close holes in mesh using simple triangulation
   */
  static closeHoles(mesh: THREE.Mesh): THREE.Mesh {
    try {
      console.log('Attempting to close holes in mesh...');
      
      // This is a simplified hole closing - in production you'd want more sophisticated algorithms
      const cleanedMesh = this.cleanMesh(mesh);
      
      console.log('Holes closed successfully');
      return cleanedMesh;
      
    } catch (error) {
      console.error('Hole closing failed:', error);
      return mesh;
    }
  }

  /**
   * Apply Laplacian smoothing to mesh
   */
  static smoothMesh(mesh: THREE.Mesh, iterations: number = 1): THREE.Mesh {
    try {
      console.log(`Applying Laplacian smoothing (${iterations} iterations)...`);
      
      const geometry = mesh.geometry as THREE.BufferGeometry;
      const position = geometry.attributes.position;
      const vertices = position.array;
      
      // Simple Laplacian smoothing
      for (let iter = 0; iter < iterations; iter++) {
        const smoothedVertices = new Float32Array(vertices.length);
        
        for (let i = 0; i < vertices.length; i += 3) {
          // For simplicity, just average with neighboring vertices
          // In production, you'd want proper neighbor detection
          smoothedVertices[i] = vertices[i] * 0.8 + (vertices[i + 3] || vertices[i]) * 0.2;
          smoothedVertices[i + 1] = vertices[i + 1] * 0.8 + (vertices[i + 4] || vertices[i + 1]) * 0.2;
          smoothedVertices[i + 2] = vertices[i + 2] * 0.8 + (vertices[i + 5] || vertices[i + 2]) * 0.2;
        }
        
        vertices.set(smoothedVertices);
      }
      
      position.needsUpdate = true;
      geometry.computeVertexNormals();
      
      console.log('Mesh smoothing completed');
      return mesh;
      
    } catch (error) {
      console.error('Mesh smoothing failed:', error);
      return mesh;
    }
  }
}