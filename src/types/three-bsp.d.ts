// Type definitions for three-bsp
declare module 'three-bsp' {
  import * as THREE from 'three';

  export class ThreeBSP {
    constructor(geometry: THREE.BufferGeometry | THREE.Mesh);
    
    subtract(other: ThreeBSP): ThreeBSP;
    union(other: ThreeBSP): ThreeBSP;
    intersect(other: ThreeBSP): ThreeBSP;
    
    toGeometry(): THREE.Geometry;
    toMesh(material?: THREE.Material): THREE.Mesh;
  }

  export default ThreeBSP;
}