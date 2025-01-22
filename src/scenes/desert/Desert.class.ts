import { Group, Texture } from "three";
import { DesertObjs } from "../../enums/desert.enum";
import { Scenes, ScenesChildren } from "../../enums/scenes";
import { Ground } from "./sub/Ground.class";
import { Mountains } from "./sub/Mountains.class";
import { Road } from "./sub/Road.class";
import { BaseScene } from "../BaseScene.class";

export class Desert extends BaseScene {
  private localeScene: keyof typeof ScenesChildren = Scenes.Desert;
  private localeObjs = ScenesChildren[this.localeScene] as typeof DesertObjs;

  private road = new Road();
  private ground = new Ground();
  private mountains: Group;

  private desertGroup = new Group();

  constructor() {
    super();
    const aoMap = this.getImgTexture({
      scene: this.localeScene,
      obj: this.localeObjs.Mountains,
      map: '/cliff_ao.jpg'
    });
    const colorMap = this.getImgTexture({
      scene: this.localeScene,
      obj: this.localeObjs.Mountains,
      map: '/cliff_color.jpg'
    });
    const displacementMap = this.getImgTexture({
      scene: this.localeScene,
      obj: this.localeObjs.Mountains,
      map: '/cliff_displacement.png'
    });
    const normalMap = this.getImgTexture({
      scene: this.localeScene,
      obj: this.localeObjs.Mountains,
      map: '/cliff_normal.jpg'
    });
    const roughnessMap = this.getImgTexture({
      scene: this.localeScene,
      obj: this.localeObjs.Mountains,
      map: '/cliff_roughness.jpg'
    });
    const armMap = this.getImgTexture({
      scene: this.localeScene,
      obj: this.localeObjs.Mountains,
      map: '/cliff_arm.jpg'
    });

    const mountainsTextureParams = {
      armMap: this.texturesLoader.load(armMap),
      aoMap: this.texturesLoader.load(aoMap),
      colorMap: this.texturesLoader.load(colorMap),
      displacementMap: this.texturesLoader.load(displacementMap),
      normalMap: this.texturesLoader.load(normalMap),
      roughnessMap: this.texturesLoader.load(roughnessMap)
    }
    console.log(this.textures);
    this.textures.push(aoMap, roughnessMap, )
    
    this.mountains = new Mountains(mountainsTextureParams).get();
    
    this.desertGroup.add(this.mountains)
  }

  public init() {
    // this.loadAllTextures();
  }

  public getScene() {
    return this.desertGroup;
  }
}