import { TextureMaps } from "@interfaces/img-texture.interface";
import { createNoise2D } from "simplex-noise";
import { Group, Mesh, MeshNormalMaterial, MeshStandardMaterial, PlaneGeometry, TorusGeometry } from "three";
import * as dat from 'lil-gui';

export class Ground {
  private groundGroup = new Group();
  private geometry = new TorusGeometry(150, 150, 150, 150);
  private noiseGround = createNoise2D();

  private guiParams = {
    amplitude: 10,
    frequency: {
      x: 1,
      z: 1
    },
    persistance: .5,
    lacunarity: 2
  };

  constructor(allTextures: TextureMaps) {
    this.GUI();

    if(allTextures) {
      const material = this.createGroundMaterial(allTextures);
      this.geometry.rotateX(- Math.PI / 2)

      this.updateGeometry();
      
      const mesh = new Mesh(this.geometry, material);
      this.groundGroup.add(mesh);
    }
  }

  private GUI() {
    const gui = new dat.GUI();
    
    gui.add(this.guiParams, 'amplitude', 0, 100).onChange(() => this.updateGeometry());
    gui.add(this.guiParams.frequency, 'x', 0.1, 2).onChange(() => this.updateGeometry());
    gui.add(this.guiParams.frequency, 'z', 0.1, 2).onChange(() => this.updateGeometry());
    gui.add(this.guiParams, 'persistance', 0.1, 4).onChange(() => this.updateGeometry());
    gui.add(this.guiParams, 'lacunarity', 0.1, 4).onChange(() => this.updateGeometry());
  }

  private createGroundMaterial(textures: TextureMaps) {
    return new MeshStandardMaterial({
      ...textures,
      // displacementScale: .2,
      // roughness: 1,
      // wireframe: true
    });
  }

  private updateGeometry() {
    const position = this.geometry.getAttribute('position');
    let { x: fx, z: fz } = this.guiParams.frequency;
    const innerRadius = 85;
    const outerRadius = 150;

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);

      const distanceFromCenter = Math.sqrt(x**2 + z**2);

      let y = 0;
      if(distanceFromCenter >= innerRadius && distanceFromCenter <= outerRadius) {
        y = 0;
      } else {
        for (let j = 0; j <= 3; j++) {
          const amplitude = this.guiParams.amplitude * this.guiParams.persistance ** j ;
          let frequency = this.guiParams.lacunarity ** j
          y += this.noiseGround(x * fx * .005 * frequency, z * fz * .005 * frequency) * amplitude;
        }
      }

      position.setY(i, y);
    }

    position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }
  
  public get(){
    return this.groundGroup;
  }
}