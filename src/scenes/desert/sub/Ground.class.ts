import { createNoise2D } from "simplex-noise";
import { Group, PlaneGeometry, Mesh, MeshStandardMaterial, Vector3, PerspectiveCamera, RepeatWrapping } from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { TextureMaps } from "@interfaces/img-texture.interface";

export class Ground {
  private groundGroup = new Group();
  private chunkSize = 120;
  private renderDistance = 3;
  private chunkMap = new Map<string, Mesh>();
  private currentChunk = { x: 0, z: 0 };
  // private heightMap = new Map<string, number>();

  private noise = createNoise2D();
  private camera;
  // private objectSpawner;
  private textures;


  constructor(camera: PerspectiveCamera, gltfLoader: GLTFLoader, allTextures: TextureMaps) {
    this.camera = camera;
    this.textures = allTextures;
    this.generateChunks(this.currentChunk.x, this.currentChunk.z);
    // this.objectSpawner = new ObjectSpawner(camera, this.groundGroup, this.chunkSize, this.renderDistance);
    // this.load3Dobjs(gltfLoader);
  }

  // private load3Dobjs(gltfLoader: GLTFLoader) {
  //   const obj3DDracoPath = import.meta.env.BASE_URL + 'objs3D/desert/' + 'objsDesert.glb';
  //   gltfLoader.load(obj3DDracoPath, (gltf) => {
  //     const skull = gltf.scene.getObjectByName('skull');
  //     const vulture = gltf.scene.getObjectByName('vulture');
  //     const cactus = gltf.scene.getObjectByName('cactus');
  //     const bush = gltf.scene.getObjectByName('bush');


  //     if (cactus && bush && vulture && skull) {
  //       cactus.scale.set(6, 6, 6);
  //       bush.scale.set(.03, .03, .03);
  //       vulture.scale.set(.22, .22, .22);
  //       skull.scale.set(2.8, 2.8, 2.8);

  //       skull.position.setY(-3.5);

  //       this.objectSpawner.setObjects([cactus, bush], [vulture, skull]);
  //     }
  //   });
  // }

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

      let y = 0;
      if (!isInRoad) {
        y = this.noise(x * frequency, z * frequency) * amplitude;
      }
      position.setY(i, y);

      // this.heightMap.set(`${Math.floor(x)},${Math.floor(z)}`, y);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();

    // this.objectSpawner?.updateHeightMap(this.heightMap);
  }


  //#region Chunks
  private calculateLOD(distance: number): number {
    if (distance < this.chunkSize * 2) return 0;
    if (distance < this.chunkSize * 4) return 1;
    return 2;
  }

  private shouldUpdateChunk(chunkKey: string): boolean {
    const existingMesh = this.chunkMap.get(chunkKey);
    if (!existingMesh) return true;
    const [ x, z ] = chunkKey.split(",");
    const cameraXZ = new Vector3(this.camera.position.x, 0, this.camera.position.z);
    const chunkXZ = new Vector3(parseFloat(x), 0, parseFloat(z));
    const distance = cameraXZ.distanceTo(chunkXZ);

    const newLOD = this.calculateLOD(distance);
    const currentSegments = (existingMesh.geometry as PlaneGeometry).parameters.widthSegments;
    const newSegments = Math.max(Math.floor(this.chunkSize * 0.5 ** newLOD), 8);

    return currentSegments !== newSegments;
  }

  private createChunk(x: number, z: number, updateExisting = false) {
    const cameraXZ = new Vector3(this.camera.position.x, 0, this.camera.position.z);
    const chunkXZ = new Vector3(x, 0, z);
    const distance = cameraXZ.distanceTo(chunkXZ);

    const LOD = this.calculateLOD(distance);
    const minSegments = 8;
    const segments = Math.max(Math.floor(this.chunkSize * 0.5 ** LOD), minSegments);

    const chunkKey = `${x},${z}`;

    const geometry = new PlaneGeometry(this.chunkSize, this.chunkSize, segments, segments);
    geometry.rotateX(-Math.PI / 2);
    this.applySandWaves(geometry, x, z);

    this.textures.map.wrapS = RepeatWrapping;
    this.textures.map.wrapT = RepeatWrapping;
    this.textures.map.repeat.set(1, 1);

    const material = new MeshStandardMaterial({
      // ...this.textures,
      displacementScale: 0.3,
      roughness: 1,
      wireframe: true
    });

    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, 0, z);
    this.groundGroup.add(mesh);
    this.chunkMap.set(chunkKey, mesh);

    // this.objectSpawner?.spawnObjectsInChunk(x, z);
  }

  private removeChunk(key: string) {
    const mesh = this.chunkMap.get(key);
    if (mesh) {
      this.groundGroup.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => mat.dispose());
      } else {
        mesh.material.dispose();
      }
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

        if (!this.chunkMap.has(chunkKey) || this.shouldUpdateChunk(chunkKey)) {
          this.removeChunk(chunkKey);
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