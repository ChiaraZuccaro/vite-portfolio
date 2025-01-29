import { Group, Object3D, Vector3, PerspectiveCamera, Mesh, MeshStandardMaterial } from "three";

export class ObjectSpawner {
  private sceneGroup: Group;
  private camera: PerspectiveCamera;
  private chunkSize: number;
  private renderDistance: number;
  private heightMap: Map<string, number>;
  private objectsPlaced = new Set<string>();

  private cactusList: Object3D[] = [];
  private rareObjects: Object3D[] = [];

  constructor(camera: PerspectiveCamera, sceneGroup: Group, chunkSize: number, renderDistance: number) {
    this.camera = camera;
    this.sceneGroup = sceneGroup;
    this.chunkSize = chunkSize;
    this.renderDistance = renderDistance;
    this.heightMap = new Map<string, number>();
  }

  private disposeObject(obj: Object3D) {
    obj.traverse((child: Object3D) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;

        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
              mesh.material.forEach(mat => mat.dispose());
          } else {
              mesh.material.dispose();
          }
        }
        if (mesh.material && (mesh.material as MeshStandardMaterial).map) {
          (mesh.material as MeshStandardMaterial).map!.dispose();
        }
      }
    });
  }
  
  public updateHeightMap(heightMap: Map<string, number>) {
    this.heightMap = heightMap;
  }

  public setObjects(cactus: Object3D[], rareObjects: Object3D[]) {
    this.cactusList = cactus;
    this.rareObjects = rareObjects;
  }

  public spawnObjectsInChunk(chunkX: number, chunkZ: number) {
    const numCactus = Math.floor(Math.random() * 2) + 1;
    const numRareObjects = Math.random() < 0.2 ? 1 : 0;

    for (let i = 0; i < numCactus; i++) {
      this.spawnObject(chunkX, chunkZ, this.cactusList);
    }

    for (let i = 0; i < numRareObjects; i++) {
      this.spawnObject(chunkX, chunkZ, this.rareObjects);
    }
  }

  private spawnObject(chunkX: number, chunkZ: number, objectList: Object3D[]) {
    if (objectList.length === 0) return;

    let maxAttempts = 6;
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      let x = chunkX + (Math.random() - 0.5) * this.chunkSize;
      let z = chunkZ + (Math.random() - 0.5) * this.chunkSize;
      let key = `${Math.floor(x)},${Math.floor(z)}`;

      if (this.objectsPlaced.has(key)) continue;
      if (!this.heightMap.has(key)) continue;

      let y = this.heightMap.get(key)!;
      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const roadRadius = 600;
      const roadWidth = 55;
      const isInRoad = distanceFromCenter >= roadRadius - roadWidth / 2 &&
        distanceFromCenter <= roadRadius + roadWidth / 2;

      if (!isInRoad) {
        let obj = objectList[Math.floor(Math.random() * objectList.length)].clone();
        obj.position.set(x, y, z);
        this.sceneGroup.add(obj);
        this.objectsPlaced.add(key);        
        return;
      }
    }
  }


  public removeObjectsOutOfView() {
    const cameraPos = new Vector3();
    this.camera.getWorldPosition(cameraPos);
    const maxDistance = this.chunkSize * this.renderDistance * 1.5;
    for (const key of this.objectsPlaced) {
      let [x, z] = key.split(",").map(Number);
      // console.log(this.sceneGroup);
      console.log(key);
      
      let obj = this.sceneGroup.getObjectByName(key);
      // console.log(obj);
      
      if (obj) {
        const dist = cameraPos.distanceTo(obj.position);
        if (dist > maxDistance) {
          this.disposeObject(obj);
          this.sceneGroup.remove(obj);
          this.objectsPlaced.delete(key);
        }
      }
    }
  }
}
