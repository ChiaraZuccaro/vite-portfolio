import { Group, Mesh, MeshStandardMaterial, SphereGeometry } from "three"
import { TextureMaps } from "@interfaces/img-texture.interface";

export class Mountains {
  private mountainsGroup = new Group();

  private texturesMaps: TextureMaps;

  constructor(allTextures: TextureMaps) {
    this.texturesMaps = allTextures;
    this.init()
  }

  private init() {
    const sphereGeometry = new SphereGeometry(2, 100, 100);
    const material = new MeshStandardMaterial({
      ...this.texturesMaps,
      aoMapIntensity: 1,
      displacementScale: .3,
      roughness: 1
    });
    const mesh = new Mesh(sphereGeometry, material);
    this.mountainsGroup.add(mesh);
  }

  public get(){
    return this.mountainsGroup;
  }
}