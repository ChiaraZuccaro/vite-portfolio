import { Texture } from "three";
import { ScenesChildren , Scenes } from "@enums/scenes";

export interface TexturePath {
  scene: Scenes,
  obj: typeof ScenesChildren[Scenes],
  map: string
}

export interface TextureMaps {
  map: Texture,
  aoMap?: Texture,
  displacementMap?: Texture,
  normalMap?: Texture,
  roughnessMap?: Texture,
  armMap?: Texture
}