import { Group, LoadingManager, TextureLoader } from "three";
import { TexturePath } from "../interfaces/img-texture.interface";
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

export class BaseScene {
  private loadingManager = new LoadingManager();

  public texturesLoader = new TextureLoader(this.loadingManager);
  public gltfLoader = new GLTFLoader(this.loadingManager);
  public dracoLoader = new DRACOLoader(this.loadingManager);

  public textures: string[] = [];
  public group = new Group();

  constructor() {
    this.dracoLoader.setDecoderPath(import.meta.env.BASE_URL + 'draco/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.loadingProgress()
  }

  public getImgTexture(params: TexturePath) {
    return import.meta.env.BASE_URL + 'textures/' + params.scene + '/' + params.obj + params.map;
  }


  public loadingProgress() {
    this.loadingManager.onProgress = (url, itemsLoaded, total) => {
      // console.log('Caricate al', Math.ceil((itemsLoaded / total) * 100), '%')
    }
  }
}