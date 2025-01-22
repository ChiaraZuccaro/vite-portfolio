import { Group, Mesh, MeshStandardMaterial, SphereGeometry } from "three"
import { TextureMaps } from "../../../interfaces/img-texture.interface";

export class Mountains {
  private mountainsGroup = new Group();

  private texturesMap: TextureMaps;

  constructor(allTextures: TextureMaps) {
    this.texturesMap = allTextures;
    this.init()
  }

  private init() {
    const sphereGeometry = new SphereGeometry(3, 100, 100);
    const material = new MeshStandardMaterial({
      // map: this.texturesMap.colorMap,
      aoMap: this.texturesMap.aoMap,
      normalMap: this.texturesMap.normalMap,
      displacementMap: this.texturesMap.displacementMap,
      displacementScale: .3,
      roughnessMap: this.texturesMap.roughnessMap,
      roughness: 1
    });
    const mesh = new Mesh(sphereGeometry, material);
    this.mountainsGroup.add(mesh);
  }

  public get(){
    return this.mountainsGroup;
  }
}