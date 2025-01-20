import { AmbientLight, DirectionalLight, Group, LoadingManager, PerspectiveCamera, Scene, TextureLoader, WebGLRenderer } from "three";

export class BaseScene {
  private loadingManager = new LoadingManager();
  private texturesLoader = new TextureLoader(this.loadingManager);

  private screen = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  public textures: string[] = [];
  public group = new Group();

  private initLights() {
    const light = new DirectionalLight(0xffffff, .75);
    light.position.set(5,5,10);
    const aLight = new AmbientLight(0xffffff, 0.25);
  }

  private initScenario() {
    const scene = new Scene();
    const camera = new PerspectiveCamera(75, this.screen.width / this.screen.height, 0.3, 4000);
    const render = new WebGLRenderer({
      antialias: window.devicePixelRatio < 2,
      logarithmicDepthBuffer: true
    });
    render.setSize(this.screen.width, this.screen.height);
    camera.position.z = 5;

  }

  public getImgTexture(path: string) {
    return import.meta.env.BASE_URL + path;
  }

  public loadAllTextures () {
    for (let i = 0; i < this.textures.length; i++) {
      const path = this.textures[i];
      this.texturesLoader.load(path);
    }
  }

  public loadingProgress() {
    this.loadingManager.onProgress = (url, itemsLoaded, total) => {
      console.log(url + ' è stato caricato correttamente ')
    }
  }
}