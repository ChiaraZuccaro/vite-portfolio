import { TextureMaps } from "@interfaces/img-texture.interface";
import { createNoise2D } from "simplex-noise";
import { Group, PlaneGeometry, Mesh, MeshStandardMaterial, Vector3, PerspectiveCamera } from "three";

export class Ground {
  private groundGroup = new Group();
  private chunkSize = 120;
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
    const roadRadius = 600; // 🔥 Raggio della strada
    const roadWidth = 50; // 🔥 Larghezza della strada
    const roadStartAngle = Math.PI / 4; // 🔥 Angolo iniziale della strada
    const roadEndAngle = Math.PI / 2; // 🔥 Angolo finale della strada

    for (let i = 0; i < position.count; i++) {
      let x = position.getX(i) + chunkX;
        let z = position.getZ(i) + chunkZ;

        // 🔹 Calcoliamo la distanza dal centro
        const distanceFromCenter = Math.sqrt(x * x + z * z);

        // 🔹 Calcoliamo l'angolo rispetto al centro (0,0)
        const angle = Math.atan2(z, x);

        // 🔥 Controlliamo se il vertice è nella zona della strada
        const isInRoad = 
            distanceFromCenter >= roadRadius - roadWidth / 2 && 
            distanceFromCenter <= roadRadius + roadWidth / 2 
            // angle >= roadStartAngle && 
            // angle <= roadEndAngle;

        if (isInRoad) {
            // Manteniamo la strada piatta
            position.setY(i, 0);
        } else {
            // Applichiamo il noise solo alla sabbia
            const noise = this.noise(x * frequency, z * frequency) * amplitude;
            position.setY(i, noise);
        }
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