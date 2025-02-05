import { Mesh, MeshStandardMaterial, PlaneGeometry, Vector3 } from "three";
import { NoiseFunction2D } from "simplex-noise";
import { ObjectSpawner } from "./desert/ObjectSpawner.class";
import { TextureMaps } from "@interfaces/img-texture.interface";
import { RoadParams } from "@globalUtils/roadParams";

export class Chunk extends Mesh {
  private objects: Mesh[] = [];
  private chunkKey: string;
  private size: number;

  private globNoise;

  constructor(
    private chunkSize: number,
    private globalNoise: NoiseFunction2D,
    private LOD = 0,
    private globalPosition = new Vector3(0, 0, 0),
    private objectSpawner: ObjectSpawner,
    private textures: TextureMaps,
    private shouldSpawnObjects: boolean
  ) {
    // const density = isMobile ? 4 : 2
    const minSegments = 8;
    const segments = Math.max(Math.floor(chunkSize * 0.5 ** LOD), minSegments)
    const geometry = new PlaneGeometry(chunkSize, chunkSize, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const material = new MeshStandardMaterial({
      // ...textures,
      displacementScale: 0.3,
      roughness: 1,
      wireframe: true
    });

    super(geometry, material); // Passiamo geometry e material a Mesh
    this.position.copy(globalPosition);
    this.globNoise = globalNoise;
    this.size = chunkSize;
    this.LOD = LOD;

    // this.chunkKey = `${x},${z}`;

    this.applySandWaves();
    if(shouldSpawnObjects) {
      this.spawnObjects();
    }
  }

  private applySandWaves() {
    const position = this.geometry.attributes.position;
    const amplitude = 4;
    const frequency = 0.03;

    const halfRoadWidth = RoadParams.roadWidth / 2;

    for (let i = 0; i < position.count; i++) {
      let x = position.getX(i) + this.position.x;
      let z = position.getZ(i) + this.position.z;

      const distanceFromCenter = Math.sqrt(x * x + z * z);
      const isInRoad = distanceFromCenter >= RoadParams.roadRadius - halfRoadWidth
        && distanceFromCenter <= RoadParams.roadRadius + halfRoadWidth;

      let y = isInRoad ? 0 : this.globNoise(x * frequency, z * frequency) * amplitude;

      position.setY(i, y);
    }

    position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  private spawnObjects() {
    const maxObjects = 6;
    const spawnedObjects: Mesh[] = [];

    const halfRoadWidth = RoadParams.roadWidth / 2;
    const minSpawnDistance = RoadParams.roadRadius + halfRoadWidth + 2; // Distanza minima dalla strada
    const maxSpawnDistance = RoadParams.roadRadius + halfRoadWidth + 10; // Distanza massima dalla strada

    for (let i = 0; i < maxObjects; i++) {
      let attempts = 0;
      let placed = false;

      while (attempts < 10 && !placed) {
        attempts++;

        // Generiamo una posizione SOLO nell'anello attorno alla strada
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (maxSpawnDistance - minSpawnDistance) + minSpawnDistance;
        const x = this.position.x + Math.cos(angle) * distance;
        const z = this.position.z + Math.sin(angle) * distance;

        // Controllo altezza terreno per posizionare bene gli oggetti
        const y = this.globNoise(x * 0.03, z * 0.03) * 4 + 0.5;

        // Chiedi all'ObjectSpawner di creare un oggetto
        const obj = this.objectSpawner.spawnRandomObject();
        if (obj) {
          obj.position.set(x, y, z);
          this.add(obj);
          spawnedObjects.push(obj);
          placed = true;
          console.log(`✔️ Oggetto posizionato a (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)})`);
        }
      }
    }

    this.objects = spawnedObjects;
  }



  public removeChunk() {
    this.objects.forEach(obj => {
      this.remove(obj);
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    this.geometry.dispose();
    if (Array.isArray(this.material)) {
      this.material.forEach(mat => mat.dispose());
    } else {
      this.material.dispose();
    }

    this.objects = [];
    console.log(`🗑️ Chunk ${this.chunkKey} eliminato con tutti gli oggetti.`);
  }
}
