import { Object3D, Mesh, Vector3 } from "three";

export class ObjectSpawner {
  private objectsPlaced = new Set<string>();
  private cactusList: Object3D[] = [];
  private rareObjects: Object3D[] = [];

  public setObjects(cactus: Object3D[], rareObjects: Object3D[]) {
    this.cactusList = cactus;
    this.rareObjects = rareObjects;
  }

  public spawnObjectsInChunk(chunkX: number, chunkZ: number): Mesh[] {
    const numCactus = Math.floor(Math.random() * 2) + 1;
    const numRareObjects = Math.random() < 0.2 ? 1 : 0;

    console.log(`🌵 Spawn di ${numCactus} cactus e ${numRareObjects} oggetti rari nel chunk (${chunkX}, ${chunkZ})`);

    const spawnedObjects: Mesh[] = [];

    for (let i = 0; i < numCactus; i++) {
      const obj = this.spawnObject(chunkX, chunkZ, this.cactusList);
      if (obj) spawnedObjects.push(obj);
    }

    for (let i = 0; i < numRareObjects; i++) {
      const obj = this.spawnObject(chunkX, chunkZ, this.rareObjects);
      if (obj) spawnedObjects.push(obj);
    }

    return spawnedObjects;
  }

  public spawnRandomObject(): Mesh | null {
    const rareObjectProbability = 0.1;
    const rand = Math.random();

    let objectList: Object3D[];
    if (rand < rareObjectProbability) {
      objectList = this.rareObjects;
    } else {
      objectList = this.cactusList;
    }

    if (objectList.length === 0) return null;

    const obj = objectList[Math.floor(Math.random() * objectList.length)].clone();
    return obj as Mesh;
  }

  private spawnObject(chunkX: number, chunkZ: number, objectList: Object3D[]): Mesh | null {
    if (objectList.length === 0) return null;

    let x = chunkX + (Math.random() - 0.5) * 10;
    let z = chunkZ + (Math.random() - 0.5) * 10;
    let key = `${Math.floor(x)},${Math.floor(z)}`;

    if (this.objectsPlaced.has(key)) return null;

    let obj = objectList[Math.floor(Math.random() * objectList.length)].clone();
    obj.position.set(x, 1, z);
    this.objectsPlaced.add(key);

    return obj as Mesh;
  }
}
