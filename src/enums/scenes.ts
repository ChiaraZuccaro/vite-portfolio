import { ContactObjs } from "./contacts.enum";
import { DesertObjs } from "./desert.enum";
import { DeskObjs } from "./desk.enum";
import { ProjObjs } from "./projects.enum";

export enum Scenes {
  Desert = 'desert',
  Desk = 'desk',
  Projects = 'projects',
  Contacts = 'contacts'
}

export const ScenesChildren = {
  [Scenes.Desert]: DesertObjs,
  [Scenes.Desk]: DeskObjs,
  [Scenes.Projects]: ProjObjs,
  [Scenes.Contacts]: ContactObjs,
} as const;