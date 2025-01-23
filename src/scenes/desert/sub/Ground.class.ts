import { TextureMaps } from "@interfaces/img-texture.interface";
import { Group, Mesh, MeshStandardMaterial, SphereGeometry } from "three";

export class Ground {
  private groundGroup = new Group();
    
  private texturesMap!: TextureMaps;

  constructor(allTextures: TextureMaps) {
    if(allTextures) {
      this.texturesMap = allTextures;
      this.init()
    }
  }

  private init() {
    const sphereGeometry = new SphereGeometry(2, 100, 100);
    const material = new MeshStandardMaterial({
      ...this.texturesMap,
      displacementScale: .2,
      roughness: 1
    });
    const mesh = new Mesh(sphereGeometry, material);
    mesh.position.x = 5;
    this.groundGroup.add(mesh);
  }

  public get(){
    return this.groundGroup;
  }
}