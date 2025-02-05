import { createNoise2D } from "simplex-noise";
import { Group, PlaneGeometry, Vector3, PerspectiveCamera } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { TextureMaps } from "@interfaces/img-texture.interface";
import { ObjectSpawner } from "../ObjectSpawner.class";
import { Chunk } from "@scenes/Chunk.class";
import { RoadParams } from "@globalUtils/roadParams";

export class Ground {
  private groundGroup = new Group();
  private chunkSize = 180;
  private renderDistance = 4;
  private chunkMap = new Map<string, Chunk>();
  private currentChunk = { x: 0, z: 0 };
  // private heightMap = new Map<string, number>();

  private noise = createNoise2D();
  private camera;
  private objectSpawner;
  private textures;


  constructor(camera: PerspectiveCamera, gltfLoader: GLTFLoader, allTextures: TextureMaps) {
    this.camera = camera;
    this.textures = allTextures;
    this.objectSpawner = new ObjectSpawner();
    this.load3Dobjs(gltfLoader).then(
      () => this.generateChunks(this.currentChunk.x, this.currentChunk.z)
    );
  }

  private load3Dobjs(gltfLoader: GLTFLoader): Promise<void> {
    return new Promise((resolve) => {
      const obj3DDracoPath = import.meta.env.BASE_URL + 'objs3D/desert/' + 'objsDesert.glb';
      gltfLoader.load(obj3DDracoPath, (gltf) => {
        const skull = gltf.scene.getObjectByName('skull');
        const vulture = gltf.scene.getObjectByName('vulture');
        const cactus = gltf.scene.getObjectByName('cactus');
        const bush = gltf.scene.getObjectByName('bush');

        if (cactus && bush && vulture && skull) {
          cactus.scale.set(6, 6, 6);
          bush.scale.set(.03, .03, .03);
          vulture.scale.set(.22, .22, .22);
          skull.scale.set(2.8, 2.8, 2.8);

          skull.position.setY(-5);

          this.objectSpawner.setObjects([cactus, bush], [vulture, skull]);
        } else {
          console.warn("⚠️ Some 3D objects were not found in the GLTF model.");
        }

        resolve();
      });
    });
  }

  // private setLookCameraOnStreet(cameraPosition: Vector3) {
  //   const roadCenter = new Vector3(0, 0, 0);
  //   const toCenter = cameraPosition.clone().sub(roadCenter); // vector camera → center
  //   toCenter.setY(0);
  //   toCenter.normalize().multiplyScalar(RoadParams.roadRadius);

  //   const closestRoadPoint = roadCenter.clone().add(toCenter);
  //   // const cameraDirection = new Vector3();
  //   // this.camera.getWorldDirection(cameraDirection);

  //   // OFFSET to look to right
  //   // const rightVector = new Vector3(-cameraDirection.z, 0, cameraDirection.x).normalize();

  //   // const lookAtOffset = .5;
  //   // const lookAtTarget = closestRoadPoint.clone().add(rightVector.multiplyScalar(lookAtOffset));

  //   // const cameraOffset = 5;
  //   // const newCameraPosition = cameraPosition.clone().add(rightVector.multiplyScalar(cameraOffset));
  //   // this.camera.position.copy(newCameraPosition);

  //   const currentLookAt = new Vector3(-3, -3, -3);
  //   this.camera.getWorldDirection(currentLookAt);
  //   currentLookAt.add(cameraPosition);

  //   // currentLookAt.lerp(lookAtTarget, 0.1);
  //   this.camera.lookAt(currentLookAt);
  // }

  // private applySandWaves(geometry: PlaneGeometry, chunkX: number, chunkZ: number) {
  //   const position = geometry.attributes.position;
  //   const amplitude = 3;
  //   const frequency = 0.03;
  //   const roadRadius = 600;
  //   const roadWidth = 55;

  //   for (let i = 0; i < position.count; i++) {
  //     let x = position.getX(i) + chunkX;
  //     let z = position.getZ(i) + chunkZ;

  //     const distanceFromCenter = Math.sqrt(x * x + z * z);
  //     const isInRoad = distanceFromCenter >= roadRadius - roadWidth / 2 &&
  //       distanceFromCenter <= roadRadius + roadWidth / 2;

  //     let y = 0;
  //     if (!isInRoad) {
  //       y = this.noise(x * frequency, z * frequency) * amplitude;
  //     }
  //     position.setY(i, y);

