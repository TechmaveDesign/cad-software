import * as THREE from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';

// Extend THREE.BufferGeometry to include BVH methods
declare module 'three' {
  interface BufferGeometry {
    computeBoundsTree: typeof computeBoundsTree;
    disposeBoundsTree: typeof disposeBoundsTree;
  }
  interface Mesh {
    raycast: typeof acceleratedRaycast;
  }
}

// Add BVH methods to THREE.js prototypes
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export interface CutLine {
  points: THREE.Vector3[];
  normal: THREE.Vector3;
}

export class CuttingSystem {
  private scene: THREE.Scene;
  private cutPreviewMesh: THREE.Mesh | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public prepareMeshForCutting(mesh: THREE.Mesh): void {
    if (mesh.geometry instanceof THREE.BufferGeometry) {
      // Compute BVH for fast intersection testing
      mesh.geometry.computeBoundsTree();
      console.log('Mesh prepared for cutting with BVH acceleration');
    }
  }

  public previewCut(mesh: THREE.Mesh, cutLine: CutLine): void {
    this.clearCutPreview();

    // Create cut plane visualization
    const planeGeometry = new THREE.PlaneGeometry(50, 50);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthTest: false
    });

    this.cutPreviewMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    
    // Position plane based on cut line
    if (cutLine.points.length >= 2) {
      const center = new THREE.Vector3();
      cutLine.points.forEach(point => center.add(point));
      center.divideScalar(cutLine.points.length);
      
      this.cutPreviewMesh.position.copy(center);
      this.cutPreviewMesh.lookAt(center.clone().add(cutLine.normal));
    }

    this.scene.add(this.cutPreviewMesh);
  }

  public cutMeshAlongLine(mesh: THREE.Mesh, cutLine: CutLine): { upperPart: THREE.Mesh | null, lowerPart: THREE.Mesh | null } {
    if (!mesh.geometry || cutLine.points.length < 2) {
      console.warn('Invalid mesh or cut line for cutting operation');
      return { upperPart: null, lowerPart: null };
    }

    try {
      // Create cutting plane
      const plane = this.createCuttingPlane(cutLine);
      
      // Perform the cut using CSG-like operations
      const { upperGeometry, lowerGeometry } = this.splitGeometryByPlane(mesh.geometry as THREE.BufferGeometry, plane);
      
      let upperPart: THREE.Mesh | null = null;
      let lowerPart: THREE.Mesh | null = null;

      if (upperGeometry) {
        const upperMaterial = (mesh.material as THREE.Material).clone();
        upperPart = new THREE.Mesh(upperGeometry, upperMaterial);
        upperPart.position.copy(mesh.position);
        upperPart.rotation.copy(mesh.rotation);
        upperPart.scale.copy(mesh.scale);
        upperPart.userData.originalMesh = mesh.uuid;
        upperPart.userData.cutPart = 'upper';
      }

      if (lowerGeometry) {
        const lowerMaterial = (mesh.material as THREE.Material).clone();
        lowerPart = new THREE.Mesh(lowerGeometry, lowerMaterial);
        lowerPart.position.copy(mesh.position);
        lowerPart.rotation.copy(mesh.rotation);
        lowerPart.scale.copy(mesh.scale);
        lowerPart.userData.originalMesh = mesh.uuid;
        lowerPart.userData.cutPart = 'lower';
      }

      console.log('Mesh cut successfully');
      return { upperPart, lowerPart };

    } catch (error) {
      console.error('Error cutting mesh:', error);
      return { upperPart: null, lowerPart: null };
    }
  }

  private createCuttingPlane(cutLine: CutLine): THREE.Plane {
    // Calculate plane from cut line points
    const center = new THREE.Vector3();
    cutLine.points.forEach(point => center.add(point));
    center.divideScalar(cutLine.points.length);

    // Use provided normal or calculate from points
    let normal = cutLine.normal.clone().normalize();
    
    if (cutLine.points.length >= 3) {
      // Calculate normal from three points for better accuracy
      const v1 = new THREE.Vector3().subVectors(cutLine.points[1], cutLine.points[0]);
      const v2 = new THREE.Vector3().subVectors(cutLine.points[2], cutLine.points[0]);
      normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
    }

    return new THREE.Plane(normal, -normal.dot(center));
  }

  private splitGeometryByPlane(geometry: THREE.BufferGeometry, plane: THREE.Plane): {
    upperGeometry: THREE.BufferGeometry | null,
    lowerGeometry: THREE.BufferGeometry | null
  } {
    const positions = geometry.attributes.position.array as Float32Array;
    const normals = geometry.attributes.normal?.array as Float32Array;
    const uvs = geometry.attributes.uv?.array as Float32Array;
    const indices = geometry.index?.array as Uint32Array;

    if (!indices) {
      console.warn('Geometry must be indexed for cutting');
      return { upperGeometry: null, lowerGeometry: null };
    }

    const upperVertices: number[] = [];
    const lowerVertices: number[] = [];
    const upperNormals: number[] = [];
    const lowerNormals: number[] = [];
    const upperUVs: number[] = [];
    const lowerUVs: number[] = [];
    const upperIndices: number[] = [];
    const lowerIndices: number[] = [];

    const vertexMap = new Map<number, { upper: number, lower: number }>();
    let upperVertexCount = 0;
    let lowerVertexCount = 0;

    // Process each triangle
    for (let i = 0; i < indices.length; i += 3) {
      const i1 = indices[i];
      const i2 = indices[i + 1];
      const i3 = indices[i + 2];

      // Get triangle vertices
      const v1 = new THREE.Vector3(positions[i1 * 3], positions[i1 * 3 + 1], positions[i1 * 3 + 2]);
      const v2 = new THREE.Vector3(positions[i2 * 3], positions[i2 * 3 + 1], positions[i2 * 3 + 2]);
      const v3 = new THREE.Vector3(positions[i3 * 3], positions[i3 * 3 + 1], positions[i3 * 3 + 2]);

      // Check which side of plane each vertex is on
      const d1 = plane.distanceToPoint(v1);
      const d2 = plane.distanceToPoint(v2);
      const d3 = plane.distanceToPoint(v3);

      const tolerance = 0.001;
      const side1 = Math.abs(d1) < tolerance ? 0 : (d1 > 0 ? 1 : -1);
      const side2 = Math.abs(d2) < tolerance ? 0 : (d2 > 0 ? 1 : -1);
      const side3 = Math.abs(d3) < tolerance ? 0 : (d3 > 0 ? 1 : -1);

      // Classify triangle
      const sides = [side1, side2, side3];
      const upperSides = sides.filter(s => s >= 0).length;
      const lowerSides = sides.filter(s => s <= 0).length;

      if (upperSides === 3) {
        // Triangle is completely on upper side
        this.addTriangleToSide([i1, i2, i3], positions, normals, uvs, 
          upperVertices, upperNormals, upperUVs, upperIndices, vertexMap, 'upper', upperVertexCount);
        upperVertexCount += 3;
      } else if (lowerSides === 3) {
        // Triangle is completely on lower side
        this.addTriangleToSide([i1, i2, i3], positions, normals, uvs,
          lowerVertices, lowerNormals, lowerUVs, lowerIndices, vertexMap, 'lower', lowerVertexCount);
        lowerVertexCount += 3;
      } else {
        // Triangle intersects the plane - would need more complex splitting
        // For now, assign to the side with majority of vertices
        if (upperSides >= lowerSides) {
          this.addTriangleToSide([i1, i2, i3], positions, normals, uvs,
            upperVertices, upperNormals, upperUVs, upperIndices, vertexMap, 'upper', upperVertexCount);
          upperVertexCount += 3;
        } else {
          this.addTriangleToSide([i1, i2, i3], positions, normals, uvs,
            lowerVertices, lowerNormals, lowerUVs, lowerIndices, vertexMap, 'lower', lowerVertexCount);
          lowerVertexCount += 3;
        }
      }
    }

    // Create new geometries
    let upperGeometry: THREE.BufferGeometry | null = null;
    let lowerGeometry: THREE.BufferGeometry | null = null;

    if (upperVertices.length > 0) {
      upperGeometry = new THREE.BufferGeometry();
      upperGeometry.setAttribute('position', new THREE.Float32BufferAttribute(upperVertices, 3));
      if (upperNormals.length > 0) {
        upperGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(upperNormals, 3));
      }
      if (upperUVs.length > 0) {
        upperGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(upperUVs, 2));
      }
      upperGeometry.setIndex(upperIndices);
      upperGeometry.computeBoundingBox();
      upperGeometry.computeBoundingSphere();
    }

    if (lowerVertices.length > 0) {
      lowerGeometry = new THREE.BufferGeometry();
      lowerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lowerVertices, 3));
      if (lowerNormals.length > 0) {
        lowerGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(lowerNormals, 3));
      }
      if (lowerUVs.length > 0) {
        lowerGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(lowerUVs, 2));
      }
      lowerGeometry.setIndex(lowerIndices);
      lowerGeometry.computeBoundingBox();
      lowerGeometry.computeBoundingSphere();
    }

    return { upperGeometry, lowerGeometry };
  }

  private addTriangleToSide(
    triangleIndices: number[],
    positions: Float32Array,
    normals: Float32Array | undefined,
    uvs: Float32Array | undefined,
    vertices: number[],
    normalsArray: number[],
    uvsArray: number[],
    indices: number[],
    vertexMap: Map<number, { upper: number, lower: number }>,
    side: 'upper' | 'lower',
    vertexCount: number
  ): void {
    triangleIndices.forEach(originalIndex => {
      // Add vertex data
      vertices.push(
        positions[originalIndex * 3],
        positions[originalIndex * 3 + 1],
        positions[originalIndex * 3 + 2]
      );

      if (normals) {
        normalsArray.push(
          normals[originalIndex * 3],
          normals[originalIndex * 3 + 1],
          normals[originalIndex * 3 + 2]
        );
      }

      if (uvs) {
        uvsArray.push(
          uvs[originalIndex * 2],
          uvs[originalIndex * 2 + 1]
        );
      }

      indices.push(vertices.length / 3 - 1);
    });
  }

  public clearCutPreview(): void {
    if (this.cutPreviewMesh) {
      this.scene.remove(this.cutPreviewMesh);
      this.cutPreviewMesh = null;
    }
  }

  public dispose(): void {
    this.clearCutPreview();
  }
}