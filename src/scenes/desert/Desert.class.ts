import { Group, Texture } from "three";
import { DesertObjs } from "../../enums/desert.enum";
import { Scenes, ScenesChildren } from "../../enums/scenes";
import { Ground } from "./sub/Ground.class";
import { Mountains } from "./sub/Mountains.class";
import { Road } from "./sub/Road.class";
import { BaseScene } from "../BaseScene.class";
import { TextureMaps, TexturePath } from "../../interfaces/img-texture.interface";

export class Desert extends BaseScene {
  private localeScene: keyof typeof ScenesChildren = Scenes.Desert;
  private localeObjs = ScenesChildren[this.localeScene] as typeof DesertObjs;

  private road: Group;
  private ground = new Ground();
  private mountains: Group;

  private desertGroup = new Group();

  constructor() {
    super();
    
    this.mountains = this.createMountains();
    this.road = this.createRoad();
    
    this.desertGroup.add(this.mountains, this.road)
  }

  //#region Mountains
  private mountainsParamsTexture(): TextureMaps {
    const imgMountainParams: TexturePath = {
      scene: this.localeScene,
      obj: this.localeObjs.Mountains,
      map: ''
    };

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
    const imgRoadParams: TexturePath = {
      scene: this.localeScene,
      obj: this.localeObjs.Road,
      map: ''
    };

    const colorMapPath = this.getImgTexture({
      ...imgRoadParams, map: '/asphalt_color.jpg'
    });
    const displacementMapPath = this.getImgTexture({
      ...imgRoadParams, map: '/asphalt_displacement.png'
    });
    
    return {
      map: this.texturesLoader.load(colorMapPath),
      displacementMap: this.texturesLoader.load(displacementMapPath)
    }
  }

  private createRoad() {
    const roadTextureParams = this.roadParamsTexture();
    return new Road(roadTextureParams).get();
  }
  //#endregion

  //#region Ground
  private groundParamsTexture() {
    
  }
  //#endregion

  public init() {
    // this.loadAllTextures();
  }

  public getScene() {
    return this.desertGroup;
  }
}