  //     // this.heightMap.set(`${Math.floor(x)},${Math.floor(z)}`, y);
  //   }

  //   position.needsUpdate = true;
  //   geometry.computeVertexNormals();

  //   // this.objectSpawner?.updateHeightMap(this.heightMap);
  // }


  //#region Chunks
  private calculateLOD(distance: number): number {
    if (distance < this.chunkSize * 2) return 0;
    if (distance < this.chunkSize * 4) return 1;
    return 2;
  }

  private shouldUpdateChunk(chunkKey: string): boolean {
    const existingMeshes = this.chunkMap.get(chunkKey);
    if (!existingMeshes) return true;

    if (!(existingMeshes.geometry instanceof PlaneGeometry)) return true;

    const [x, z] = chunkKey.split(",");
    const cameraXZ = new Vector3(this.camera.position.x, 0, this.camera.position.z);
    const chunkXZ = new Vector3(parseFloat(x), 0, parseFloat(z));
    const distance = cameraXZ.distanceTo(chunkXZ);

    const newLOD = this.calculateLOD(distance);
    const currentSegments = (existingMeshes.geometry as PlaneGeometry).parameters.widthSegments;
    const newSegments = Math.max(Math.floor(this.chunkSize * 0.5 ** newLOD), 8);

    return currentSegments !== newSegments;
  }

  private createChunk(x: number, z: number, shouldSpawnObjects: boolean) {
    const cameraXZ = new Vector3(this.camera.position.x, 0, this.camera.position.z);
    const chunkXZ = new Vector3(x, 0, z);
    const distance = cameraXZ.distanceTo(chunkXZ);

    const LOD = this.calculateLOD(distance);
    const chunkKey = `${x},${z}`;

    if (this.chunkMap.has(chunkKey)) {
      console.warn(`⚠️ Chunk ${chunkKey} già esistente.`);
      return;
    }
    const newChunk = new Chunk(
      this.chunkSize,
      this.noise,
      LOD,
      new Vector3(x, 0, z),
      this.objectSpawner,
      this.textures,
      shouldSpawnObjects
    );

    this.groundGroup.add(newChunk);
    this.chunkMap.set(chunkKey, newChunk);
  }


  private removeChunk(key: string) {
    const chunk = this.chunkMap.get(key);
    if (chunk) {
      chunk.removeChunk();
      this.groundGroup.remove(chunk);
      this.chunkMap.delete(key);
    }
  }

  private generateChunks(centerX: number, centerZ: number) {
    const newChunkKeys = new Set<string>();

    for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
      for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
        const chunkX = (centerX + dx) * this.chunkSize;
        const chunkZ = (centerZ + dz) * this.chunkSize;
        const chunkKey = `${chunkX},${chunkZ}`;

        newChunkKeys.add(chunkKey);

        const halfRoadWidth = RoadParams.roadWidth / 2;
        const minSpawnDistance = RoadParams.roadRadius - halfRoadWidth - 5; // Un po' dentro la strada
        const maxSpawnDistance = RoadParams.roadRadius + halfRoadWidth + 20; // Un po' fuori la strada
        const chunkDistance = Math.sqrt(chunkX * chunkX + chunkZ * chunkZ);

        const shouldSpawnObjects = (chunkDistance >= minSpawnDistance && chunkDistance <= maxSpawnDistance);

        if (!this.chunkMap.has(chunkKey) || this.shouldUpdateChunk(chunkKey)) {
          this.removeChunk(chunkKey);
          this.createChunk(chunkX, chunkZ, shouldSpawnObjects);
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
  //#endregion


  public trackCamera = () => {
    const cameraPosition = new Vector3();
    this.camera.getWorldPosition(cameraPosition);

    const newChunkX = Math.floor(cameraPosition.x / this.chunkSize);
    const newChunkZ = Math.floor(cameraPosition.z / this.chunkSize);

    if (newChunkX !== this.currentChunk.x || newChunkZ !== this.currentChunk.z) {
      this.currentChunk = { x: newChunkX, z: newChunkZ };
      this.generateChunks(newChunkX, newChunkZ);
    }

    // this.setLookCameraOnStreet(cameraPosition);
    // this.objectSpawner?.removeObjectsOutOfView();
  };

  public get() {
    return this.groundGroup;
  }
}