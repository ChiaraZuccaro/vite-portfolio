import { Group, Mesh, MeshStandardMaterial, SphereGeometry } from "three";
import { TextureMaps } from "../../../interfaces/img-texture.interface";

export class Road {
  private roadGroup = new Group();
  
    private texturesMap!: TextureMaps;
  
    constructor(allTextures: TextureMaps) {
      if(allTextures) {
        this.texturesMap = allTextures;
        this.init()
      }
    }
  
    private init() {
      const sphereGeometry = new SphereGeometry(1, 100, 100);
      const material = new MeshStandardMaterial({
        ...this.texturesMap,
        displacementScale: 1,
        roughness: 1
      });
      const mesh = new Mesh(sphereGeometry, material);
      mesh.position.x = -5;
      this.roadGroup.add(mesh);
    }
  
    public get(){
      return this.roadGroup;
    }
}