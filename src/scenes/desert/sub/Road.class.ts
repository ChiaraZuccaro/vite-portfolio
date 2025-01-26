import { TextureMaps } from "@interfaces/img-texture.interface";
import { Group, Shape, ExtrudeGeometry, Mesh, MeshStandardMaterial, MathUtils, PerspectiveCamera } from "three";

export class Road {
  private roadGroup = new Group();
  private roadMesh: Mesh;
  private roadRadius = 600;
  private roadWidth = 43;
  private roadThickness = 1;

  private camera: PerspectiveCamera;

  constructor(camera: PerspectiveCamera, allTextures: TextureMaps) {
    this.camera = camera;
    this.createRoad();
  }

  private createRoad() {
    const roadShape = new Shape();

    roadShape.absarc(0, 0, this.roadRadius + this.roadWidth / 2, 0, Math.PI * 2, false);
    roadShape.lineTo(
      Math.cos(0) * (this.roadRadius - this.roadWidth / 2),
      Math.sin(0) * (this.roadRadius - this.roadWidth / 2)
    );
    roadShape.absarc(0, 0, this.roadRadius - this.roadWidth / 2, Math.PI * 2, 0, true);
    roadShape.closePath();

    const extrudeSettings = {
      depth: this.roadThickness,
      bevelEnabled: false
    };

    const geometry = new ExtrudeGeometry(roadShape, extrudeSettings);
    geometry.rotateX(-Math.PI / 2);

    const material = new MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.8
    });

    this.roadMesh = new Mesh(geometry, material);
    // this.roadGroup.add(this.roadMesh);
  }

  public get() {
    return this.roadGroup;
  }

  public updateRoad(){}
}
