import { BoxHelper, Group, PerspectiveCamera } from "three";
import { DesertObjs } from "@enums/desert.enum";
import { Scenes } from "@enums/scenes";
import { Ground } from "./sub/Ground.class";
import { Mountains } from "./sub/Mountains.class";
import { Road } from "./sub/Road.class";
import { BaseScene } from "@scenes/BaseScene.class";
import { TextureMaps, TexturePath } from "@interfaces/img-texture.interface";
import { createNoise2D } from "simplex-noise";
import { GLTF } from "three/examples/jsm/Addons.js";

export class Desert extends BaseScene {
  private localeScene = Scenes.Desert;
  private desertGroup = new Group();
  
  private ground: Ground;
  private road: Road;
  private cactus: GLTF;

  private camera: PerspectiveCamera;
  
  constructor(camera: PerspectiveCamera) {
    super();
    // const obj3DPath = import.meta.env.BASE_URL + 'obj3D/' + 'cactus.glb';
    const obj3DPath = import.meta.env.BASE_URL + 'obj3D/' + 'realistic.glb';
    const obj3DDracoPath = import.meta.env.BASE_URL + 'obj3D/' + 'cactus-v1.glb';
    this.gltf.load(obj3DPath, (gltf) => {
      gltf.scene.scale.set(10,10,10)
      this.cactus = gltf;
      this.desertGroup.add(this.cactus.scene)
    });
    

    this.camera = camera;
    
    const mountains = this.createMountains();
    this.road = this.createRoad();
    this.ground = this.createGround();
    
    this.desertGroup.add(this.ground.get(), this.road.get())
  }

  private defaultImgParams(obj: DesertObjs): TexturePath {
    return { scene: this.localeScene, obj, map: '' }
  }


  //#region Mountains
  private mountainsParamsTexture(): TextureMaps {
    const imgMountainParams = this.defaultImgParams(DesertObjs.Mountains);

    const aoMapPath = this.getImgTexture({
      ...imgMountainParams, map: '/cliff_ao.jpg'
    });
    const colorMapPath = this.getImgTexture({
      ...imgMountainParams, map: '/cliff_color.jpg'
    });
    const displacementMapPath = this.getImgTexture({
      ...imgMountainParams, map: '/cliff_displacement.png'
    });
    const normalMapPath = this.getImgTexture({
      ...imgMountainParams, map: '/cliff_normal.jpg'
    });

    return {
      color: '#F69850',
      aoMap: this.texturesLoader.load(aoMapPath),
      map: this.texturesLoader.load(colorMapPath),
      displacementMap: this.texturesLoader.load(displacementMapPath),
      normalMap: this.texturesLoader.load(normalMapPath),
    }
  }

  private createMountains() {
    const mountainsTextureParams = this.mountainsParamsTexture();
    return new Mountains(mountainsTextureParams).get();
  }
  //#endregion

  //#region Road
  private roadParamsTexture(): TextureMaps {
    const imgRoadParams = this.defaultImgParams(DesertObjs.Road);

    const colorMapPath = this.getImgTexture({
      ...imgRoadParams, map: '/asphalt_color.jpg'
    });
    const displacementMapPath = this.getImgTexture({
      ...imgRoadParams, map: '/asphalt_displacement.png'
    });

    return {
      color: '#333333',
      map: this.texturesLoader.load(colorMapPath),
      displacementMap: this.texturesLoader.load(displacementMapPath)
    }
  }

  private createRoad() {
    const roadTextureParams = this.roadParamsTexture();
    return new Road(this.camera, roadTextureParams);
  }
  //#endregion

  //#region Ground
  private groundParamsTexture(): TextureMaps {
    const imgGroundParams = this.defaultImgParams(DesertObjs.Ground);

    const colorMapPath = this.getImgTexture({
      ...imgGroundParams, map: '/sand_color.jpg'
    });
    const displacementMapPath = this.getImgTexture({
      ...imgGroundParams, map: '/sand_displacement.png'
    });
    const aoMapPath = this.getImgTexture({
      ...imgGroundParams, map: '/sand_ao.jpg'
    });
    const normalMapPath = this.getImgTexture({
      ...imgGroundParams, map: '/sand_normal.jpg'
    });

    return {
      color: '#EFBE87',
      map: this.texturesLoader.load(colorMapPath),
      displacementMap: this.texturesLoader.load(displacementMapPath),
      aoMap: this.texturesLoader.load(aoMapPath),
      normalMap: this.texturesLoader.load(normalMapPath)
    }
  }
  
  private createGround() {
    const groundTextureParams = this.groundParamsTexture();
    return new Ground(this.camera, groundTextureParams);
  }
  //#endregion

  public init() {
    // this.loadAllTextures();
  }

  public getScene() {
    return this.desertGroup;
  }

  public updateScene() {
    this.ground.trackCamera();
    this.road.updateRoad();
  }
}