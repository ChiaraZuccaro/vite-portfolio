import { TextureMaps } from "@interfaces/img-texture.interface";
import { createNoise2D } from "simplex-noise";
import { Group, PlaneGeometry, Mesh, MeshStandardMaterial, Vector3, PerspectiveCamera } from "three";

export class Ground {
  private groundGroup = new Group();
  private chunkSize = 70;
  private renderDistance = 2;
  private chunkMap = new Map();
  private currentChunk = { x: 0, z: 0 };
  private camera;

  private noise = createNoise2D();

  constructor(camera: PerspectiveCamera, allTextures: TextureMaps) {
    this.camera = camera;
    this.generateChunks(this.currentChunk.x, this.currentChunk.z);
  }

  private applySandWaves(geometry: PlaneGeometry, chunkX: number, chunkZ: number) {
    const position = geometry.attributes.position;
    const amplitude = 3;
    const frequency = 0.03;
    // const roadWidth = 10;  // Larghezza della strada piatta

    for (let i = 0; i < position.count; i++) {
      let x = position.getX(i);
      let z = position.getZ(i);

      // 🔹 Convertiamo in coordinate globali per evitare discontinuità tra chunk
      let globalX = x + chunkX;
      let globalZ = z + chunkZ;

      // 🔹 Generiamo il noise usando solo coordinate globali
      const noise = this.noise(globalX * frequency, globalZ * frequency) * amplitude;
      position.setY(i, noise);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  private generateChunks(centerX: number, centerZ: number) {
    const newChunkKeys = new Set();

    for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
      for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
        const chunkX = (centerX + dx) * this.chunkSize;
        const chunkZ = (centerZ + dz) * this.chunkSize;
        const chunkKey = `${chunkX},${chunkZ}`;

        newChunkKeys.add(chunkKey);

        if (!this.chunkMap.has(chunkKey)) {
          this.createChunk(chunkX, chunkZ);
        }
      }
    }
    // Remove chunk far
    for (const key of this.chunkMap.keys()) {
      if (!newChunkKeys.has(key)) {
        this.removeChunk(key);
      }
    }
  }

  private createChunk(x: number, z: number) {
    const geometry = new PlaneGeometry(this.chunkSize, this.chunkSize, 100, 100);
    geometry.rotateX(-Math.PI / 2);
    this.applySandWaves(geometry, x,z)

    const material = new MeshStandardMaterial({
      color: 0x888888,
      wireframe: true
    });

    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, 0, z);
    this.groundGroup.add(mesh);
    this.chunkMap.set(`${x},${z}`, mesh);
  }

  private removeChunk(key: string) {
    const mesh = this.chunkMap.get(key);
    if (mesh) {
      this.groundGroup.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.chunkMap.delete(key);
    }
  }

  public trackCamera = () => {
    requestAnimationFrame(this.trackCamera);

    const cameraPosition = new Vector3();
    this.camera.getWorldPosition(cameraPosition);

    // Which chunk is the camera 
    const newChunkX = Math.floor(cameraPosition.x / this.chunkSize);
    const newChunkZ = Math.floor(cameraPosition.z / this.chunkSize);

    if (newChunkX !== this.currentChunk.x || newChunkZ !== this.currentChunk.z) {
      this.currentChunk = { x: newChunkX, z: newChunkZ };
      this.generateChunks(newChunkX, newChunkZ);
    }
  };

  public get() {
    return this.groundGroup;
  }
}