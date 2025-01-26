import { TextureMaps } from "@interfaces/img-texture.interface";
import { createNoise2D } from "simplex-noise";
import { Group, PlaneGeometry, Mesh, MeshStandardMaterial, Vector3, PerspectiveCamera, RepeatWrapping } from "three";

export class Ground {
  private groundGroup = new Group();
  private chunkSize = 120;
  private renderDistance = 2;
  private chunkMap = new Map();
  private currentChunk = { x: 0, z: 0 };
  private camera;

  private noise = createNoise2D();

  private textures: TextureMaps;

  constructor(camera: PerspectiveCamera, allTextures: TextureMaps) {
    this.camera = camera;
    this.textures = allTextures;
    this.generateChunks(this.currentChunk.x, this.currentChunk.z);
  }

  private setLookCameraOnStreet(cameraPosition: Vector3) {
    const roadCenter = new Vector3(0, 0, 0);
    const toCenter = cameraPosition.clone().sub(roadCenter); // vector camera → center
    toCenter.setY(0);
    toCenter.normalize().multiplyScalar(600);

    const closestRoadPoint = roadCenter.clone().add(toCenter);
    const cameraDirection = new Vector3();
    this.camera.getWorldDirection(cameraDirection);
    
    // OFFSET to look to right
    const rightVector = new Vector3(-cameraDirection.z, 0, cameraDirection.x).normalize();

    const lookAtOffset = 1;
    const lookAtTarget = closestRoadPoint.clone().add(rightVector.multiplyScalar(lookAtOffset));

    const cameraOffset = 5;
    const newCameraPosition = cameraPosition.clone().add(rightVector.multiplyScalar(cameraOffset));
    this.camera.position.copy(newCameraPosition);

    const currentLookAt = new Vector3();
    this.camera.getWorldDirection(currentLookAt);
    currentLookAt.add(cameraPosition);
    
    currentLookAt.lerp(lookAtTarget, 0.1);
    this.camera.lookAt(currentLookAt);
  }

  private applySandWaves(geometry: PlaneGeometry, chunkX: number, chunkZ: number) {
    const position = geometry.attributes.position;
    const amplitude = 3;
    const frequency = 0.03;
    const roadRadius = 600;
    const roadWidth = 55;

    for (let i = 0; i < position.count; i++) {
      let x = position.getX(i) + chunkX;
      let z = position.getZ(i) + chunkZ;

      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const isInRoad = distanceFromCenter >= roadRadius - roadWidth / 2 && 
        distanceFromCenter <= roadRadius + roadWidth / 2;

      if (isInRoad) {
        position.setY(i, 0);
      } else {
        const noise = this.noise(x * frequency, z * frequency) * amplitude;
        position.setY(i, noise);
      }
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  //#region Chunks
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

  private createChunk(x: number, z: number, LOD = 1) {
    const segments = Math.max(Math.floor(this.chunkSize * .5 **LOD), 1);
    const geometry = new PlaneGeometry(this.chunkSize, this.chunkSize, segments, segments);
    geometry.rotateX(-Math.PI / 2);
    this.applySandWaves(geometry, x,z)

    this.textures.map.wrapS = RepeatWrapping;
    this.textures.map.wrapT = RepeatWrapping;
    this.textures.map.repeat.set(1,1);
    const material = new MeshStandardMaterial({
      ...this.textures,
      displacementScale: .3,
      roughness: 1
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
  //#endregion


  public trackCamera = () => {
    const cameraPosition = new Vector3();
    this.camera.getWorldPosition(cameraPosition);

    const newChunkX = Math.floor(cameraPosition.x / this.chunkSize);
    const newChunkZ = Math.floor(cameraPosition.z / this.chunkSize);

    if (newChunkX !== this.currentChunk.x || newChunkZ !== this.currentChunk.z) {
        this.currentChunk = { x: newChunkX, z: newChunkZ };
        this.generateChunks(newChunkX, newChunkZ); // 🔥 Rigenera i chunk se necessario
    }

    this.setLookCameraOnStreet(cameraPosition);
  };

  public get() {
    return this.groundGroup;
  }
}