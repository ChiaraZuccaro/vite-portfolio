import { Group, LoadingManager, TextureLoader } from "three";
import { TexturePath } from "../interfaces/img-texture.interface";

export class BaseScene {
  private loadingManager = new LoadingManager();
  public texturesLoader = new TextureLoader(this.loadingManager);

  public textures: string[] = [];
  public group = new Group();

  constructor() {
    this.loadingProgress()
  }

  public getImgTexture(params: TexturePath) {
    return import.meta.env.BASE_URL + 'textures/' + params.scene + '/' + params.obj + params.map;
  }

  // public loadAllTextures () {
  //   for (let i = 0; i < this.textures.length; i++) {
  //     const path = this.textures[i];
  //     this.texturesLoader.load(path);
  //   }
  //   this.loadingProgress()
  // }

  public loadingProgress() {
    this.loadingManager.onProgress = (url, itemsLoaded, total) => {
      console.log(url + ' è stato caricato correttamente ')
    }
  }
}