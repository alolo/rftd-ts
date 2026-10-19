import * as Phaser from "phaser";
import { drawMobFrame } from "./mobDrawers";

export const FRAME_SIZE = 64;
export const FRAME_COUNT = 4;

export const STUDIO_MOB_IDS = Array.from({ length: 40 }, (_, i) => i + 1);

type Direction = "front" | "side" | "back";

function createMobSheet(
  mobId: number,
  direction: Direction,
): HTMLCanvasElement {
  const sheet = document.createElement("canvas");
  sheet.width = FRAME_SIZE * FRAME_COUNT;
  sheet.height = FRAME_SIZE;
  const sheetCtx = sheet.getContext("2d");
  if (!sheetCtx) return sheet;
  sheetCtx.imageSmoothingEnabled = false;

  const temp = document.createElement("canvas");
  temp.width = FRAME_SIZE;
  temp.height = FRAME_SIZE;
  const tempCtx = temp.getContext("2d");
  if (!tempCtx) return sheet;
  tempCtx.imageSmoothingEnabled = false;

  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    drawMobFrame(tempCtx, mobId, frame, { clear: true, direction });
    sheetCtx.drawImage(temp, frame * FRAME_SIZE, 0);
  }

  return sheet;
}

function registerTexture(
  scene: Phaser.Scene,
  mobId: number,
  direction: Direction,
): void {
  const key = `mob_${mobId}_${direction}`;
  const animKey = `${key}_walk`;

  if (scene.textures.exists(key)) return;

  const sheet = createMobSheet(mobId, direction);
  const texture = scene.textures.addCanvas(key, sheet);
  if (!texture) {
    console.warn(`[MobTextures] Не удалось создать ${key}`);
    return;
  }

  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    texture.add(
      `${key}_${frame}`,
      0,
      frame * FRAME_SIZE,
      0,
      FRAME_SIZE,
      FRAME_SIZE,
    );
  }

  if (!scene.anims.exists(animKey)) {
    scene.anims.create({
      key: animKey,
      frames: [0, 1, 2, 3].map((i) => ({ key, frame: `${key}_${i}` })),
      frameRate: 8,
      repeat: -1,
    });
  }
}

export function registerMobTextures(scene: Phaser.Scene) {
  let created = 0;
  let failed = 0;
  for (const mobId of STUDIO_MOB_IDS) {
    for (const direction of ["side", "front", "back"] as Direction[]) {
      try {
        const before = scene.textures.exists(`mob_${mobId}_${direction}`);
        registerTexture(scene, mobId, direction);
        const after = scene.textures.exists(`mob_${mobId}_${direction}`);
        if (after && !before) created++;
        else if (!after) {
          failed++;
          console.warn(`[MobTextures] NOT CREATED: mob_${mobId}_${direction}`);
        }
      } catch (e) {
        failed++;
        console.error(`[MobTextures] FAILED ${mobId}_${direction}:`, e);
      }
    }
  }
  console.log(`[MobTextures] Created: ${created}, Failed: ${failed}, Total textures: ${scene.textures.getTextureKeys().filter((k) => k.startsWith("mob_")).length}`);
}
