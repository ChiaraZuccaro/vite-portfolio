import { Mesh, MeshStandardMaterial, PlaneGeometry, Vector3 } from "three";
import { NoiseFunction2D } from "simplex-noise";
import { ObjectSpawner } from "./desert/ObjectSpawner.class";
import { TextureMaps } from "@interfaces/img-texture.interface";
import { RoadParams } from "@globalUtils/roadParams";

export class Chunk extends Mesh {
  private treesPositionArray = []
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
    private textures: TextureMaps
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
    // this.position.set(x, 0, z);

    this.applySandWaves();
    // this.spawnObjects();
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
    this.objects = this.objectSpawner.spawnObjectsInChunk(this.position.x, this.position.z);
    this.objects.forEach(obj => this.add(obj));
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

    console.log(`🗑️ Chunk ${this.chunkKey} eliminato.`);
  }

  public getChunkKey(): string {
    return this.chunkKey;
  }

  public updateLOD(LOD: number) {
		// console.log('LOD updated', LOD, 'vs', this.LOD)
		if (LOD === this.LOD) return

		this.LOD = LOD
		// const density = isMobile ? 4 : 2
		const density = 2
		const segments =
			Math.max(Math.floor(this.size * 0.5 ** LOD), density) / density
		const geometry = new PlaneGeometry(this.size, this.size, segments, segments)
		geometry.rotateX(-Math.PI * 0.5)
		// geometry.translate(this.size / 2, 0, this.size / 2)
		// this.needsUpdate = true
		this.geometry.dispose()
		this.geometry = geometry
		this.updateGeometry()
		// this.geometry.needsUpdate = true
	}

  public updateGeometry() {
		// this.treesPositionArray = []
		const posAttr = this.geometry.getAttribute('position')
		// const heightAttr = this.createHeightAttribute()

		for (let i = 0; i < posAttr.count; i++) {
			const x = posAttr.getX(i) + this.position.x
			const z = posAttr.getZ(i) + this.position.z

			// let h = getHeight(x, z, this.globNoise, this.params)

			// heightAttr.setX(i, h)
			// posAttr.setY(i, Math.max(h, -1))
		}

		posAttr.needsUpdate = true

		// TODO calcolare a mano le normali con prodotto vettoriale
		this.geometry.computeVertexNormals()

		// this.createTreesMesh()
		// if (!this.trees && this.LOD <= 2) this.generateTrees()
		// if (!this.clouds) this.generateClouds()
		// if (!this.boats) this.addBoats()
	}
}
