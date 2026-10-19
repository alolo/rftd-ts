import * as Phaser from "phaser";
import type { MainScene } from "../main";

export function registerSceneEvents(scene: MainScene) {
  scene.events.off("spawn-skeleton");
  scene.events.on("spawn-skeleton", (x: number, y: number) => {
    scene.enemyManager.spawnSkeleton(x, y);
  });

  scene.events.off("trigger-owl-buff");
  scene.events.on("trigger-owl-buff", () => {
    if (scene.builder.activeTowers.length > 0) {
      const randomTower = Phaser.Utils.Array.GetRandom(
        scene.builder.activeTowers,
      );
      randomTower.applyOwlBuff();
    }
  });

  scene.events.off("spawn-mine");
  scene.events.on(
    "spawn-mine",
    (mx: number, my: number, dmg: number, radius: number) => {
      let spawnX = mx;
      let spawnY = my;
      if (mx === -1 && my === -1) {
        const randIndex = Phaser.Math.Between(0, scene.enemyPath.length - 2);
        const p1 = scene.enemyPath[randIndex];
        const p2 = scene.enemyPath[randIndex + 1];
        const t = Phaser.Math.FloatBetween(0, 1);
        spawnX =
          (p1.col + (p2.col - p1.col) * t) * scene.CELL_SIZE +
          scene.CELL_SIZE / 2;
        spawnY =
          (p1.row + (p2.row - p1.row) * t) * scene.CELL_SIZE +
          scene.CELL_SIZE / 2;
      }
      scene.enemyManager.spawnMine(spawnX, spawnY, dmg, radius);
    },
  );
}