import { Group, Texture } from "three";
import { DesertObjs } from "../../enums/desert.enum";
import { Scenes, ScenesChildren } from "../../enums/scenes";
import { Ground } from "./sub/Ground.class";
import { Mountains } from "./sub/Mountains.class";
import { Road } from "./sub/Road.class";
import { BaseScene } from "../BaseScene.class";
import { TextureMaps } from "../../interfaces/img-texture.interface";

export class Desert extends BaseScene {
  private localeScene: keyof typeof ScenesChildren = Scenes.Desert;
  private localeObjs = ScenesChildren[this.localeScene] as typeof DesertObjs;

  private road = new Road();
  private ground = new Ground();
  private mountains: Group;

  private desertGroup = new Group();

  constructor() {
    super();
    
    this.mountains = this.createMountains();
    
    this.desertGroup.add(this.mountains)
  }

  //#region Mountains
  private mountainsParamsTexture(): TextureMaps {
    const aoMapPath = this.getImgTexture({
      scene: this.localeScene,
      obj: this.localeObjs.Mountains,
      map: '/cliff_ao.jpg'
    });
    const colorMapPath = this.getImgTexture({
      scene: this.localeScene,
      obj: this.localeObjs.Mountains,
      map: '/cliff_color.jpg'
    });
    const displacementMapPath = this.getImgTexture({
      scene: this.localeScene,
      obj: this.localeObjs.Mountains,
      map: '/cliff_displacement.png'
    });
    const normalMapPath = this.getImgTexture({
      scene: this.localeScene,
      obj: this.localeObjs.Mountains,
      map: '/cliff_normal.jpg'
    });
    const roughnessMapPath = this.getImgTexture({
      scene: this.localeScene,
      obj: this.localeObjs.Mountains,
      map: '/cliff_roughness.jpg'
    });

    return {
      aoMap: this.texturesLoader.load(aoMapPath),
      colorMap: this.texturesLoader.load(colorMapPath),
      displacementMap: this.texturesLoader.load(displacementMapPath),
      normalMap: this.texturesLoader.load(normalMapPath),
      roughnessMap: this.texturesLoader.load(roughnessMapPath)
    }
  }

  private createMountains() {
    const mountainsTextureParams = this.mountainsParamsTexture();
    return new Mountains(mountainsTextureParams).get();
  }
  //#endregion

  //#region Road
  private roadParamsTexture() {

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