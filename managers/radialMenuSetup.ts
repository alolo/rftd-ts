import { RadialMenu } from "../ui/radialMenu";
import type { MainScene } from "../main";

export function createRadialMenu(scene: MainScene): RadialMenu {
  return new RadialMenu(scene, {
    build1: () => {
      const c = scene.interaction.activeCellCoords;
      if (!c) return;
      scene.builder.buyTower(c.col, c.row, 1, scene.economy.COST_CHEAP);
    },
    build4: () => {
      const c = scene.interaction.activeCellCoords;
      if (!c) return;
      scene.builder.buyTower(c.col, c.row, 4, scene.economy.COST_EXP);
    },
    goCrop: () => {
      scene.radialMenu.switchMode("crop");
    },
    plantPotato: () => {
      const c = scene.interaction.activeCellCoords;
      if (!c) return;
      scene.builder.buyCrop(c.col, c.row, "potato");
    },
    plantOnion: () => {
      const c = scene.interaction.activeCellCoords;
      if (!c) return;
      scene.builder.buyCrop(c.col, c.row, "onion");
    },
    plantPineapple: () => {
      const c = scene.interaction.activeCellCoords;
      if (!c) return;
      scene.builder.buyCrop(c.col, c.row, "pineapple");
    },
    onClose: () => {
      scene.radialMenu.close();
      scene.interaction.activeCellCoords = null;
    },
    quickBuildActivate: (target) => {
      const c = scene.interaction.activeCellCoords;
      if (!c) return;
      scene.interaction.activateQuickBuild(target);
      // Строим первый экземпляр на текущей клетке
      if (target.kind === "tower") {
        scene.builder.buyTower(c.col, c.row, target.level, target.cost);
      } else {
        scene.builder.buyCrop(c.col, c.row, target.cropType);
      }
    },
  });
}
